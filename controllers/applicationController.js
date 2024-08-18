import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler, { errorMiddleware } from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import cloudinary from "cloudinary";
import { Job } from "../models/jobSchema.js";
import nodemailer from "nodemailer";

export const employerGetAllApplications = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler(
          "Job Seeker is not allowed to access these resources!!",
          400
        )
      );
    }

    const { _id } = req.user;
    const applications = await Application.find({ "employerID.user": _id });
    res.status(200).json({
      success: true,
      applications:applications,
    });
  }
);

export const jobseekerGetAllApplications = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler(
          "Employer is not allowed to access these resources!!",
          400
        )
      );
    }

    const { _id } = req.user;
    const applications = await Application.find({ "applicantID.user": _id });
    res.status(200).json({
      success: true,
      applications:applications,
    });
  }
);

export const jobseekerDeleteApplication = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler(
          "Employer is not allowed to access these resources!!",
          400
        )
      );
    }

    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application Not Found!", 404));
    }
    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application Deleted Successfully!",
    });
  }
);

export const postApplication = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler(
        "Employer is not allowed to access these resources!!",
        400
      )
    );
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Resume File Required!"));
  }

  const { resume } = req.files;
  const allowedFormats = ['image/png', 'image/jpg','image/jpeg', 'image/webp'];
  if (!allowedFormats.includes(resume.mimetype)) {
    return next(
      new ErrorHandler(
        "Invalid Resume File Type! Allowed File Formats: PNG,JPG,WEBP ",
        400
      )
    );
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    resume.tempFilePath
  );

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown cloudinary Error"
    );
    return next(new ErrorHandler("Failed to upload Resume", 500));
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;

  const applicantID = {
    user: req.user._id,
    role: "Job Seeker",
  };
  if (!jobId) {
    return next(new ErrorHandler("Job Not Found!", 404));
  }

  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job Not Found!", 404));
  }
  const employerID = {
    user: jobDetails.jobPostedBy,
    role: "Employer",
  };
  if (
    !name ||
    !email ||
    !coverLetter ||
    !phone ||
    !address ||
    !applicantID ||
    !employerID ||
    !resume
  ) {
    return next(new ErrorHandler("All Fields are Required!", 400));
  }

  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID,
    employerID,
    resume:{
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
    }
  });
  res.status(200).json({
    success:true,
    application,
    message:"Application Submitted Successfully!"
  })
});


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
      user: "akshatbari2004@gmail.com",
      pass: "uphmgvixzmjkqbkb"
  },
});

export const responseApplication = catchAsyncError(async(req,res,next)=>{
    const {name,fromEmail,toEmail,message} = req.body;
    if (
      !name ||
      !fromEmail ||
      !toEmail ||
      !message
    ) {
      return next(new ErrorHandler("All Fields Are Required!", 400));
    }
      await transporter.sendMail({
        from : `${name} <akshatbari2004@gmail.com> `,
        to : toEmail,
        subject : `Response to Your Application: at ${name}`,
        html : `<p>${message}</p><em>Contact Us:<br/>${fromEmail}</em>` 
      }).then((m_res)=>{
        if(m_res.messageId){
          res.status(200).send({status:200,message:"Response Sent Successfully !!"});
        }else{
          res.status(400).send({status:400,message:"Something Went Wrong || Please try again later !!"});    
        }
      }).catch((err)=>{
      res.status(400).send({status:400,message:"Something Went Wrong || Please try again !!"});
    })
})