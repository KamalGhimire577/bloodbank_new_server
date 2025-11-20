import type { Request, Response } from "express";
import sequelize from "../../databases/connection.js";
import { QueryTypes } from "sequelize";
import type { IextendedRequest } from "../../middleware/types.js";

/**
 * Get all users
 */
export const selectAllUser = async (req: Request, res: Response) => {
  try {
    const users = await sequelize.query(`SELECT * FROM users`, {
      type: QueryTypes.SELECT,
    });
    res.status(200).json({
      message: "All users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Failed to fetch users",
      error: (error as Error).message,
    });
  }
};

/**
 * Get all donors
 */
export const selectAllDonor = async (req: Request, res: Response) => {
  try {
    const donors = await sequelize.query(`SELECT * FROM donor`, {
      type: QueryTypes.SELECT,
    });
    res.status(200).json({
      message: "All donors fetched successfully",
      data: donors,
    });
  } catch (error) {
    console.error("Error fetching donors:", error);
    res.status(500).json({
      message: "Failed to fetch donors",
      error: (error as Error).message,
    });
  }
};

/**
 * Get all completed donations
 */
export const selectAllcompleateDonation = async (req: Request, res: Response) => {
  try {
    const donations = await sequelize.query(
      `SELECT * FROM blood_request WHERE status = 'completed'`,
      { type: QueryTypes.SELECT }
    );
    res.status(200).json({
      message: "All completed donations fetched successfully",
      data: donations,
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({
      message: "Failed to fetch donations",
      error: (error as Error).message,
    });
  }
};

/**
 * Get all blood requests
 */
export const selectAllBloodRequest = async (req: Request, res: Response) => {
  try {
    const bloodRequests = await sequelize.query(`SELECT * FROM blood_request`, {
      type: QueryTypes.SELECT,
    });
    res.status(200).json({
      message: "All blood requests fetched successfully",
      data: bloodRequests,
    });
  } catch (error) {
    console.error("Error fetching blood requests:", error);
    res.status(500).json({
      message: "Failed to fetch blood requests",
      error: (error as Error).message,
    });
  }
};

/**
 * Update blood request status
 */
export const updateBloodRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    await sequelize.query(`UPDATE blood_request SET status = ? WHERE id = ?`, {
      type: QueryTypes.UPDATE,
      replacements: [status, id],
    });

    res
      .status(200)
      .json({ message: `Blood request ${id} status updated to ${status}` });
  } catch (error) {
    console.error("Error updating blood request status:", error);
    res.status(500).json({
      message: "Failed to update blood request status",
      error: (error as Error).message,
    });
  }
};
export const deleteUser = async (req: IextendedRequest, res: Response) => {
  try {
    const { id } = req.params; // user id to delete
    if (!id) return res.status(400).json({ message: "User ID is required" });

    await sequelize.query(`DELETE FROM user WHERE id = ?`, {
      replacements: [id],
      type: QueryTypes.DELETE,
    });

    res.status(200).json({ message: `User ${id} deleted successfully` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      message: "Failed to delete user",
      error: (error as Error).message,
    });
  }
};

/**
 * Delete a donor by ID
 */
export const deleteDonor = async (req: IextendedRequest, res: Response) => {
  try {
    const { id } = req.params; // donor id to delete
    if (!id) return res.status(400).json({ message: "Donor ID is required" });

    await sequelize.query(`DELETE FROM donor WHERE id = ?`, {
      replacements: [id],
      type: QueryTypes.DELETE,
    });

    res.status(200).json({ message: `Donor ${id} deleted successfully` });
  } catch (error) {
    console.error("Error deleting donor:", error);
    res.status(500).json({
      message: "Failed to delete donor",
      error: (error as Error).message,
    });
  }
};

/**
 * Delete all blood requests of a user or donor
 */
export const deleteBloodRequests = async (
  req: IextendedRequest,
  res: Response
) => {
  try {
    const { userId, donorId } = req.body; // either userId or donorId must be provided

    if (!userId && !donorId) {
      return res
        .status(400)
        .json({ message: "Provide either userId or donorId" });
    }

    if (userId) {
      await sequelize.query(
        `DELETE FROM blood_request WHERE requestor_id = ?`,
        { replacements: [userId], type: QueryTypes.DELETE }
      );
    }

    if (donorId) {
      await sequelize.query(`DELETE FROM blood_request WHERE donor_id = ?`, {
        replacements: [donorId],
        type: QueryTypes.DELETE,
      });
    }

    res.status(200).json({ message: "Blood requests deleted successfully" });
  } catch (error) {
    console.error("Error deleting blood requests:", error);
    res.status(500).json({
      message: "Failed to delete blood requests",
      error: (error as Error).message,
    });  }
};