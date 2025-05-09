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
router.put("/profile", user_controller_1.updateUserProfile);
exports.default = router;
