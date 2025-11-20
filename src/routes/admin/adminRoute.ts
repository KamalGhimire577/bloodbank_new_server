import express from "express";
import type { Router } from "express";
import {
  selectAllUser,
  selectAllDonor,
   selectAllcompleateDonation
  ,
  selectAllBloodRequest,
  updateBloodRequestStatus,
  deleteUser,
  deleteDonor,
  deleteBloodRequests,
} from "../../controller/admin/adminController.js"; // adjust path
import isLoggedIn from "../../middleware/isloginIn.js"; // middleware to check JWT and admin
import isAdmin from "../../middleware/isAdmin.js";
const router: Router = express.Router();

// Apply middleware to all routes
router.use(isLoggedIn, isAdmin);

// Fetch all data
router.get("/users", selectAllUser); // Get all users
router.get("/donors", selectAllDonor); // Get all donors
router.get("/donations", selectAllcompleateDonation); // Get all completed donations
router.get("/blood-requests", selectAllBloodRequest); // Get all blood requests

// Update blood request status
router.put("/blood-requests/:id", updateBloodRequestStatus);

// Delete operations
router.delete("/delete-user/:id", deleteUser); // Delete a user by ID
router.delete("/delete-donor/:id", deleteDonor); // Delete a donor by ID
router.delete("/delete-blood-requests", deleteBloodRequests); // Delete blood requests by userId or donorId

export default router;
