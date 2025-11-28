import { QueryTypes } from "sequelize";
import sequelize from "../../databases/connection.js";
import type { Response } from "express";
import type { IextendedRequest } from "../../middleware/types.js";

/**
 * INSERT BLOOD REQUEST
 */
export const insertBloodRequest = async (
  req: IextendedRequest,
  res: Response
) => {
  try {
    const { donorId, requesterAddress, urgent, bloodGroup } = req.body;

    if (!donorId || !requesterAddress || !bloodGroup) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    const requesterName = req.user?.userName || "Unknown User";
    const requesterPhone = req.user?.phoneNumber || "0000000000";
    const requesterId = req.user?.id;

    if (!requesterId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing requesterId" });
    }

    // Create table if not exists
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS blood_request (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        donor_id VARCHAR(36) NOT NULL,
        requestor_id VARCHAR(36) NOT NULL,
        requester_name VARCHAR(255) NOT NULL,
        requester_phone VARCHAR(20) NOT NULL,
        requester_address VARCHAR(255) NOT NULL,
        urgent BOOLEAN DEFAULT FALSE,
        blood_group VARCHAR(10) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert data
    await sequelize.query(
      `
      INSERT INTO blood_request 
      (donor_id, requestor_id, requester_name, requester_phone, requester_address, urgent, blood_group) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      {
        replacements: [
          donorId,
          requesterId,
          requesterName,
          requesterPhone,
          requesterAddress,
          urgent ?? false,
          bloodGroup,
        ],
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: "Blood request created successfully" });
  } catch (error) {
    console.error("Error creating blood request:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: (error as Error).message,
    });
  }
};

/**
 * GET ALL BLOOD REQUESTS
 */


/**
 * FIND BLOOD REQUESTS BY DONOR USER ID
 * user_id → donor table → donorId → blood_request
 */
export const findBloodRequestsByDonorId = async (
  req: IextendedRequest,
  res: Response
) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    // Step 1: Find donorId from donor table
    const donor = await sequelize.query(
      `SELECT id FROM donor WHERE user_id = ?`,
      { replacements: [user_id], type: QueryTypes.SELECT }
    );

    if (!donor || donor.length === 0) {
      return res
        .status(404)
        .json({ message: "No donor found for this user_id" });
    }

    const donorId = (donor[0] as any)?.id as string;

    if (!donorId) {
      return res.status(404).json({ message: "Donor ID not found" });
    }

    // Step 2: Fetch all requests for that donor
    const bloodRequests = await sequelize.query(
      `
      SELECT * FROM blood_request 
      WHERE donor_id = ?
      ORDER BY createdAt DESC
      `,
      { replacements: [donorId], type: QueryTypes.SELECT }
    );

    return res.status(200).json({
      donorId,
      totalRequests: bloodRequests.length,
      requests: bloodRequests,
    });
  } catch (error) {
    console.error("Error fetching donor requests:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: (error as Error).message,
    });
  }
};

/**
 * MARK REQUEST AS COMPLETED
 */
export const markStatusComplete = async (
  req: IextendedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    await sequelize.query(
      `
      UPDATE blood_request 
      SET status = 'completed'
      WHERE id = ? AND status != 'completed'
      `,
      { replacements: [id], type: QueryTypes.UPDATE }
    );

    const donorResult = await sequelize.query(
      `
      SELECT donor_id FROM blood_request WHERE id = ?
      `,
      {
        type: QueryTypes.SELECT,
        replacements: [id],
      }
    );

    const donor_id = (donorResult[0] as any)?.donor_id;

    if (donor_id) {
      await sequelize.query(
        `
        UPDATE donor
        SET last_donation_date = CURRENT_DATE,
            next_eligible_date = DATE_ADD(CURRENT_DATE, INTERVAL 2 MONTH)
        WHERE id = ?
        `,
        {
          type: QueryTypes.UPDATE,
          replacements: [donor_id],
        }
      );
    }

    return res.status(200).json({ message: "Request marked as completed" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: (error as Error).message,
    });
  }
};

/**
 * DELETE BLOOD REQUEST BY ID
 */
export const deleteRequestById = async (
  req: IextendedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    await sequelize.query(`DELETE FROM blood_request WHERE id = ?`, {
      replacements: [id],
      type: QueryTypes.DELETE,
    });

    return res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: (error as Error).message,
    });
  }
};
export const findBloodRequestsByUserId = async (
  req: IextendedRequest,
  res: Response
) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const query = `
      SELECT 
        br.id AS request_id,
        br.requester_name,
        br.requester_phone,
        br.requester_address,
        br.blood_group,
        br.urgent,
        br.status,
        br.createdAt AS request_date,

        d.id AS donor_id,
        d.province,
        d.district,
        d.city,
        

        u.username AS donor_username,
        u.phoneNumber AS donor_phone

      FROM blood_request br
      LEFT JOIN donor d ON br.donor_id = d.id
      LEFT JOIN users u ON d.user_id = u.id

      WHERE br.requestor_id = ?
        AND br.status != 'completed'

      ORDER BY br.createdAt DESC
    `;

    const bloodRequests = await sequelize.query(query, {
      replacements: [user_id],
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      user_id,
      totalRequests: bloodRequests.length,
      requests: bloodRequests,
    });
  } catch (error) {
    console.error("Error fetching user requests:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: (error as Error).message,
    });
  }
};


