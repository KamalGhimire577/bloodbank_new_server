import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import User from "../databases/models/user.model.js";
import type { IextendedRequest } from "./types.js";

const isLoggedIn = async (
  req: IextendedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({ message: "Please provide token" });
  }

  try {
    //  verify token with your JWT secret key
   const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);


    //  find user by primary key
    const userData = await User.findByPk(decoded.id, {
      attributes: ["id", "phoneNumber","userName" ,"role", "email"],
    });

    if (!userData) {
      return res.status(403).json({ message: "Invalid token, user not found" });
    }

    //  attach user data to req.user
    req.user = {
      id: userData.id,
      userName:userData.userName,
      email:userData.email,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
    };

    //  move to next middleware
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(403).json({ message: "Token invalid or expired" });
  }
};

export default isLoggedIn;
