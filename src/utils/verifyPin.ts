import bcrypt from "bcryptjs";
import User from "../models/user.model";

export const verifyPin = async (userId: string, enteredPin: string): Promise<boolean> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const isPinValid = await bcrypt.compare(enteredPin, user.pin);
    return isPinValid;
  } catch (error) {
    throw new Error(`Error verifying PIN: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};
