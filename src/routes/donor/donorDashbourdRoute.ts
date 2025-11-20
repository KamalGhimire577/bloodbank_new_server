import express from "express";
import {
  
  makeDonorDonationComplete,
  getDoner,
  deletedonor,
} from "../../controller/donorController/donorController.js"; // adjust path as needed
import  isLoggedIn  from "../../middleware/isloginIn.js"; // middleware to check JWT
import isDonor from "../../middleware/isDonor.js";

import type { Router } from "express";

const router: Router = express.Router();





router.get("/me", isLoggedIn,isDonor, getDoner);


router.put("/complete", isLoggedIn,isDonor, makeDonorDonationComplete);


router.delete("/delete", isLoggedIn,isDonor, deletedonor);

export default router;
