import mongoose from "mongoose";


const jobSchema = new mongoose.Schema({
    title:{
        type: String,
        required: [true, "Job Title is Required!"],
        minLength: [3, "Job Title must contain atleast 3 characters!"],
        maxLength: [50, "Job Title cannot exceed 50 characters!"],
    },
    description:{
        type: String,
        required: [true, "Job Description is Required!"],
        minLength: [50, "Job Description must contain atleast 50 characters!"],
        maxLength: [350, "Job Description cannot exceed 350 characters!"],
    },
    category:{
        type: String,
        required: [true, "Job Category is Required!"],
    },
    country:{
        type: String,
        required: [true, "Job Country is Required!"],
    },
    city:{
        type: String,
        required: [true, "Job City is Required!"],
    },
    location:{
        type: String,
        required: [true, "Please Provide Exact Job Location!"],
        minLength: [20, "Job Title must contain atleast 20 characters!"],
    },
    fixedSalary:{
        type: Number,
        minLength: [4, "Fixed Salary must contain atleast 4 digits!"],
        maxLength: [9, "Fixed Salary cannot exceed 9 digits!"],
    },
    salaryFrom:{
        type: Number,
        minLength: [4, "Salary must contain atleast 4 digits!"],
        maxLength: [9, "Salary cannot exceed 9 digits!"],
    },
    salaryTo:{
        type: Number,
        minLength: [4, "Salary must contain atleast 4 digits!"],
        maxLength: [9, "Salary cannot exceed 9 digits!"],
    },
    expired:{
        type: Boolean,
        default: false
    },
    jobPostedOn:{
        type: Date,
        default: Date.now()
    },
    jobPostedBy:{
        type: mongoose.Schema.ObjectId,
        ref:"User",
        required: true,
    }
    
});

export const Job = mongoose.model("Job",jobSchema);