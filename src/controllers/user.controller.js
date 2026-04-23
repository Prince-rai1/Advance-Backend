import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";
import { JsonWebToken } from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
    const { username, fullname, password, email } = req.body;

    console.log(req);

    if (
        [fullname, username, password, email].some(
            (filed) => filed?.trim() === ""
        )
    ) {
        throw new apiError(404, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser) {
        throw new apiError(409, "User with email or username already exists");
    }

    const avatarPath = req.files?.avatar[0]?.path;
    const coverImagePath = req.files?.coverImage[0]?.path;

    if (!avatarPath) {
        throw new apiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarPath);
    const coverImage = await uploadOnCloudinary(coverImagePath);

    if (!avatar) {
        throw new apiError(500, "Failed to upload avatar");
    }

    const newUser = await User.create({
        username: username.toLowerCase(),
        fullname,
        email,
        password,
        avatar: avatar.secure_url,
        coverimage: coverImage?.secure_url || "",
    });

    if (!newUser) {
        throw new apiError(500, "Failed to register user");
    }

    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshtoken"
    );

    res.status(201).json(
        new apiResponse(201, "User registered successfully", createdUser)
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new apiError(400, "Username or email are required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (!user) {
        throw new apiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid Password");
    }

    //generate access token and refresh token
    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();

    user.refreshtoken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("refreshToken", refreshToken, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .cookie("accessToken", accessToken, {
            ...options,
            maxAge: 15 * 60 * 1000,
        })
        .json(
            new apiResponse(200, "User Logged in successfully", {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                },
            })
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            refreshToken: undefined,
        },
    });

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incompleteRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incompleteRefreshToken) {
        throw new apiError(401, "Unauthorized request");
    }

    const decodedToken = JsonWebToken.verify(
        incompleteRefreshToken,
        process.env.REFRESH_TOKEN_SCERET
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
        throw new apiError(401, "Invalid Refresh Token");
    }

    if (incompleteRefreshToken !== user?.refreshToken) {
        throw new apiError(401, "Refresh token is expired or used");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("accessToken", accessToken, {
            ...options,
            maxAge: 15 * 60 * 1000,
        })
        .cookie("refreshToken", refreshToken, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json(new apiResponse(200, "Access token refreshed successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPasswrod, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPasswrod);

    if (!isPasswordCorrect) {
        throw new apiError(400, "Invalid Password");
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    res.status(200).json(new apiResponse(200, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json(
        new apiResponse(200, req.user, "Current user fetched successfully")
    );
});

const updateDetails = asyncHandler(async (req, res) => {
    const { fullname, email, username } = req.body;

    const updatedDetails = {};

    if (!fullname.trim()) updatedDetails.fullname = fullname.trim();
    if (!email.trim()) updatedDetails.email = email.trim();
    if (!username.trim()) updatedDetails.username = username.trim();

    if (Object.keys(updateFields).length === 0) {
        throw new apiError(400, "At least one valid field is required");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: updatedDetails,
        },
        {
            new: true,
        }
    ).select("-password -refreshtoken");

    res.status(200).json(
        new apiResponse(200, updatedUser, "User details updated successfully")
    );
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarPath = req.file?.avatar[0]?.path;

    if (!avatarPath) {
        throw new apiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarPath);

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.secure_url,
            },
        },
        {
            new: true,
        }
    ).select("-password -refreshtoken");

    res.status(200).json(
        new apiResponse(200, updatedUser, "User avatar updated successfully")
    );
});

const updateCoverImage = asyncHandler(async (req, res) => {
    const coveImagePath = req.file?.coverImage[0]?.path;

    if (!coveImagePath) {
        throw new apiError(400, "Cover image is required");
    }

    const coverImage = await uploadOnCloudinary(coveImagePath);

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.secure_url,
            },
        },
        {
            new: true,
        }
    ).select("-password -refreshtoken");

    res.status(200).json(
        new apiResponse(
            200,
            updatedUser,
            "User cover image updated successfully"
        )
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateDetails,
    updateAvatar,
    updateCoverImage,
};
