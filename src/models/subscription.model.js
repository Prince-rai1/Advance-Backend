import mongoose from "mongoose";

const subcsriptionSchema = new mongoose.Schema(
    {
        subscriber : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        channel  : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {
        timestamps:true
    });

const Subscripton = mongoose.model("Subscripton", subcsriptionSchema);

export { Subscripton };
