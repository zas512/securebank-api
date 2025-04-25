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
exports.deleteAccount = exports.payBill = exports.getAccountDetails = exports.transferMoney = exports.getAccounts = exports.createAccount = void 0;
const account_model_1 = __importDefault(require("../models/account.model"));
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const verifyPin_1 = require("../utils/verifyPin");
const mongoose_1 = __importDefault(require("mongoose"));
const createAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { type, currency, limit, pin, name } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, responseHelper_1.default)(res, 401, false, "Unauthorized");
            return;
        }
        if (!type || typeof type !== "string") {
            (0, responseHelper_1.default)(res, 400, false, "Account type is required and must be a string");
            return;
        }
        if (!pin || typeof pin !== "string") {
            (0, responseHelper_1.default)(res, 400, false, "PIN is required and must be a string");
            return;
        }
        const isPinValid = yield (0, verifyPin_1.verifyPin)(userId, pin);
        if (!isPinValid) {
            (0, responseHelper_1.default)(res, 400, false, "Invalid PIN");
            return;
        }
        const number = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const account = new account_model_1.default({
            userId,
            type,
            number,
            name,
            balance: 0,
            currency: currency !== null && currency !== void 0 ? currency : "USD",
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
        const { fromAccountId, toAccountId, amount, description, pin } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, responseHelper_1.default)(res, 401, false, "Unauthorized");
            return;
        }
        if (amount <= 0) {
            (0, responseHelper_1.default)(res, 400, false, "Transfer amount must be greater than zero");
            return;
        }
        const isPinValid = yield (0, verifyPin_1.verifyPin)(userId, pin);
        if (!isPinValid) {
            (0, responseHelper_1.default)(res, 400, false, "Invalid PIN");
            return;
        }
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const fromAccount = yield account_model_1.default.findOne({ _id: fromAccountId, userId }).session(session);
            if (!fromAccount) {
                throw new Error("Source account not found or unauthorized");
            }
            if (fromAccount.balance < amount) {
                throw new Error("Insufficient balance");
            }
            let toAccount = null;
            if (mongoose_1.default.Types.ObjectId.isValid(toAccountId)) {
                toAccount = yield account_model_1.default.findById(toAccountId).session(session);
            }
            fromAccount.balance -= amount;
            const debitTransaction = new transaction_model_1.default(Object.assign({ accountId: fromAccount._id, amount, balance: fromAccount.balance, description, category: "transfer", type: "debit", reference: toAccount ? toAccount.number : toAccountId, fromAccountId: fromAccount._id }, (toAccount && { toAccountId: toAccount._id })));
            yield fromAccount.save({ session });
            yield debitTransaction.save({ session });
            let creditTransaction = null;
            if (toAccount) {
                toAccount.balance += amount;
                creditTransaction = new transaction_model_1.default({
                    accountId: toAccount._id,
                    amount,
                    balance: toAccount.balance,
                    description,
                    category: "transfer",
                    type: "credit",
                    reference: fromAccount.number,
                    fromAccountId: fromAccount._id,
                    toAccountId: toAccount._id
                });
                yield toAccount.save({ session });
                yield creditTransaction.save({ session });
            }
            yield session.commitTransaction();
            (0, responseHelper_1.default)(res, 200, true, "Transfer successful", Object.assign(Object.assign({ fromAccount }, (toAccount && { toAccount })), { transactions: creditTransaction ? [debitTransaction, creditTransaction] : [debitTransaction] }));
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
const getAccountDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { accountId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const account = yield account_model_1.default.findOne({ _id: accountId, userId });
        if (!account) {
            (0, responseHelper_1.default)(res, 404, false, "Account not found or unauthorized");
            return;
        }
        (0, responseHelper_1.default)(res, 200, true, "Account details retrieved", { account });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.getAccountDetails = getAccountDetails;
const payBill = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { accountId, amount, description, category, pin } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, responseHelper_1.default)(res, 400, false, "User not authenticated");
            return;
        }
        if (amount <= 0) {
            (0, responseHelper_1.default)(res, 400, false, "Amount must be greater than zero");
            return;
        }
        if (!category || !description) {
            (0, responseHelper_1.default)(res, 400, false, "Category and description are required");
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
        if (account.balance < amount) {
            (0, responseHelper_1.default)(res, 400, false, "Insufficient balance");
            return;
        }
        account.balance -= amount;
        const billTransaction = new transaction_model_1.default({
            accountId: account._id,
            amount,
            balance: account.balance,
            description,
            category,
            type: "debit"
        });
        yield account.save();
        yield billTransaction.save();
        (0, responseHelper_1.default)(res, 200, true, "Bill payment successful", {
            account,
            transaction: billTransaction
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.payBill = payBill;
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { accountId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, responseHelper_1.default)(res, 401, false, "Unauthorized");
            return;
        }
        const account = yield account_model_1.default.findOne({ _id: accountId, userId });
        if (!account) {
            (0, responseHelper_1.default)(res, 404, false, "Account not found or unauthorized");
            return;
        }
        if (account.balance > 0) {
            (0, responseHelper_1.default)(res, 400, false, "Account cannot be deleted. Balance must be zero.");
            return;
        }
        yield account_model_1.default.deleteOne({ _id: accountId });
        (0, responseHelper_1.default)(res, 200, true, "Account deleted successfully");
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.deleteAccount = deleteAccount;
