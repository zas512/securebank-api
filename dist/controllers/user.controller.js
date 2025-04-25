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
exports.updateUserProfile = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, phone, address, dob, email, securityQuestion1, securityQuestion2 } = req.body;
        const updateFields = {};
        if (name !== undefined)
            updateFields.name = name;
        if (phone !== undefined)
            updateFields.phone = phone;
        if (address !== undefined)
            updateFields.address = address;
        if (dob !== undefined)
            updateFields.dob = dob;
        if (email !== undefined)
            updateFields.email = email;
        if (securityQuestion1 !== undefined)
            updateFields.securityQuestion1 = securityQuestion1;
        if (securityQuestion2 !== undefined)
            updateFields.securityQuestion2 = securityQuestion2;
        if (Object.keys(updateFields).length === 0) {
            (0, responseHelper_1.default)(res, 400, false, "No fields provided for update");
            return;
        }
        const user = yield user_model_1.default.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, { $set: updateFields }, { new: true }).select("-password -pin");
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
