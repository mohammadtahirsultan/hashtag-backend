import express from "express"
import { submitApplication } from "../controller/job-application.js"

const router = express.Router()

router.post("/application/job", submitApplication)


export default router
