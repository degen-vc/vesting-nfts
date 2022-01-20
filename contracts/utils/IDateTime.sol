// SPDX-License-Identifier: MIT LICENSE
pragma solidity ^0.8.0;

interface IDateTime {
    function getYear(uint256 timestamp) external pure returns (uint16);

    function getMonth(uint256 timestamp) external pure returns (uint16);

    function getDay(uint256 timestamp) external pure returns (uint16);

    function getHour(uint256 timestamp) external pure returns (uint16);

    function getMinute(uint256 timestamp) external pure returns (uint16);

    function getSecond(uint256 timestamp) external pure returns (uint16);
}
