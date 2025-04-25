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
exports.transferMoney = exports.getAccounts = exports.createAccount = void 0;
const account_model_1 = __importDefault(require("../models/account.model"));
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const createAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { type, currency, limit } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, responseHelper_1.default)(res, 401, false, "Unauthorized");
            return;
        }
        // Generate a random account number
        const number = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const account = new account_model_1.default({
            userId,
            type,
            number,
            currency,
            limit
        });
        yield account.save();
        (0, responseHelper_1.default)(res, 201, true, "Account created successfully", { account });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.createAccount = createAccount;
const getAccounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const accounts = yield account_model_1.default.find({ userId });
        (0, responseHelper_1.default)(res, 200, true, "Accounts retrieved successfully", { accounts });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.getAccounts = getAccounts;
const transferMoney = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { fromAccountId, toAccountId, amount, description } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, responseHelper_1.default)(res, 401, false, "Unauthorized");
            return;
        }
        // Start a session for transaction
        const session = yield account_model_1.default.startSession();
        session.startTransaction();
        try {
            // Get and validate source account
            const fromAccount = yield account_model_1.default.findOne({ _id: fromAccountId, userId });
            if (!fromAccount) {
                throw new Error("Source account not found or unauthorized");
            }
            // Get destination account
            const toAccount = yield account_model_1.default.findById(toAccountId);
            if (!toAccount) {
                throw new Error("Destination account not found");
            }
            // Check if source account has sufficient balance
            if (fromAccount.balance < amount) {
                throw new Error("Insufficient balance");
            }
            // Update balances
            fromAccount.balance -= amount;
            toAccount.balance += amount;
            // Create transaction records
            const debitTransaction = new transaction_model_1.default({
                accountId: fromAccount._id,
                amount,
                balance: fromAccount.balance,
                description,
                category: "transfer",
                type: "debit",
                reference: toAccount.number
            });
            const creditTransaction = new transaction_model_1.default({
                accountId: toAccount._id,
                amount,
                balance: toAccount.balance,
                description,
                category: "transfer",
                type: "credit",
                reference: fromAccount.number
            });
            // Save all changes
            yield fromAccount.save({ session });
            yield toAccount.save({ session });
            yield debitTransaction.save({ session });
            yield creditTransaction.save({ session });
            yield session.commitTransaction();
            (0, responseHelper_1.default)(res, 200, true, "Transfer successful", {
                fromAccount,
                toAccount,
                transactions: [debitTransaction, creditTransaction]
            });
        }
        catch (error) {
            yield session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.transferMoney = transferMoney;
