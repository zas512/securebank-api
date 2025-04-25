"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Overview_controller_1 = require("../controllers/Overview.controller");
const requireAuth_1 = __importDefault(require("../middlewares/requireAuth"));
const router = (0, express_1.Router)();
router.use(requireAuth_1.default);
router.get("/get-overview", Overview_controller_1.getDashboardOverview);
exports.default = router;
