// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20Insurance {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title InsurancePool
 * @dev NIVEL 3: Fondo de seguros para cubrir defaults
 * Acumula 1% de cada préstamo como prima de seguro
 */
contract InsurancePool {
    
    address public owner;
    address public loanManager;
    IERC20Insurance public stablecoin;
    
    // Balance del fondo de seguros
    uint256 public insuranceFund;
    
    // Total cubierto por el fondo
    uint256 public totalCovered;
    
    // Defaults cubiertos
    uint256 public defaultsCovered;
    
    // Prima de seguro (1% del monto del préstamo)
    uint256 public constant INSURANCE_PREMIUM_RATE = 100; // 1% en basis points
    
    // Eventos
    event PremiumCollected(uint256 indexed loanId, uint256 amount, uint256 timestamp);
    event DefaultCovered(address indexed borrower, uint256 loanId, uint256 amount, uint256 timestamp);
    event FundWithdrawn(address indexed to, uint256 amount, uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyLoanManager() {
        require(msg.sender == loanManager, "Only LoanManager");
        _;
    }
    
    constructor(address _stablecoin) {
        owner = msg.sender;
        require(_stablecoin != address(0), "Invalid stablecoin");
        stablecoin = IERC20Insurance(_stablecoin);
    }
    
    /**
     * @dev Establecer LoanManager autorizado
     */
    function setLoanManager(address _loanManager) external onlyOwner {
        require(_loanManager != address(0), "Invalid address");
        loanManager = _loanManager;
    }
    
    /**
     * @dev NIVEL 3: Cobrar prima de seguro al desembolsar préstamo
     * @param _loanId ID del préstamo
     * @param _loanAmount Monto del préstamo
     */
    function collectPremium(uint256 _loanId, uint256 _loanAmount) external onlyLoanManager {
        // Calcular prima (1% del monto)
        uint256 premium = (_loanAmount * INSURANCE_PREMIUM_RATE) / 10000;
        
        // Transferir prima del LoanManager al fondo
        require(stablecoin.transferFrom(msg.sender, address(this), premium), "Transfer failed");
        
        insuranceFund += premium;
        
        emit PremiumCollected(_loanId, premium, block.timestamp);
    }
    
    /**
     * @dev NIVEL 3: Cubrir default desde el fondo
     * @param _borrower Dirección del prestatario moroso
     * @param _loanId ID del préstamo
     * @param _amount Monto a cubrir
     * @param _poolAddress Dirección del LendingPool para reembolsar
     */
    function coverDefault(
        address _borrower,
        uint256 _loanId,
        uint256 _amount,
        address _poolAddress
    ) external onlyLoanManager returns (bool) {
        // Verificar si hay fondos suficientes
        if (insuranceFund < _amount) {
            return false; // No hay fondos para cubrir
        }
        
        // Transferir del fondo al pool
        require(stablecoin.transfer(_poolAddress, _amount), "Transfer failed");
        
        insuranceFund -= _amount;
        totalCovered += _amount;
        defaultsCovered++;
        
        emit DefaultCovered(_borrower, _loanId, _amount, block.timestamp);
        
        return true;
    }
    
    /**
     * @dev Obtener información del fondo
     */
    function getFundInfo() external view returns (
        uint256 balance,
        uint256 covered,
        uint256 count,
        uint256 coverageRatio
    ) {
        uint256 ratio = totalCovered > 0 ? 
            (insuranceFund * 10000) / totalCovered : 10000;
        
        return (
            insuranceFund,
            totalCovered,
            defaultsCovered,
            ratio
        );
    }
    
    /**
     * @dev Verificar si el fondo puede cubrir un monto
     */
    function canCover(uint256 _amount) external view returns (bool) {
        return insuranceFund >= _amount;
    }
    
    /**
     * @dev Retirar exceso del fondo (solo owner, emergencia)
     */
    function withdrawExcess(uint256 _amount) external onlyOwner {
        require(_amount <= insuranceFund, "Insufficient fund");
        require(stablecoin.transfer(owner, _amount), "Transfer failed");
        
        insuranceFund -= _amount;
        
        emit FundWithdrawn(owner, _amount, block.timestamp);
    }
}
