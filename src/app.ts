import express from "express"

import authRout from  "../src/routes/globals/auth/authRoute.js"
import authDonorRoute from "../src/routes/globals/auth/authDonorRoutes.js"
import bloodRequestRoute from "../src/routes/blood_Request/bloodRequestRoute.js"
import adminauthRoute from "../src/routes/globals/auth/authAdminRoutes.js"
import adminDashboardRoute from "../src/routes/admin/adminRoute.js"
import donorDashboardRoute from "./routes/donor/donorDashbourdRoute.js"
import donorRoute from "./routes/donor/DonorRoute.js"
import { findBloodRequestsByDonorId, findBloodRequestsByUserId,markStatusComplete,deleteRequestById } from "./controller/blood_request/bloodRequestController.js"
import cors from "cors"
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3003","http://localhost:3002","http://localhost:3001","http://localhost:3000"], // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies/auth
  })
);
// authentication route (register user and login user)
app.use("/api/auth",authRout)
// authentication route for donor registration 
app.use("/api/auth",authDonorRoute)
// bloood request route fro user 
app.use("/api/blood",bloodRequestRoute)
//find blood request by donor id
app.get("/api/blood", findBloodRequestsByDonorId); //blood/request/fetchdatabyId/donoridfromuserid
 //
//find blood request by user id
app.get("/api/blood", findBloodRequestsByUserId);
//mark status complete
app.put("/api/blood", markStatusComplete);
//delete request by id
app.delete("/api/blood",deleteRequestById);

// admin login/registration route 
app.use("/api/auth",adminauthRoute )

// donor dashbord route
app.use("/api/donor/dashboard", donorDashboardRoute)
// donor route 
app.use("/api/donor", donorRoute)

// admin dashboard all routes 
app.use("/api/admin/dashboard", adminDashboardRoute)
export default app;

