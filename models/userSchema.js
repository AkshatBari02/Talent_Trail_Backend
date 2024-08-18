import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please Enter Your Name!"],
        minLength:[3, "Name must contain atleast 3 characters!"],
        maxLength:[30, "Name can't contain more than 30 characters!"]
    },
    email:{
        type:String,
        required:[true, "Please Enter Your Email!"],
        validate:[validator.isEmail, "Please Enter a Valid Email!"]
    },
    phone:{
        type: Number,
        required:[true, "Please Enter Your Mobile Number"],
    },
    password:{
        type: String,
        required:[true, "Please Enter Your Password!"],
        minLength: [8,"PAssword Should Contain Atleast 8 Characters!"],
        maxLength: [15, "Password Can Contain Atmost 15 Characters!"],
        select: false
    },
    role:{
        type:String,
        required: [true,"Please Provide Your Role!"],
        enum:["Job Seeker", "Employer"]
    },
    createdAt:{
        type:Date,
        default: Date.now,
    }
})

// Hashing Password
userSchema.pre('save',async function(next){
    if (!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// Comparing Password
userSchema.methods.comparePassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

// Generating a JWT Token for Authentication
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET_KEY,{
        expiresIn: process.env.JWT_EXPIRE,
    })
}


export const User = mongoose.model("User",userSchema);