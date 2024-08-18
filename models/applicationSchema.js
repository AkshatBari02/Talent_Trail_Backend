import mongoose from "mongoose";
import validator from "validator";


const applicationSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Name is Required!"],
        minLength: [3,"Name must contain atleast 3 characters!"],
        maxLength: [30,"Name cannot exceed 30 characters!"]
    },
    email:{
        type: String,
        required: [true, "Email is Required!"],
        validator: [validator.isEmail, "Invalid Email!"]
    },
    coverLetter:{
        type: String,
        required: [true, "Cover Letter is Required!"],
    },
    phone:{
        type: Number,
        required: [true, "Mobile Number is Required!"],
    },
    address:{
        type: String,
        required: [true, "Address is Required!"],
    },
    resume:{
        public_id:{
            type: String,
            required: true
        },
        url:{
            type: String,
            required: true
        }
    },
    applicantID:{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role:{
            type: String,
            enum: ["Job Seeker"],
            required: true
        }
    },
    employerID:{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role:{
            type: String,
            enum: ["Employer"],
            required: true
        }
    }
});


export const Application = mongoose.model("applications", applicationSchema);