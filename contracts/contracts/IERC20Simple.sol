// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IERC20Simple
 * @dev Interfaz ERC20 simple compartida por todos los contratos
 */
interface IERC20Simple {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}
