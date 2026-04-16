import mongoose from "mongoose";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        coverimage: {
            type: String,
        },
        watchhistory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        },
        password: {
            type: String,
            required: [true, "password is required"],
            min: "",
        },
        refreshtoken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function(){
    return jsonwebtoken.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username
        },
        process.env.ACCESS_TOKEN_SCERET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jsonwebtoken.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SCERET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User", userSchema);

export { User };
