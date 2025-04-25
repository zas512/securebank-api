"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const requireAuth_1 = __importDefault(require("../middlewares/requireAuth"));
const router = express_1.default.Router();
router.use(requireAuth_1.default);
router.get("/get-profile", user_controller_1.getUserProfile);
router.put("/profile", user_controller_1.updateUserProfile);
router.put("/change-password", user_controller_1.changePassword);
router.put("/change-pin", user_controller_1.changePin);
router.put("/add-security-questions", user_controller_1.addSecurityQuestions);
router.get("/get-security-questions", user_controller_1.viewSecurityQuestions);
exports.default = router;
