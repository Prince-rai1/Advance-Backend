import { asyncHandler } from "../utils/asyncHandler.js";
import jsonwebtoken from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";

const auth = asyncHandler(async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.headers?.["Authorization"]?.replace("Bearer", "");

        if (!token) {
            throw new apiError(401, "Unauthorized access, token is missing");
        }
        
        const decodedToken = jsonwebtoken.verify(
            token,
            process.env.ACCESS_TOKEN_SCERET
        );

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new apiError(401, "Invalid access token");
        }

        req.user = user;

        next();
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid access token");
    }
});

export { auth };