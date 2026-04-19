import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { username, fullname, password, email } = req.body;

    console.log(username, fullname);

    if (
        [fullname, username, password, email].some(
            (filed) => filed?.trin() === ""
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
    //console.log(existingUser);
    //console.log(req.body);
    // console.log(req.files);

    const avatarPath = req.files?.avatar[0]?.path;
    const coverImagePath = req.files?.coverimage[0]?.path;

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
        avatar: avatar.url,
        coverimage: coverImage?.url || "",
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

export { registerUser };
