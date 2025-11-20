import express, { Router } from "express";
import AuthController from "../../../controller/globals/auth/authController.js";
//import asyncErrorHandler from "../../../services/asyncErrorHandler";

const router: Router = express.Router();

router.route("/signup").post(AuthController.registerUser);
router.route("/signin").post(AuthController.loginUser);

export default router;
