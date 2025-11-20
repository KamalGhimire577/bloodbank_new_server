import type { Request, Response } from "express";
import sequelize from "../../../../databases/connection.js";
import User from "../../../../databases/models/user.model.js";
import { QueryTypes } from "sequelize";
import bcrypt from "bcrypt";

const registerDonor = async (req: Request, res: Response) => {
  const t = await sequelize.transaction(); // Start transaction

  try {
    const {
      username,
      password,
      email,
      phoneNumber,
      bloodGroup,
      province,
      district,
      city,
      dateofbirth,
      last_donation_date,
      next_eligible_date,
    } = req.body;

    // 1️Validate input
    if (
      !username ||
      !password ||
      !email ||
      !phoneNumber ||
      !bloodGroup ||
      !province||
      !district ||
      !city ||
      !dateofbirth
    ) {
      return res.status(400).json({ message: "Please fill all the fields!" });
    }

    // 2️ Check if user already exists
    const existingUser = await User.findOne({ where: { phoneNumber } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Your phone number is already registered." });
    }

    // 3️Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4 Create new user in User table
    const donordata = await User.create(
      {
        userName: username,
        password: hashedPassword,
        email,
        phoneNumber,
        role: "donor",
      },
      { transaction: t }
    );

    const user_id = donordata.id;

    // 5️ Create donor table if it doesn't exist
    await sequelize.query(
      `
      CREATE TABLE IF NOT EXISTS donor (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) NOT NULL,
        province VARCHAR(100),
        district VARCHAR(100),
        city VARCHAR(100),
        bloodgroup VARCHAR(50),
        dob DATE,
        last_donation_date DATE DEFAULT NULL,
        next_eligible_date DATE DEFAULT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
      `,
      { transaction: t }
    );

    // 6️ Insert donor data
    await sequelize.query(
      `
      INSERT INTO donor 
      (user_id, province, district, city, bloodgroup, dob, last_donation_date, next_eligible_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      {
        type: QueryTypes.INSERT,
        replacements: [
          user_id,
          province,
          district,
          city,
          bloodGroup,
          dateofbirth,
          last_donation_date || null,
          next_eligible_date || null,
        ],
        transaction: t,
      }
    );

    // 7️ Commit transaction if all successful
    await t.commit();

    return res.status(201).json({
      message: "Donor registered successfully!",
      user_id,
    });
  } catch (error) {
    //  Rollback if any error occurs
    await t.rollback();
    console.error("Error in registerDonor:", error);
    return res.status(500).json({
      message: "Something went wrong during registration.",
      error: (error as Error).message,
    });
  }
};

export default registerDonor;

