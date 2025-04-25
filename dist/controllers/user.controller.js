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
exports.viewSecurityQuestions = exports.addSecurityQuestions = exports.changePin = exports.changePassword = exports.updateUserProfile = exports.getUserProfile = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const bcrypt_1 = require("../utils/bcrypt");
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield user_model_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id).select("-password -pin");
        if (!user) {
            (0, responseHelper_1.default)(res, 404, false, "User not found");
            return;
        }
        (0, responseHelper_1.default)(res, 200, true, "User profile retrieved", { user });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.getUserProfile = getUserProfile;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, phone, address, dob } = req.body;
        const user = yield user_model_1.default.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, { name, phone, address, dob }, { new: true }).select("-password -pin");
        if (!user) {
            (0, responseHelper_1.default)(res, 404, false, "User not found");
            return;
        }
        (0, responseHelper_1.default)(res, 200, true, "Profile updated successfully", { user });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.updateUserProfile = updateUserProfile;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { currentPassword, newPassword } = req.body;
        const user = yield user_model_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!user) {
            (0, responseHelper_1.default)(res, 404, false, "User not found");
            return;
        }
        const isMatch = yield (0, bcrypt_1.comparePassword)(currentPassword, user.password);
        if (!isMatch) {
            (0, responseHelper_1.default)(res, 400, false, "Current password is incorrect");
            return;
        }
        user.password = newPassword;
        yield user.save();
        (0, responseHelper_1.default)(res, 200, true, "Password changed successfully");
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.changePassword = changePassword;
const changePin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { currentPin, newPin } = req.body;
        const user = yield user_model_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!user) {
            (0, responseHelper_1.default)(res, 404, false, "User not found");
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(currentPin, user.pin);
        if (!isMatch) {
            (0, responseHelper_1.default)(res, 400, false, "Current PIN is incorrect");
            return;
        }
        user.pin = newPin;
        yield user.save();
        (0, responseHelper_1.default)(res, 200, true, "PIN changed successfully");
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.changePin = changePin;
const addSecurityQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { securityQuestions } = req.body;
        if (!userId) {
            (0, responseHelper_1.default)(res, 401, false, "Unauthorized");
            return;
        }
        if (!securityQuestions || securityQuestions.length === 0) {
            (0, responseHelper_1.default)(res, 400, false, "Security questions are required");
            return;
        }
        // Validate each security question
        securityQuestions.forEach((q) => {
            if (!q.question || !q.answer) {
                (0, responseHelper_1.default)(res, 400, false, "Each security question must have a question and an answer");
            }
        });
        // Update the user's security questions
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { securityQuestions }, { new: true }).select("-password -pin");
        if (!updatedUser) {
            (0, responseHelper_1.default)(res, 404, false, "User not found");
            return;
        }
        (0, responseHelper_1.default)(res, 200, true, "Security questions added successfully", { updatedUser });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.addSecurityQuestions = addSecurityQuestions;
const viewSecurityQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, responseHelper_1.default)(res, 401, false, "Unauthorized");
            return;
        }
        const user = yield user_model_1.default.findById(userId).select("securityQuestions -_id");
        if (!user) {
            (0, responseHelper_1.default)(res, 404, false, "User not found");
            return;
        }
        (0, responseHelper_1.default)(res, 200, true, "Security questions retrieved", { securityQuestions: user.securityQuestions });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.viewSecurityQuestions = viewSecurityQuestions;
