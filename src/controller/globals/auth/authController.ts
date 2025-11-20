

import type { Request,Response } from "express";
import User from "../../../databases/models/user.model.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
class AuthController {
  static async registerUser(req: Request, res: Response) {
    try {
      // Check if body is provided
      if (!req.body) {
        return res.status(400).json({
          message: "No data was sent!",
        });
      }

      const { userName, password, email, phoneNumber } = req.body;

      // Validate input fields
      if (!userName || !password || !email || !phoneNumber) {
        return res.status(400).json({
          message: "Please provide all required details.",
        });
      }
        //console.log("User model:", User);
      // Check if user already exists by phone number
      const existingUser = await User.findOne({ where: { phoneNumber } });

      if (existingUser) {
        return res.status(400).json({
          message: "Your phone number is already registered.",
        });
      }

      // Hash password before saving
      const hashedPassword = bcrypt.hashSync(password, 12);

      // Create new user
      await User.create({
        userName: userName,
        password: hashedPassword,
        email,
        phoneNumber,
      });

      // Success response
      return res.status(201).json({
        message: "User registered successfully!",
      });
    } catch (error) {
      console.error("Error in registerUser:", error);
      return res.status(500).json({
        message: "Something went wrong during registration.",
        error: (error as Error).message,
      });
    }
  }

  static async loginUser(req: Request, res: Response) {
    try {
      const { phoneNumber, password } = req.body;

      // Check if input fields are provided
      if (!phoneNumber || !password) {
        return res.status(400).json({
          message: "User information not provided",
        });
      }

      // Check if user exists
      const user = await User.findOne({ where: { phoneNumber } });
      if (!user) {
        return res.status(400).json({
          message: "Your phone number is not registered yet",
        });
      }

      // Compare password
      const isPasswordMatch = bcrypt.compareSync(password, user.password);
      if (!isPasswordMatch) {
        return res.status(403).json({
          message: "Invalid phone number or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, phoneNumber: user.phoneNumber,},
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      // Send response
      return res.status(200).json({
        
  message: "Login successful",
  data: {
    id: user.id,
    phoneNumber: user.phoneNumber,
    password: "", // Don't send actual password
    token,
    userName: user.userName,
    role:user.role,
    email:user.email
  },
});
     
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        message: "Something went wrong",
      });
    }
  }
}
export default AuthController;
