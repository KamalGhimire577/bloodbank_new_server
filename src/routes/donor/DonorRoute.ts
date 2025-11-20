import express from "express";
import { fetchAllEligibleDonors,searchEligibleDonors ,getDoner } from "../../controller/donorController/donorController.js"; // adjust path as needed
import  isLoggedIn  from "../../middleware/isloginIn.js";

import type { Router } from "express";

const router: Router = express.Router();
router.get("/me",isLoggedIn,getDoner)
router.get("/eligible", fetchAllEligibleDonors);
router.get("/search", searchEligibleDonors);
export default router;