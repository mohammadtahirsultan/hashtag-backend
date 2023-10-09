import express from "express"
import { newsletterSubscribe, newsletterUnsubscribe } from "../controller/newsletter.js"


const router = express.Router()

router.post("/newsletter/subscribe", newsletterSubscribe)
router.post("/newsletter/unsubscribe", newsletterUnsubscribe)

export default router
