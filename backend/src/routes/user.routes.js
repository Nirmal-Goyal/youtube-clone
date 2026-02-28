import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    changePasswordSchema,
    updateAccountSchema,
    channelUsernameSchema
} from "../validations/user.validations.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    validate({ body: registerSchema }),
    registerUser
)

router.route("/login").post(validate({ body: loginSchema }), loginUser)

//secured route
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(validate({ body: refreshTokenSchema }), refreshAccessToken)
router.route("/change-password").post(verifyJWT, validate({ body: changePasswordSchema }), changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, validate({ body: updateAccountSchema }), updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, validate({ params: channelUsernameSchema }), getUserChannelProfile)
router.route("/watch-history").get(verifyJWT, getWatchHistory)

export default router