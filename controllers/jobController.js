import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import ErrorHandler from "../middlewares/error.js";
import { Job } from "../models/jobSchema.js";


export const getAllJobs = catchAsyncError(async(req,res,next)=>{
    const jobs = await Job.find({expired:false});
    res.status(200).json({
        success:true,
        jobs,
    });
});

export const postJob = catchAsyncError(async(req,res,next)=>{
    const {role} = req.user;
    if(role === "Job Seeker"){
        return next(new ErrorHandler("Job Seeker is not allowed to access these resources!!",400));
    }
    const {title,description,category,country,city,location,fixedSalary,salaryFrom,salaryTo} = req.body;

    if(!title || !description || !category || !country || !city|| !location){
        return next(new ErrorHandler("Please Provide Full Job Details!",400));
    }
    if((!salaryFrom || !salaryTo) && !fixedSalary){
        return next(new ErrorHandler("Please Provide Either Fixed Salary or Salary in Range!"));
    }
    if(salaryFrom && salaryTo && fixedSalary){
        return next(new ErrorHandler("Cannot Enter Fixed Salary And Ranged Salary Together!!"));
    }

    const jobPostedBy = req.user._id;
    const job = await Job.create({
        title,description,category,country,city,location,fixedSalary,salaryFrom,salaryTo,jobPostedBy 
    });
    res.status(200).json({
        success:true,
        message:"Job Posted Successfully!!",
        job
    });
});


export const getMyJobs = catchAsyncError(async(req,res,next)=>{
    const {role } = req.user;
    if(role === "Job Seeker"){
        return next(new ErrorHandler("Job Seeker is not allowed to access these resources!!",400));
    }

    const myJobs = await Job.find({jobPostedBy: req.user._id});
    res.status(200).json({
        success:true,
        myJobs,
    });
});


export const updateJob = catchAsyncError(async(req,res,next)=>{
    const {role } = req.user;
    if(role === "Job Seeker"){
        return next(new ErrorHandler("Job Seeker is not allowed to access these resources!!",400));
    }

    const {id} = req.params;
    let job = Job.findById(id);
    if(!job){
        return next(new ErrorHandler("job Not Found!",404));
    }
    job = await Job.findByIdAndUpdate(id,req.body,{
        new : true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(200).json({
        success:true,
        job,
        message:"Job Updated Successfully!"
    });
});


export const deleteJob = catchAsyncError(async(req,res,next)=>{
    const {role } = req.user;
    if(role === "Job Seeker"){
        return next(new ErrorHandler("Job Seeker is not allowed to access these resources!!",400));
    }

    const {id} = req.params;
    let job = Job.findById(id);
    if(!job){
        return next(new ErrorHandler("job Not Found!",404));
    }

    await Job.deleteOne();
    res.status(200).json({
        success:true,
        message:"Job Deleted Successfully!"
    })
})



export const getSingleJob = catchAsyncError(async(req,res,next)=>{
    const {id} = req.params;
    try {
        const job = await Job.findById(id);
        if(!job){
            return next(new ErrorHandler("Job not found!",404));
        }
        res.status(200).json({
            success:true,
            job,
        });
    } catch (error) {
        return next(new ErrorHandler("Invalid ID/ CaseError",400));
    }
})