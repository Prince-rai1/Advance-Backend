import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // console.log("Uploading file to Cloudinary:", localFilePath);

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // console.log("File is upload on cloudinary");
        // console.log(response);

        return response;
    } catch (error) {
        
        console.error("Error uploading file to Cloudinary:", error);
        return null;
    } finally {
        // Delete the local file after upload
        fs.unlinkSync(localFilePath);
    }
};

export { uploadOnCloudinary };
