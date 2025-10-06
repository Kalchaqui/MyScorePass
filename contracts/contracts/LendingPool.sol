// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20Pool {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title LendingPool
 * @dev Pool de liquidez P2P para préstamos en stablecoins (USDC/USDT)
 * Los prestamistas depositan fondos y ganan intereses
 * Los prestatarios toman préstamos pagando intereses
 */
contract LendingPool {
    
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
    
    // Estructura de depósito de prestamista
    struct Deposit {
        uint256 amount;
        uint256 depositedAt;
        uint256 interestEarned;
    }
    
    // Token stablecoin del pool (USDC o USDT)
    IERC20Pool public stablecoin;
    
    // Mapeo de prestamistas a sus depósitos
    mapping(address => Deposit) public deposits;
    
    // Total depositado en el pool
    uint256 public totalDeposits;
    
    // Total prestado del pool
    uint256 public totalBorrowed;
    
    // Tasa de interés anual para prestamistas (en basis points, 500 = 5%)
    uint256 public lenderAPY = 500; // 5%
    
    // Dirección del contrato LoanManager autorizado
    address public loanManager;
    
    // Eventos
    event Deposited(address indexed lender, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed lender, uint256 amount, uint256 interest, uint256 timestamp);
    event LoanDisbursed(address indexed borrower, uint256 amount, uint256 timestamp);
    event LoanRepaid(address indexed borrower, uint256 amount, uint256 interest, uint256 timestamp);
    event LenderAPYUpdated(uint256 oldAPY, uint256 newAPY);
    
    modifier onlyLoanManager() {
        require(msg.sender == loanManager, "Only LoanManager can call");
        _;
    }
    
    constructor(address _stablecoin) {
        owner = msg.sender;
        require(_stablecoin != address(0), "Invalid stablecoin address");
        stablecoin = IERC20Pool(_stablecoin);
    }
    
    /**
     * @dev Establecer dirección del LoanManager
     */
    function setLoanManager(address _loanManager) external onlyOwner {
        require(_loanManager != address(0), "Invalid address");
        loanManager = _loanManager;
    }
    
    /**
     * @dev Depositar fondos en el pool (prestamista)
     * @param _amount Cantidad de stablecoin a depositar
     */
    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        
        // Calcular intereses pendientes si ya tiene un depósito
        if (deposits[msg.sender].amount > 0) {
            uint256 pendingInterest = calculateInterest(msg.sender);
            deposits[msg.sender].interestEarned += pendingInterest;
        }
        
        // Transferir tokens al contrato
        require(stablecoin.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        // Actualizar depósito
        deposits[msg.sender].amount += _amount;
        deposits[msg.sender].depositedAt = block.timestamp;
        
        totalDeposits += _amount;
        
        emit Deposited(msg.sender, _amount, block.timestamp);
    }
    
    /**
     * @dev Retirar fondos del pool (prestamista)
     * @param _amount Cantidad a retirar
     */
    function withdraw(uint256 _amount) external nonReentrant {
        require(deposits[msg.sender].amount >= _amount, "Insufficient balance");
        require(_amount > 0, "Amount must be greater than 0");
        
        // Verificar liquidez disponible
        uint256 availableLiquidity = getAvailableLiquidity();
        require(availableLiquidity >= _amount, "Insufficient pool liquidity");
        
        // Calcular intereses
        uint256 interest = calculateInterest(msg.sender);
        uint256 totalInterest = deposits[msg.sender].interestEarned + interest;
        
        // Actualizar depósito
        deposits[msg.sender].amount -= _amount;
        deposits[msg.sender].interestEarned = 0;
        deposits[msg.sender].depositedAt = block.timestamp;
        
        totalDeposits -= _amount;
        
        // Transferir principal + intereses
        uint256 totalWithdrawal = _amount + totalInterest;
        require(stablecoin.transfer(msg.sender, totalWithdrawal), "Transfer failed");
        
        emit Withdrawn(msg.sender, _amount, totalInterest, block.timestamp);
    }
    
    /**
     * @dev Desembolsar préstamo (solo LoanManager)
     * @param _borrower Dirección del prestatario
     * @param _amount Monto del préstamo
     */
    function disburseLoan(address _borrower, uint256 _amount) external onlyLoanManager nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(getAvailableLiquidity() >= _amount, "Insufficient pool liquidity");
        
        totalBorrowed += _amount;
        
        require(stablecoin.transfer(_borrower, _amount), "Transfer failed");
        
        emit LoanDisbursed(_borrower, _amount, block.timestamp);
    }
    
    /**
     * @dev Recibir repago de préstamo (solo LoanManager)
     * @param _borrower Dirección del prestatario
     * @param _principal Monto principal
     * @param _interest Monto de intereses
     */
    function receiveLoanRepayment(address _borrower, uint256 _principal, uint256 _interest) external onlyLoanManager nonReentrant {
        require(_principal > 0, "Principal must be greater than 0");
        
        totalBorrowed -= _principal;
        
        // Los intereses quedan en el pool para los prestamistas
        // El principal reduce el total borrowed
        
        emit LoanRepaid(_borrower, _principal, _interest, block.timestamp);
    }
    
    /**
     * @dev Calcular intereses pendientes de un prestamista
     * @param _lender Dirección del prestamista
     */
    function calculateInterest(address _lender) public view returns (uint256) {
        Deposit memory dep = deposits[_lender];
        if (dep.amount == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - dep.depositedAt;
        uint256 interest = (dep.amount * lenderAPY * timeElapsed) / (365 days * 10000);
        
        return interest;
    }
    
    /**
     * @dev Obtener liquidez disponible en el pool
     */
    function getAvailableLiquidity() public view returns (uint256) {
        uint256 balance = stablecoin.balanceOf(address(this));
        return balance;
    }
    
    /**
     * @dev Obtener información del depósito de un prestamista
     */
    function getDepositInfo(address _lender) external view returns (
        uint256 amount,
        uint256 depositedAt,
        uint256 totalInterest
    ) {
        Deposit memory dep = deposits[_lender];
        uint256 pendingInterest = calculateInterest(_lender);
        return (
            dep.amount,
            dep.depositedAt,
            dep.interestEarned + pendingInterest
        );
    }
    
    /**
     * @dev Actualizar APY para prestamistas (solo owner)
     * @param _newAPY Nuevo APY en basis points (500 = 5%)
     */
    function updateLenderAPY(uint256 _newAPY) external onlyOwner {
        require(_newAPY <= 5000, "APY too high"); // Máximo 50%
        
        uint256 oldAPY = lenderAPY;
        lenderAPY = _newAPY;
        
        emit LenderAPYUpdated(oldAPY, _newAPY);
    }
    
    /**
     * @dev Obtener utilización del pool (porcentaje prestado)
     */
    function getUtilizationRate() external view returns (uint256) {
        if (totalDeposits == 0) return 0;
        return (totalBorrowed * 10000) / totalDeposits; // En basis points
    }
}


