    import type {Request,Response} from "express"
    import sequelize from "../../databases/connection.js"
    import {QueryTypes} from "sequelize"
   import type { IextendedRequest } from "../../middleware/types.js";
   
const fetchAllEligibleDonors = async (req: Request | IextendedRequest, res: Response) => {
  try {
    const currentUserId = (req as IextendedRequest).user?.id || null;
    
    const donors = await sequelize.query(
      `
      SELECT
        d.id AS donorId,
        d.user_id AS userId,
        u.userName AS donorName,
        u.email,
        u.phoneNumber,
        d.bloodgroup,
        d.province,
        d.district,
        d.city
      FROM donor d
      JOIN users u 
        ON d.user_id = u.id
      WHERE 
        (d.next_eligible_date IS NULL 
        OR d.next_eligible_date <= CURRENT_DATE)
      ORDER BY d.id DESC
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      message: "Eligible donors fetched",
      data: donors,
      currentUserId
    });
  } catch (error) {
    console.error("Error fetching eligible donors:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: (error as Error).message,
    });
  }
};



   const searchEligibleDonors = async (req: Request, res: Response) => {
     try {
       const { address, blood_group } = req.query;

       if (!address && !blood_group) {
         return res
           .status(400)
           .json({
             message: "Provide at least address or blood_group to search",
           });
       }

       let query = `SELECT * FROM donor WHERE (next_eligible_date IS NULL OR next_eligible_date <= CURRENT_DATE)`;
       const replacements: any[] = [];

       if (address) {
         query += ` AND address LIKE ?`;
         replacements.push(`%${address}%`);
       }

       if (blood_group) {
         query += ` AND blood_group = ?`;
         replacements.push(blood_group);
       }

       const donors = await sequelize.query(query, {
         type: QueryTypes.SELECT,
         replacements,
       });

       res.status(200).json({
         message: "Eligible donors fetched successfully",
         data: donors,
       });
     } catch (error) {
       console.error("Error searching donors:", error);
       res.status(500).json({
         message: "Something went wrong",
         error: (error as Error).message,
       });
     }
   };




const makeDonorDonationComplete = async (
  req: IextendedRequest,
  res: Response
) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1️⃣ Get donor ID for this user
    const donorResult: any = await sequelize.query(
      `SELECT id FROM donor WHERE user_id = ?`,
      {
        type: QueryTypes.SELECT,
        replacements: [user_id],
      }
    );

    if (donorResult.length === 0) {
      return res.status(404).json({ message: "Donor record not found" });
    }

    const donor_id = donorResult[0].id;

    // 2️⃣ Update the blood_request status to completed
    await sequelize.query(
      `
      UPDATE blood_request 
      SET status = 'completed'
      WHERE donor_id = ? AND status = 'pending'
      `,
      {
        type: QueryTypes.UPDATE,
        replacements: [donor_id],
      }
    );

    // 3️⃣ Update donor eligibility (2-month cooldown)
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

    res
      .status(200)
      .json({
        message: "Donation marked complete. Donor unavailable for 2 months.",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
      error: (error as Error).message,
    });
  }
};

 const getDoner = async (req: IextendedRequest, res: Response) => {
   try {
     const user_id = req.user?.id;

     if (!user_id) {
       return res.status(400).json({ message: "User ID not found" });
     }

     const donorResult: any = await sequelize.query(
       `SELECT id, city, bloodgroup, dob, last_donation_date, next_eligible_date 
       FROM donor WHERE user_id = ?`,
       {
         type: QueryTypes.SELECT,
         replacements: [user_id],
       }
     );

     res.status(200).json({
       message: "Donor fetched successfully",
       donorResult,
     });
   } catch (error) {
     console.error("Error fetching donor:", error);
     res.status(500).json({
       message: "Failed to fetch donor",
       error: error instanceof Error ? error.message : error,
     });
   }
 };
const deletedonor = async (req: IextendedRequest, res: Response) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(400).json({ message: "User ID not found" });
    }

    // Fetch the donor first
    const donorResult: any = await sequelize.query(
      `SELECT id FROM donor WHERE user_id = ?`,
      {
        type: QueryTypes.SELECT,
        replacements: [user_id],
      }
    );

    if (donorResult.length === 0) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const donorId = donorResult[0].id;

    // Delete the donor
    await sequelize.query(`DELETE FROM donor WHERE id = ?`, {
      replacements: [donorId],
      type: QueryTypes.DELETE,
    });

    res.status(200).json({
      message: "Donor deleted successfully",
      donorId,
    });
  } catch (error) {
    console.error("Error deleting donor:", error);
    res.status(500).json({
      message: "Failed to delete donor",
      error: error instanceof Error ? error.message : error,
    });
  }
};






   
  


  export {fetchAllEligibleDonors, searchEligibleDonors,makeDonorDonationComplete,getDoner,deletedonor}




    