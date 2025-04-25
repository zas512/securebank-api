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
exports.signin = exports.signup = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const jwt_1 = require("../utils/jwt");
const bcrypt_1 = require("../utils/bcrypt");
const responseHelper_1 = __importDefault(require("../utils/responseHelper"));
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, pin } = req.body;
        if (!name || !email || !password || !pin) {
            (0, responseHelper_1.default)(res, 400, false, "All fields are required");
            return;
        }
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            (0, responseHelper_1.default)(res, 400, false, "User already exists with this email");
            return;
        }
        const newUser = new user_model_1.default({ name, email, password, pin });
        yield newUser.save();
        (0, responseHelper_1.default)(res, 201, true, "User created successfully");
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            (0, responseHelper_1.default)(res, 400, false, "Email and password are required");
            return;
        }
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            (0, responseHelper_1.default)(res, 404, false, "User not found");
            return;
        }
        const isPasswordValid = yield (0, bcrypt_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            (0, responseHelper_1.default)(res, 403, false, "Invalid credentials");
            return;
        }
        const token = (0, jwt_1.generateToken)(user);
        const filteredUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        };
        (0, responseHelper_1.default)(res, 200, true, "Sign-in successful", filteredUser);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        (0, responseHelper_1.default)(res, 500, false, errorMessage);
    }
});
exports.signin = signin;
