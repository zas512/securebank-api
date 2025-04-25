"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const requireAuth = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token)
            return (0, responseHelper_1.default)(res, 401, false, "Unauthorized");
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Authentication failed";
        (0, responseHelper_1.default)(res, 401, false, errorMessage);
    }
};
exports.default = requireAuth;
