import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import sendResponse from "../utils/responseHelper";

interface JwtPayload {
  id: string;
  email: string;
  role: "user" | "admin";
}

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return sendResponse(res, 401, false, "Unauthorized");
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Authentication failed";
    sendResponse(res, 401, false, errorMessage);
  }
};

export default requireAuth;
