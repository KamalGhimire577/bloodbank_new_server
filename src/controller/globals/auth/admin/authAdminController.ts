import type {Request,Response} from "express";
import User from "../../../../databases/models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


class AuthAdminController {
  static async registerAdmin(req: Request, res: Response) {
    try {
      console.log('req.body:', req.body);
      const { userName, password, email, phoneNumber } = req.body;

      // Check if input fields are provided
      if (!userName || !password || !email || !phoneNumber) {
        return res.status(400).json({
          message: "User information not provided",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          message: " already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const admin = await User.create({
        userName: userName,
        password: hashedPassword,
        email,
        phoneNumber,
        role: "admin",
      });

     

      // Send response
      return res.status(201).json({
        message: " admin registered successfully",
        data: {
          email: admin.email,
          },
      });
    } catch (error) {
      console.error("Error in registerUser:", error);
      return res.status(500).json({
        message: "Something went wrong during registration.",
        error: (error as Error).message,
      });
    }
  }


  static async loginAdmin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      //  1. Check required fields
      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
        });
      }

      //  2. Find admin by email and role
      const admin = await User.findOne({
        where: { email, role: "admin" },
      });

      if (!admin) {
        return res.status(404).json({
          message: "Admin account not found or unauthorized",
        });
      }

      //  3. Compare password
      const isPasswordMatch = bcrypt.compareSync(password, admin.password);
      if (!isPasswordMatch) {
        return res.status(403).json({
          message: "Invalid email or password",
        });
      }

      //  4. Generate JWT token
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      //  5. Send success response (no password)
      return res.status(200).json({
        message: "Admin login successful",
        data: {
          id: admin.id,
          userName: admin.userName,
          phoneNumber: admin.phoneNumber,
          email: admin.email,
          role: admin.role,
          token,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        message: "Something went wrong during login",
      });
    }
  }
}




export default AuthAdminController;


