import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { AppError } from "../../middleware/error-handler";
import { UserModel, type UserDocument } from "../models/user";

const PASSWORD_KEY_LENGTH = 64;

const hashPassword = (password: string, salt: string): string => {
  return scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString("hex");
};

export const authenticateUser = async (email: string, password: string): Promise<UserDocument> => {
  const user = await UserModel.findOne({ email }).exec();
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const hashed = hashPassword(password, user.passwordSalt);
  const isMatch = timingSafeEqual(Buffer.from(hashed, "hex"), Buffer.from(user.passwordHash, "hex"));
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  return user;
};

export const getUserById = async (userId: string): Promise<UserDocument> => {
  const user = await UserModel.findOne({ userId }).exec();
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export const createUser = async (email: string, password: string): Promise<UserDocument> => {
  const existing = await UserModel.findOne({ email }).exec();
  if (existing) {
    throw new AppError("User already exists", 409);
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const user = new UserModel({
    userId: randomBytes(16).toString("hex"),
    email,
    passwordHash,
    passwordSalt: salt,
    roles: ["free"],
  });

  return user.save();
};
