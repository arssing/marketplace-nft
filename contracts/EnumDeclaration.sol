// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

    enum OrderStatus {
        unknown,
        onSale,
        cancelled,
        sold
    }

    enum AuctionStatus {
        unknown,
        onAuction,
        finished
    }