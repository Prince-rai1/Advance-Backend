import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAvatar,
    updateDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(auth, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/update-password").patch(auth, changeCurrentPassword);

router.route("/currendt-user").get(auth, getCurrentUser);

router.route("/update-account").patch(auth, updateDetails);

router.route("/update-profile").patch(auth, updateDetails);

router
    .route("/update-avatar")
    .patch(auth, upload.single("avatar"), updateAvatar);

router.route("/channel/:username").get(auth, getUserChannelProfile);

router.route("/history").get(auth, getWatchHistory);

export default router;
