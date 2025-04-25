import jwt from "jsonwebtoken";

export const generateToken = (user: { name: string; email: string; _id: string }) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET as string, {
    expiresIn: "1d"
  });
};
