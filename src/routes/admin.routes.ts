import express from "express";
import { getAllUserData } from "../controllers/admin.controller";
import requireAuth from "../middlewares/requireAuth";

const router = express.Router();

router.use(requireAuth);

router.get("/fetch-everything", getAllUserData);

export default router;
