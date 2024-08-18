import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
    time:{
        type: String,
        required : true
    },
    email:{
        type: String,
        required: true,
        unique : true    
    },
    otp:{
        type: String,
        required: true,
        unique: true
    },
})

export const Otp = mongoose.model("OTP", OtpSchema);