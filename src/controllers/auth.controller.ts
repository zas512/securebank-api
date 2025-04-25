import User from "../models/user.model";
import type { Request, Response } from "express";
import { generateToken } from "../utils/jwt";
import { comparePassword } from "../utils/bcrypt";
import sendResponse from "../utils/responseHelper";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, pin } = req.body;
    if (!name || !email || !password || !pin) {
      sendResponse(res, 400, false, "All fields are required");
      return;
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendResponse(res, 400, false, "User already exists with this email");
      return;
    }
    const newUser = new User({ name, email, password, pin });
    await newUser.save();
    sendResponse(res, 201, true, "User created successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      sendResponse(res, 400, false, "Email and password are required");
      return;
    }
    const user = await User.findOne({ email });
    if (!user) {
      sendResponse(res, 404, false, "User not found");
      return;
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      sendResponse(res, 403, false, "Invalid credentials");
      return;
    }
    const token = generateToken(user);
    const filteredUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    };
    sendResponse(res, 200, true, "Sign-in successful", filteredUser);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    sendResponse(res, 500, false, errorMessage);
  }
};
