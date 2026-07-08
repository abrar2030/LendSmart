// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title Migrations
 * @notice Standard Truffle migrations bookkeeping contract. Deployed first by
 *         migrations/1_initial_migration.js and used by Truffle to track which
 *         migrations have run.
 */
contract Migrations {
    address public owner = msg.sender;
    uint256 public last_completed_migration;

    modifier restricted() {
        require(
            msg.sender == owner,
            "Migrations: caller is not the migrations owner"
        );
        _;
    }

    function setCompleted(uint256 completed) public restricted {
        last_completed_migration = completed;
    }
}
