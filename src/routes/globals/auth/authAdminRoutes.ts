import express,{Router} from "express"
import AuthAdminController from "../../../controller/globals/auth/admin/authAdminController.js"

const  router :Router = express.Router()

// Ensure body parsing for this route
//router.use(express.json())

router.route("/admin/signup").post(AuthAdminController.registerAdmin)
router.route("/admin/signin").post(AuthAdminController.loginAdmin)

export default router