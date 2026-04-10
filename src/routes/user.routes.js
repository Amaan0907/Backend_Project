import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verify } from "jsonwebtoken";

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
router.route("/update-account-details").post(verifyJWT,updateAccountDetails)
router.route("/update-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/watch-history").get(verifyJWT,getWatchHistory)
router.route("/channel/:username").get(verifyJWT,getUserChannelProfile)



export default router