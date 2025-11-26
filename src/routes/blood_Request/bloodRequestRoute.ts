import express from "express";
import {
  insertBloodRequest,
  findBloodRequestsByDonorId,
  markStatusComplete,
  deleteRequestById,
  findBloodRequestsByUserId,
  
 
} from "../../controller/blood_request/bloodRequestController.js";
import isLoggedIn from "../../middleware/isloginIn.js";
import isAdmin from "../../middleware/isAdmin.js";
import isDonor from "../../middleware/isDonor.js";
const router = express.Router();

router.post("/request", isLoggedIn, insertBloodRequest);
router.get(
  "/request/fetchdatabyId/fromuserId",
  isLoggedIn,
  findBloodRequestsByUserId
);
router.get("/request/fetchdatabyId/donoridfromuserid", isLoggedIn, isDonor, findBloodRequestsByDonorId);
router.put("/request/status/complete/:id", isLoggedIn, isDonor, markStatusComplete);
router.delete("/request/:id", isLoggedIn, isDonor, deleteRequestById);

export default router;
