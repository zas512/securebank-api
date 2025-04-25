"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const requireAuth_1 = __importDefault(require("../middlewares/requireAuth"));
const router = (0, express_1.Router)();
// All routes require authentication
router.use(requireAuth_1.default);
router.get("/get", transaction_controller_1.getTransactions);
router.get("/:transactionId", transaction_controller_1.getTransactionDetails);
exports.default = router;
