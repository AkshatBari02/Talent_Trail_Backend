import express from 'express';
import {deleteJob, getAllJobs,getMyJobs,getSingleJob,postJob, updateJob} from "../controllers/jobController.js";
import {isAuthorized} from "../middlewares/auth.js";


const router = express.Router();
router.get("/getalljobs",getAllJobs);
router.post("/postjob",isAuthorized,postJob);
router.get("/getmyjobs",isAuthorized,getMyJobs);
router.put("/updatemyjob/:id",isAuthorized,updateJob);
router.delete("/deletemyjob/:id",isAuthorized,deleteJob);
router.get("/:id",isAuthorized,getSingleJob);

export default router;