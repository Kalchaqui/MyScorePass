// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CreditScoring.sol";
import "./LendingPool.sol";
import "./InsurancePool.sol";

interface IERC20Loan {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

/**
 * @title LoanManager
 * @dev Gestión de préstamos individuales P2P
 */
contract LoanManager {
    
    address public owner;
    bool private locked;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier nonReentrant() {
        require(!locked, "No reentrancy");
        locked = true;
        _;
        locked = false;
    }
    
    // Estados del préstamo
    enum LoanStatus {
        Pending,
        Active,
        Repaid,
        Defaulted
    }
    
    // Estructura de préstamo con sistema de cuotas
    struct Loan {
        uint256 loanId;
        address borrower;
        uint256 principal;
        uint256 interestRate; // Tasa anual en basis points (800 = 8%)
        uint256 numberOfInstallments; // 1 (pago único), 3, 6, o 12 cuotas
        uint256 installmentsPaid; // Cuotas pagadas
        uint256 installmentAmount; // Monto de cada cuota
        uint256 nextPaymentDue; // Fecha del próximo pago
        uint256 startTime;
        uint256 amountRepaid;
        LoanStatus status;
        bool exists;
    }
    
    CreditScoring public creditScoring;
    LendingPool public lendingPool;
    InsurancePool public insurancePool;
    IERC20Loan public stablecoin;
    
    // Mapeo de loanId a préstamo
    mapping(uint256 => Loan) public loans;
    
    // Mapeo de usuario a sus préstamos
    mapping(address => uint256[]) public userLoans;
    
    // Contador de préstamos
    uint256 public loanCounter;
    
    // Tasas de interés por cantidad de cuotas (en basis points)
    uint256 public constant RATE_SINGLE = 500;     // 5% para pago único
    uint256 public constant RATE_3_INSTALLMENTS = 800;   // 8% APY para 3 cuotas
    uint256 public constant RATE_6_INSTALLMENTS = 1200;  // 12% APY para 6 cuotas
    uint256 public constant RATE_12_INSTALLMENTS = 1800; // 18% APY para 12 cuotas
    
    // Cuotas permitidas
    uint256[] public allowedInstallments = [1, 3, 6, 12];
    
    // Tasas por nivel de score (backup para sistema antiguo)
    uint256 public lowScoreRate = 1800; // 18% para scores bajos
    uint256 public midScoreRate = 1200; // 12% para scores medios
    uint256 public highScoreRate = 800;  // 8% para scores altos
    
    // Umbrales de score
    uint256 public constant LOW_SCORE_THRESHOLD = 400;
    uint256 public constant MID_SCORE_THRESHOLD = 700;
    
    // Penalización por default (puntos de score)
    uint256 public defaultPenalty = 200;
    
    // Recompensa por repago a tiempo (puntos de score)
    uint256 public onTimeReward = 50;
    
    // Eventos
    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 installments);
    event LoanDisbursed(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 timestamp);
    event InstallmentPaid(uint256 indexed loanId, address indexed borrower, uint256 installmentNumber, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 timestamp);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower, uint256 timestamp);
    event InterestRatesUpdated(uint256 lowRate, uint256 midRate, uint256 highRate);
    
    constructor(
        address _creditScoring,
        address _lendingPool,
        address _insurancePool,
        address _stablecoin
    ) {
        owner = msg.sender;
        require(_creditScoring != address(0), "Invalid creditScoring address");
        require(_lendingPool != address(0), "Invalid lendingPool address");
        require(_insurancePool != address(0), "Invalid insurancePool address");
        require(_stablecoin != address(0), "Invalid stablecoin address");
        
        creditScoring = CreditScoring(_creditScoring);
        lendingPool = LendingPool(_lendingPool);
        insurancePool = InsurancePool(_insurancePool);
        stablecoin = IERC20Loan(_stablecoin);
    }
    
    /**
     * @dev Solicitar un préstamo con sistema de cuotas
     * @param _amount Monto solicitado
     * @param _installments Número de cuotas (1, 3, 6, o 12)
     */
    function requestLoan(uint256 _amount, uint256 _installments) external nonReentrant returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(_isInstallmentsAllowed(_installments), "Invalid number of installments");
        
        // NIVEL 2: Verificar que NO esté en blacklist
        require(!creditScoring.isBlacklisted(msg.sender), "User is blacklisted");
        
        // Verificar que el usuario tenga score
        (uint256 score, uint256 maxLoanAmount,) = creditScoring.getScore(msg.sender);
        require(score > 0, "No credit score found");
        
        // Verificar que el monto esté dentro del límite
        require(_amount <= maxLoanAmount, "Amount exceeds credit limit");
        
        // NIVEL 3: Calcular prima de seguro (1% del préstamo)
        uint256 insurancePremium = (_amount * 100) / 10000; // 1%
        uint256 totalNeeded = _amount + insurancePremium;
        
        // Verificar liquidez del pool
        require(lendingPool.getAvailableLiquidity() >= totalNeeded, "Insufficient pool liquidity");
        
        // Verificar que no tenga préstamos activos
        require(!_hasActiveLoan(msg.sender), "Already has active loan");
        
        // Obtener tasa de interés según número de cuotas
        uint256 interestRate = _getInterestRateByInstallments(_installments);
        
        // Calcular monto de cada cuota
        uint256 installmentAmount = _calculateInstallmentAmount(_amount, _installments, interestRate);
        
        // Crear préstamo
        loanCounter++;
        uint256 loanId = loanCounter;
        
        loans[loanId] = Loan({
            loanId: loanId,
            borrower: msg.sender,
            principal: _amount,
            interestRate: interestRate,
            numberOfInstallments: _installments,
            installmentsPaid: 0,
            installmentAmount: installmentAmount,
            nextPaymentDue: block.timestamp + 30 days, // Primera cuota en 30 días
            startTime: block.timestamp,
            amountRepaid: 0,
            status: LoanStatus.Pending,
            exists: true
        });
        
        userLoans[msg.sender].push(loanId);
        
        emit LoanRequested(loanId, msg.sender, _amount, _installments);
        
        // Desembolsar inmediatamente
        _disburseLoan(loanId);
        
        return loanId;
    }
    
    /**
     * @dev Desembolsar préstamo
     */
    function _disburseLoan(uint256 _loanId) internal {
        Loan storage loan = loans[_loanId];
        require(loan.exists, "Loan does not exist");
        require(loan.status == LoanStatus.Pending, "Loan not pending");
        
        // Actualizar estado
        loan.status = LoanStatus.Active;
        loan.startTime = block.timestamp;
        
        // NIVEL 3: Cobrar prima de seguro (1%)
        uint256 premium = (loan.principal * 100) / 10000;
        
        // Desembolsar desde el pool (monto + prima)
        lendingPool.disburseLoan(loan.borrower, loan.principal);
        
        // Transferir prima al fondo de seguros
        lendingPool.disburseLoan(address(this), premium);
        stablecoin.approve(address(insurancePool), premium);
        insurancePool.collectPremium(_loanId, loan.principal);
        
        emit LoanDisbursed(_loanId, loan.borrower, loan.principal, block.timestamp);
    }
    
    /**
     * @dev Pagar una cuota del préstamo
     * @param _loanId ID del préstamo
     */
    function payInstallment(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.exists, "Loan does not exist");
        require(loan.borrower == msg.sender, "Not loan borrower");
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(loan.installmentsPaid < loan.numberOfInstallments, "Loan already fully paid");
        
        uint256 paymentAmount = loan.installmentAmount;
        
        // Transferir cuota al contrato
        require(stablecoin.transferFrom(msg.sender, address(this), paymentAmount), "Transfer failed");
        
        // Actualizar préstamo
        loan.installmentsPaid++;
        loan.amountRepaid += paymentAmount;
        
        // Si es la última cuota, cerrar el préstamo
        if (loan.installmentsPaid >= loan.numberOfInstallments) {
            // Aprobar y transferir todo al pool
            uint256 totalInterest = loan.amountRepaid - loan.principal;
            stablecoin.approve(address(lendingPool), loan.amountRepaid);
            lendingPool.receiveLoanRepayment(msg.sender, loan.principal, totalInterest);
            
            loan.status = LoanStatus.Repaid;
            
            // Recompensar score por completar el préstamo
            creditScoring.rewardScore(msg.sender, onTimeReward);
            
            emit LoanRepaid(_loanId, msg.sender, loan.amountRepaid, block.timestamp);
        } else {
            // Actualizar fecha de próximo pago
            loan.nextPaymentDue = block.timestamp + 30 days;
            
            emit InstallmentPaid(_loanId, msg.sender, loan.installmentsPaid, paymentAmount);
        }
    }
    
    /**
     * @dev Repagar préstamo completo (todas las cuotas restantes)
     * @param _loanId ID del préstamo
     */
    function repayLoanFull(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.exists, "Loan does not exist");
        require(loan.borrower == msg.sender, "Not loan borrower");
        require(loan.status == LoanStatus.Active, "Loan not active");
        
        // Calcular cuotas restantes
        uint256 remainingInstallments = loan.numberOfInstallments - loan.installmentsPaid;
        uint256 remainingAmount = remainingInstallments * loan.installmentAmount;
        
        // Transferir fondos al contrato
        require(stablecoin.transferFrom(msg.sender, address(this), remainingAmount), "Transfer failed");
        
        // Actualizar préstamo
        loan.amountRepaid += remainingAmount;
        loan.installmentsPaid = loan.numberOfInstallments;
        loan.status = LoanStatus.Repaid;
        
        // Aprobar y transferir al pool
        uint256 totalInterest = loan.amountRepaid - loan.principal;
        stablecoin.approve(address(lendingPool), loan.amountRepaid);
        lendingPool.receiveLoanRepayment(msg.sender, loan.principal, totalInterest);
        
        // Recompensar score
        creditScoring.rewardScore(msg.sender, onTimeReward);
        
        emit LoanRepaid(_loanId, msg.sender, loan.amountRepaid, block.timestamp);
    }
    
    /**
     * @dev NIVEL 2 + 3: Marcar préstamo como impago y activar protecciones
     * @param _loanId ID del préstamo
     */
    function markAsDefaulted(uint256 _loanId) external {
        Loan storage loan = loans[_loanId];
        require(loan.exists, "Loan does not exist");
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(block.timestamp > loan.nextPaymentDue + 7 days, "Grace period not over");
        
        // Calcular monto no pagado
        uint256 unpaidInstallments = loan.numberOfInstallments - loan.installmentsPaid;
        uint256 unpaidAmount = unpaidInstallments * loan.installmentAmount;
        
        // NIVEL 3: Intentar cubrir con fondo de seguros
        bool covered = insurancePool.coverDefault(
            loan.borrower,
            _loanId,
            unpaidAmount,
            address(lendingPool)
        );
        
        // Marcar como impago
        loan.status = LoanStatus.Defaulted;
        
        // NIVEL 2: Penalizar score y registrar públicamente
        creditScoring.penalizeScore(loan.borrower, defaultPenalty);
        
        emit LoanDefaulted(_loanId, loan.borrower, block.timestamp);
        
        // Si NO se pudo cubrir, emitir alerta
        if (!covered) {
            // El pool absorbe la pérdida
            // En frontend se mostrará warning
        }
    }
    
    /**
     * @dev Calcular monto de cada cuota
     */
    function _calculateInstallmentAmount(
        uint256 principal,
        uint256 installments,
        uint256 rate
    ) internal pure returns (uint256) {
        // Calcular interés total: principal * rate * (meses/12)
        uint256 totalInterest = (principal * rate * installments) / (12 * 10000);
        
        // Total a pagar = principal + interés
        uint256 totalAmount = principal + totalInterest;
        
        // Cuota = total / número de cuotas
        return totalAmount / installments;
    }
    
    /**
     * @dev Obtener tasa de interés según número de cuotas
     */
    function _getInterestRateByInstallments(uint256 installments) internal pure returns (uint256) {
        if (installments == 1) {
            return RATE_SINGLE;        // 5%
        } else if (installments == 3) {
            return RATE_3_INSTALLMENTS; // 8%
        } else if (installments == 6) {
            return RATE_6_INSTALLMENTS; // 12%
        } else if (installments == 12) {
            return RATE_12_INSTALLMENTS; // 18%
        }
        return RATE_SINGLE;
    }
    
    /**
     * @dev Calcular monto total a repagar
     */
    function calculateTotalRepayment(uint256 _loanId) external view returns (uint256) {
        Loan memory loan = loans[_loanId];
        require(loan.exists, "Loan does not exist");
        
        uint256 remainingInstallments = loan.numberOfInstallments - loan.installmentsPaid;
        return remainingInstallments * loan.installmentAmount;
    }
    
    /**
     * @dev Obtener detalle de cuotas del préstamo
     */
    function getLoanInstallmentInfo(uint256 _loanId) external view returns (
        uint256 totalInstallments,
        uint256 paidInstallments,
        uint256 installmentAmount,
        uint256 remainingAmount,
        uint256 nextPaymentDue
    ) {
        Loan memory loan = loans[_loanId];
        require(loan.exists, "Loan does not exist");
        
        uint256 remaining = loan.numberOfInstallments - loan.installmentsPaid;
        
        return (
            loan.numberOfInstallments,
            loan.installmentsPaid,
            loan.installmentAmount,
            remaining * loan.installmentAmount,
            loan.nextPaymentDue
        );
    }
    
    /**
     * @dev Obtener información de un préstamo
     */
    function getLoanInfo(uint256 _loanId) external view returns (
        address borrower,
        uint256 principal,
        uint256 interestRate,
        uint256 numberOfInstallments,
        uint256 installmentsPaid,
        uint256 installmentAmount,
        uint256 nextPaymentDue,
        LoanStatus status
    ) {
        Loan memory loan = loans[_loanId];
        require(loan.exists, "Loan does not exist");
        
        return (
            loan.borrower,
            loan.principal,
            loan.interestRate,
            loan.numberOfInstallments,
            loan.installmentsPaid,
            loan.installmentAmount,
            loan.nextPaymentDue,
            loan.status
        );
    }
    
    /**
     * @dev Obtener préstamos de un usuario
     */
    function getUserLoans(address _user) external view returns (uint256[] memory) {
        return userLoans[_user];
    }
    
    /**
     * @dev Verificar si el usuario tiene un préstamo activo
     */
    function _hasActiveLoan(address _user) internal view returns (bool) {
        uint256[] memory loanIds = userLoans[_user];
        for (uint256 i = 0; i < loanIds.length; i++) {
            if (loans[loanIds[i]].status == LoanStatus.Active) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Verificar si el número de cuotas es permitido
     */
    function _isInstallmentsAllowed(uint256 _installments) internal view returns (bool) {
        for (uint256 i = 0; i < allowedInstallments.length; i++) {
            if (allowedInstallments[i] == _installments) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Obtener tasa de interés según score
     */
    function _getInterestRateByScore(uint256 _score) internal view returns (uint256) {
        if (_score < LOW_SCORE_THRESHOLD) {
            return lowScoreRate;
        } else if (_score < MID_SCORE_THRESHOLD) {
            return midScoreRate;
        } else {
            return highScoreRate;
        }
    }
    
    /**
     * @dev Actualizar tasas de interés (solo owner)
     */
    function updateInterestRates(uint256 _low, uint256 _mid, uint256 _high) external onlyOwner {
        require(_low >= _mid && _mid >= _high, "Rates must be descending");
        require(_low <= 5000, "Rate too high"); // Máximo 50%
        
        lowScoreRate = _low;
        midScoreRate = _mid;
        highScoreRate = _high;
        
        emit InterestRatesUpdated(_low, _mid, _high);
    }
    
    /**
     * @dev Actualizar cuotas permitidas (solo owner)
     */
    function updateAllowedInstallments(uint256[] memory _installments) external onlyOwner {
        allowedInstallments = _installments;
    }
}


