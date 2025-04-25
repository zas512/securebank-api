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
exports.getAllUserData = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const account_model_1 = __importDefault(require("../models/account.model"));
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const getAllUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.default.find({}, "-password -pin -securityAnswers");
        const accounts = yield account_model_1.default.find({});
        const transactions = yield transaction_model_1.default.find({}).populate([
            { path: "accountId", select: "number type userId" },
            { path: "fromAccountId", select: "number type userId" },
            { path: "toAccountId", select: "number type userId" }
        ]);
        // Map userId to their accounts
        const accountsMap = new Map();
        accounts.forEach((account) => {
            var _a;
            const userId = account.userId.toString();
            if (!accountsMap.has(userId))
                accountsMap.set(userId, []);
            (_a = accountsMap.get(userId)) === null || _a === void 0 ? void 0 : _a.push(account);
        });
        // Map userId to their transactions
        const transactionsMap = new Map();
        transactions.forEach((txn) => {
            var _a, _b, _c;
            const userIds = [];
            if ((_a = txn.accountId) === null || _a === void 0 ? void 0 : _a.userId)
                userIds.push(txn.accountId.userId.toString());
            if ((_b = txn.fromAccountId) === null || _b === void 0 ? void 0 : _b.userId)
                userIds.push(txn.fromAccountId.userId.toString());
            if ((_c = txn.toAccountId) === null || _c === void 0 ? void 0 : _c.userId)
                userIds.push(txn.toAccountId.userId.toString());
            userIds.forEach((id) => {
                var _a;
                if (!transactionsMap.has(id))
                    transactionsMap.set(id, []);
                (_a = transactionsMap.get(id)) === null || _a === void 0 ? void 0 : _a.push(txn);
            });
        });
        // Construct final result
        const result = users.map((user) => {
            const id = user._id.toString();
            return {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                accounts: accountsMap.get(id) || [],
                transactions: transactionsMap.get(id) || []
            };
        });
        (0, responseHelper_1.default)(res, 200, true, "Admin data retrieved successfully", result);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.getAllUserData = getAllUserData;
