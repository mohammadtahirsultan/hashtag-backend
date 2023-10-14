import express from "express"
import { addBlog, deleteBlog, getAllBlogs, getSingleBlog, updateBlog } from "../controller/blogs.js"
import upload from "../multer/upload.js"

const router = express.Router()


router.post("/addblogs", addBlog)
router.get("/blogs", getAllBlogs)
router.delete("/blogs/:id", deleteBlog)
router.get("/blogs/:id", getSingleBlog)
router.put("/blog/:id", updateBlog)

export default router
