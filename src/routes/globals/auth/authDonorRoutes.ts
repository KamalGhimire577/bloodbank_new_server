import express, { Router } from "express";
//import AuthonorController from "../../../controller/globals/auth/authController.js";
import registerDonor from "../../../controller/globals/auth/donor/authDonorController.js";
const router: Router = express.Router();

router.route("/register/donor").post(registerDonor);

export default router