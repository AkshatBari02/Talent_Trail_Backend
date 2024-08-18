import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import  { sendToken } from "../utils/jwTokens.js";
import nodemailer from "nodemailer";
import {Otp} from "../models/otp.js";
import bcrypt from 'bcrypt';


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "akshatbari2004@gmail.com",
        pass: "uphmgvixzmjkqbkb"
    },
});


// Register API
export const register = catchAsyncError(async (req,res,next)=>{
    const {name,email,phone,role,password} = req.body;
    if(!name || !email || !phone || !role || !password){
        return next(new ErrorHandler("Please Provide Complete Details!"));
    }
    const isEmail = await User.findOne({email});
    if(isEmail){
        return next(new ErrorHandler("User Already Exists With This Email"));
    }
    const user = await User.create({
        name,
        email,
        phone,
        role,
        password,
    });
    sendToken(user,201,res,"User Registered Successfully!")
});



// Login API
export const login = catchAsyncError(async (req,res,next)=>{
    const {email,password,role} = req.body;
    if(!email || !password || !role){
        return next(new ErrorHandler("Please provide email,password and role!",400));
    }
    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid Email or Password!",400));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email or Password!",400));
    }
    if(user.role !== role){
        return next(new ErrorHandler("User with this role not found!",400));
    }
    sendToken(user,200,res,"User logged in Successfully!")
});



// Logout API
export const logout = catchAsyncError(async (req,res,next)=>{
    res.status(200).cookie("token","",{
        httpOnly:true,
        expires : new Date(Date.now())
    }).json({
        success:true,
        message: "User Logged Out Successfully!"
    })
})



// Get User API
export const getUser = catchAsyncError((req,res,next)=>{
    const user = req.user;
    res.status(200).json({
        success: true,
        user
    });
});




// Send OTP API
export const sendOtp = (req,res)=>{
    const {email} = req.body;
    var otp = Math.floor(Math.random() * 87637).toString().padStart(6,0)

    Otp.deleteOne({email:email}).then(async(res5)=>{
        await User.find({email:email}).then((res1)=>{
            if(res1.length > 0){
                Otp.insertMany({time: Number(new Date()), email:res1[0].email, otp:otp}).then((res2)=>{
                    if(res2.length > 0){
                        transporter.sendMail({
                            from : '"Node-web 👻" <akshatbari2004@gmail.com>',
                            to : email,
                            subject : "Password Reset (Node Web)",
                            text : "Hello " + res1[0].name,
                            html : `<p>Your 6 digit OTP to reset password is:</p><br><h4>${otp}</h4>` 
                        }).then((m_res)=>{
                            if(m_res.messageId){
                                res.status(200).send({status:200,message:"OTP sent Successfully"});
                            }else{
                                res.status(400).send({status:400,message:"Something Went Wrong || Please try again !!"});    
                            }
                        }).catch((err)=>{
                            res.status(400).send({status:400,message:"Something Went Wrong || Please try again !!"});
                        })
                    }else{
                        res.status(400).send({status:400, message: "Something went wrong,Try Again!!"})
                    }
                }).catch((err)=>{
                    res.status(500).send({status:500,message:"Something Went Wrong !!"})  
                })
            }else{
                res.status(400).send({status:400, message: "You are not a registered user!!"})
            }
        }).catch((err)=>{
            res.status(500).send({status:500,message:"Something Went Wrong !!"})  
        })
    }).catch((err)=>{
        res.status(500).send({status:500,message:"Something Went Wrong !!"})
    })
}



// Verifying and Changing Password OTP API
export const verifyOtpAndChangePassword = async (req, res) => {
    try {
        const { email, otp, newPass } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ status: 400, message: "You are not a registered user!!" });
        }

        const otpRecord = await Otp.findOne({ email });
        if (!otpRecord) {
            return res.status(400).send({ status: 400, message: "OTP not found or already used!" });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).send({ status: 400, message: "Incorrect OTP!!" });
        }

        const currentTime = Number(new Date());
        const otpTimeDifference = (currentTime - otpRecord.time) / 1000;

        if (otpTimeDifference > 300) { // 300 seconds = 5 minutes
            return res.status(403).send({ status: 403, message: "Your OTP has expired!!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPass, salt);

        const updateResult = await User.updateOne({ email }, { $set: { password: hashedPassword } });
        if (updateResult.modifiedCount !== 1) {
            return res.status(400).send({ status: 400, message: "Failed to update password!" });
        }

        const deleteResult = await Otp.deleteOne({ email });
        if (deleteResult.deletedCount !== 1) {
            return res.status(500).send({ status: 500, message: "Failed to delete OTP record!" });
        }

        const mailResult = await transporter.sendMail({
            from: '"Node-web 👻" <akshatbari2004@gmail.com>',
            to: email,
            subject: "Password Changed (Node Web)",
            text: `Hello ${user.name}`,
            html: `<p>Your Password has been updated Successfully</p>`
        });

        if (!mailResult.messageId) {
            return res.status(500).send({ status: 500, message: "Failed to send confirmation email!" });
        }

        return res.status(200).send({ status: 200, message: "Password Updated Successfully!!" });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send({ status: 500, message: "Something Went Wrong!!" });
    }
};
