import express from "express"
import { contactUs } from "../controller/contact-us.js"

const router = express.Router()

router.post("/contact", contactUs)

export default router
