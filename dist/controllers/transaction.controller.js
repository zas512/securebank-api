"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTransaction = exports.getTransactions = exports.getTransactionDetails = void 0;
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const account_model_1 = __importDefault(require("../models/account.model"));
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const verifyPin_1 = require("../utils/verifyPin");
const getTransactionDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { transactionId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, responseHelper_1.default)(res, 401, false, "Unauthorized");
            return;
        }
        // Get user's accounts
        const userAccounts = yield account_model_1.default.find({ userId });
        const accountIds = userAccounts.map((account) => account._id);
        const transaction = yield transaction_model_1.default.findOne({
            _id: transactionId,
            $or: [
                { accountId: { $in: accountIds } },
                { fromAccountId: { $in: accountIds } },
                { toAccountId: { $in: accountIds } }
            ]
        })
            .populate("accountId", "number type")
            .populate("fromAccountId", "number type")
            .populate("toAccountId", "number type");
        if (!transaction) {
            (0, responseHelper_1.default)(res, 404, false, "Transaction not found");
            return;
        }
        const isTransfer = transaction.category === "transfer";
        const responseData = {
            id: transaction._id,
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
            date: transaction.date,
            description: transaction.description,
            balance: transaction.balance,
        };
        if (isTransfer) {
            responseData.fromAccount = transaction.fromAccountId || null;
            responseData.toAccount = transaction.toAccountId || null;
        }
        else {
            responseData.account = transaction.accountId || null;
        }
        (0, responseHelper_1.default)(res, 200, true, "Transaction details retrieved successfully", {
            transaction: responseData
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.getTransactionDetails = getTransactionDetails;
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userAccounts = yield account_model_1.default.find({ userId });
        const accountIds = userAccounts.map((account) => account._id);
        const transactions = yield transaction_model_1.default.find({ accountId: { $in: accountIds } })
            .sort({ date: -1 })
            .populate("accountId", "number type");
        (0, responseHelper_1.default)(res, 200, true, "Transactions retrieved", {
            transactions
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.getTransactions = getTransactions;
const handleTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { accountId, amount, description, type, pin } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, responseHelper_1.default)(res, 401, false, "Unauthorized");
            return;
        }
        if (!["deposit", "withdraw"].includes(type)) {
            (0, responseHelper_1.default)(res, 400, false, "Invalid transaction type");
            return;
        }
        if (amount <= 0) {
            (0, responseHelper_1.default)(res, 400, false, "Amount must be greater than zero");
            return;
        }
        const isPinValid = yield (0, verifyPin_1.verifyPin)(userId, pin);
        if (!isPinValid) {
            (0, responseHelper_1.default)(res, 400, false, "Invalid PIN");
            return;
        }
        const account = yield account_model_1.default.findOne({ _id: accountId, userId });
        if (!account) {
            (0, responseHelper_1.default)(res, 404, false, "Account not found or unauthorized");
            return;
        }
        if (type === "withdraw") {
            if (account.balance < amount) {
                (0, responseHelper_1.default)(res, 400, false, "Insufficient balance for withdrawal");
                return;
            }
            account.balance -= amount;
        }
        else {
            account.balance += amount;
        }
        yield account.save();
        const transaction = new transaction_model_1.default({
            accountId: account._id,
            amount,
            balance: account.balance,
            description: description !== null && description !== void 0 ? description : (type === "deposit" ? "Deposit" : "Withdrawal"),
            category: type,
            type: type === "deposit" ? "credit" : "debit",
            date: new Date(),
        });
        yield transaction.save();
        (0, responseHelper_1.default)(res, 200, true, `${type === "deposit" ? "Deposit" : "Withdrawal"} successful`, {
            account,
            transaction,
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.handleTransaction = handleTransaction;
