import type { Request, Response } from "express";
import sequelize from "../../databases/connection.js";
import { QueryTypes } from "sequelize";
import type { IextendedRequest } from "../../middleware/types.js";

/**
 * Get all users
 */
export const selectAllUser = async (req: Request, res: Response) => {
  try {
    const users = await sequelize.query(
      `
      SELECT 
        id, 
        username AS userName, 
        email, 
        phonenumber AS phoneNumber, 
        role 
      FROM users 
      WHERE role = 'user'
      `,
      { type: QueryTypes.SELECT }
    );

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
/// mostly mysql return small letter so we need to do this 

/**
 * Get all donors
 */
export const selectAllDonor = async (req: Request, res: Response) => {
  try {
    const donors = await sequelize.query(
      `SELECT 
          d.*, 
          u.userName, 
          u.email, 
          u.phoneNumber, 
          u.role
       FROM donor d
       INNER JOIN users u 
          ON d.user_id = u.id
          AND u.role = 'donor'`,
      { type: QueryTypes.SELECT }
    );

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

export const deleteUser = async (req: IextendedRequest, res: Response) => {
  try {
    const { id } = req.params; // user id to delete
    if (!id) return res.status(400).json({ message: "User ID is required" });

    await sequelize.query(`DELETE FROM users WHERE id = ?`, {
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
    await sequelize.query(
      `UPDATE users
   SET role = 'user'
   WHERE id = ?
   AND role = 'donor'`,
      {
        replacements: [id],
        type: QueryTypes.UPDATE,
      }
    );
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
 * Get all completed donations
 */
export const selectAllCompleteDonation = async (
  req: Request,
  res: Response
) => {
  try {
    const donations = await sequelize.query(
      `
      SELECT 
        br.id,
        br.updatedAt AS completed_date,
        br.urgent,
        br.status,
        br.blood_group,

        -- requester details ONLY from blood_request table
        br.requester_name,
        br.requester_phone,
        br.requester_address,

        -- donor details
        CASE WHEN d.bloodgroup IS NOT NULL THEN d.bloodgroup END AS donorBloodGroup,
        CASE WHEN d.city IS NOT NULL THEN d.city END AS donorCity,
        CASE WHEN d.district IS NOT NULL THEN d.district END AS donorDistrict,
        CASE WHEN d.province IS NOT NULL THEN d.province END AS donorProvince,

        CASE WHEN donoruser.userName IS NOT NULL THEN donoruser.userName END AS donorUserName,
        CASE WHEN donoruser.email IS NOT NULL THEN donoruser.email END AS donorEmail,
        CASE WHEN donoruser.phoneNumber IS NOT NULL THEN donoruser.phoneNumber END AS donorPhoneNumber

      FROM blood_request br
      LEFT JOIN donor d 
        ON br.donor_id = d.id
      LEFT JOIN users donoruser 
        ON d.user_id = donoruser.id

      WHERE br.status = 'completed'
      ORDER BY br.updatedAt DESC;
      `,
      { type: QueryTypes.SELECT }
    );

    res.status(200).json({
      message: "Completed donations fetched successfully",
      data: donations,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch donations" });
  }
};




/**
 * Get all blood requests
 */
export const selectAllBloodRequest = async (req: any, res: Response) => {
  try {
    const bloodRequests = await sequelize.query(
      `
      SELECT 
        br.id,
        br.createdAt AS request_date,
        br.urgent,
        br.status,
        br.blood_group,

        -- requester details from request table ONLY
        br.requester_name,
        br.requester_phone,
        br.requester_address,

        -- donor details from donor table
        CASE WHEN d.bloodgroup IS NOT NULL THEN d.bloodgroup END AS donorBloodGroup,
        CASE WHEN d.city IS NOT NULL THEN d.city END AS donorCity,
        CASE WHEN d.district IS NOT NULL THEN d.district END AS donorDistrict,
        CASE WHEN d.province IS NOT NULL THEN d.province END AS donorProvince,

        -- donor's user account details
        CASE WHEN donoruser.userName IS NOT NULL THEN donoruser.userName END AS donorUserName,
        CASE WHEN donoruser.email IS NOT NULL THEN donoruser.email END AS donorEmail,
        CASE WHEN donoruser.phoneNumber IS NOT NULL THEN donoruser.phoneNumber END AS donorPhoneNumber

      FROM blood_request br
      LEFT JOIN donor d 
        ON br.donor_id = d.id
      LEFT JOIN users donoruser 
        ON d.user_id = donoruser.id

      WHERE br.status != 'completed'
      ORDER BY br.createdAt DESC;
      `,
      { type: QueryTypes.SELECT }
    );

    res.status(200).json({
      message: "Blood requests fetched successfully",
      data: bloodRequests,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blood requests" });
  }
};


/**
 * Update blood request status
 */
export const updateBloodRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: "Status is required" });

    await sequelize.query(
      `UPDATE blood_request SET status = ?, updatedAt = NOW() WHERE id = ?`,
      {
        type: QueryTypes.UPDATE,
        replacements: [status, id],
      }
    );

    res.status(200).json({
      message: `Blood request ${id} updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating blood request:", error);
    res.status(500).json({
      message: "Failed to update blood request",
    });
  }
};



/**
 * Delete all blood requests of a user or donor
 */
export const deleteBloodRequests = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(400).json({ message: "Blood request ID is required" });

    await sequelize.query(`DELETE FROM blood_request WHERE id = ?`, {
      replacements: [id],
      type: QueryTypes.DELETE,
    });

    res
      .status(200)
      .json({ message: `Blood request ${id} deleted successfully` });
  } catch (error) {
    console.error("Error deleting blood request:", error);
    res.status(500).json({
      message: "Failed to delete blood request",
      error: (error as Error).message,
    });
  }
};
