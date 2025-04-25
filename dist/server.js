"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const index_1 = __importDefault(require("./routes/index"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        var _a;
        if (!origin || ((_a = process.env.ALLOWED_ORIGINS) !== null && _a !== void 0 ? _a : "").includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express_1.default.json());
// Routes
app.get("/", (req, res) => {
    res.status(200).json({ message: "Server working" });
});
app.use("/", index_1.default);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});
// Server
(0, db_1.default)();
app.listen(3000, () => {
    try {
        console.log("Server running on port 3000");
    }
    catch (error) {
        console.log("Error starting server:", error);
    }
});
