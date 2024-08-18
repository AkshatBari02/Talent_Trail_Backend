import express from 'express';
import {employerGetAllApplications,jobseekerDeleteApplication,jobseekerGetAllApplications, postApplication, responseApplication,} from "../controllers/applicationController.js";
import { isAuthorized } from '../middlewares/auth.js';


const router = express.Router();


router.get("/jobseeker/getallapplications",isAuthorized,jobseekerGetAllApplications);
router.get("/employer/getallapplications",isAuthorized,employerGetAllApplications);
router.delete(`/deleteapplication/:id`,isAuthorized,jobseekerDeleteApplication);
router.post("/postapplication",isAuthorized,postApplication);
router.post("/responseapplication",isAuthorized,responseApplication);

export default router;