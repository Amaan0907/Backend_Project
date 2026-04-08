import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, updateUserAvatar } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route("/login").post(
    loginUser
)
//secured route
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refesh-token").post(refreshAccessToken)
router.route("/update-avatar").patch(verifyJWT,upload.single('avatar'),updateUserAvatar)



export default router