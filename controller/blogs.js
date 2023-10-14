import Blog from '../models/blogs.js'
import apiFeatures from '../utils/blogSearchAndPagination.js'
import sendEmailNotificationsToUsers from '../utils/nodemailer.js';
import cloudinary from 'cloudinary'

// Implementation of blogs
export const addBlog = async (req, res) => {

    try {
        let cloudinaryRes;
        if (req.body.image) {
            cloudinaryRes = await cloudinary.v2.uploader.upload(req.body.image,
                {
                    folder: "Hashtagweb Blogs",
                    crop: "scale",
                },
            );
        }
        const { title, category, shortDescription, content, author } = req.body;


        await Blog.create({
            title, category, shortDescription, content, author, image: {
                public_id: cloudinaryRes.public_id,
                url: cloudinaryRes.secure_url
            }
        })

        return res.status(201).json({
            success: true,
            message: "Blog Added Successfully",
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }



    // try {
    //     // if (!req.file) {
    //     //     return res.status(400).json({ message: "No image file provided" });
    //     // }
    //     // const image = req.file.filename;
    //     const newBlog = new Blog({
    //         title,
    //         author,
    //         category,
    //         shortDescription,
    //         content,
    //         // image,
    //     });

    //     // Save the new blog to the database
    //     await newBlog.save();

    //     // Send Gmail notifications to users
    //     await sendEmailNotificationsToUsers();

    //     return res.status(201).json({ message: "Blog created successfully" });
    // } catch (error) {
    //     console.error(error);
    //     if (error.name === "ValidationError") {
    //         return res
    //             .status(400)
    //             .json({ error: "Validation error", details: error.errors });
    //     }

    //     return res.status(500).json({ error: "Internal server error" });
    // }


};



// endpoint to get all the blogs
export const getAllBlogs = async (req, res) => {
    try {


        const resultPerPage = 4;

        // Count all documents first
        const blogsCount = await Blog.countDocuments();

        let apiFeature = new apiFeatures(Blog.find(), req.query).search().filter();
        apiFeature.pagination(resultPerPage);

        // Execute the query once and store the result in a variable
        const blogsQuery = await apiFeature.query;

        const featuredBlog = await Blog.find({ featured: true }).lean("image");
        const latestBlogs = await Blog.find().sort({ createdAt: -1 }).limit(10);
        const relatedBlogs = await Blog.find().sort({ createdAt: -1 }).limit(2);

        const filterBlogsCount = blogsQuery.length; // Count the filtered documents from the result

        return res.status(200).json({
            success: true,
            blogs: blogsQuery, // Use the stored query result
            featuredBlog,
            latestBlogs,
            relatedBlogs,
            blogsCount,
            filterBlogsCount,
            resultPerPage
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}



// endpopint to delete the blog with respect to its id
export const deleteBlog = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedBlog = await Blog.findByIdAndRemove(id);

        if (!deletedBlog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        // Delete the associated image file from the server
        fs.unlink(`uploads/${deletedBlog.image}`, (err) => {
            if (err) {
                console.error(err);
            }
        });

        return res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.error(error);

        // Handle specific errors
        if (error.name === "CastError") {
            return res.status(400).json({ error: "Invalid blog ID" });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
}

// fetch specific blog by given id
export const getSingleBlog = async (req, res) => {
    const { id } = req.params;

    try {
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        // Construct the full URL for the image using the base URL of your server
        // const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${blog.image}`;

        // Include the image URL in the response
        const blogWithImage = {
            ...blog._doc,
        };

        return res.status(200).json({
            success: true,
            blogWithImage
        });
    } catch (error) {
        console.error(error);

        // Handle specific errors
        if (error.name === "CastError") {
            return res.status(400).json({ error: "Invalid blog ID" });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
};


export const updateBlog = async (req, res) => {

    try {

        const { title, category, content } = req.body;

        let blog = await Blog.findById(req.params.id)

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog Not Found"
            })
        }


        let cloudinaryRes;
        if (req.body.image) {
            if (blog.image && blog.image.public_id) {

                let blogImageId = blog.image.public_id

                await cloudinary.v2.uploader.destroy(blogImageId)


                cloudinaryRes = await cloudinary.v2.uploader.upload(req.body.image,
                    {
                        folder: "Hashtagweb Blogs",
                        crop: "scale",
                    },
                );


                blog.image = {
                    public_id: cloudinaryRes.public_id,
                    url: cloudinaryRes.secure_url
                }
                await blog.save()
            }
        }


        blog = await Blog.findByIdAndUpdate(req.params.id, {
            title, category, content
        })

        return res.status(200).json({
            success: true,
            message: "Blog Updated Successfully"
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }





    // try {
    //     // Find the blog by ID
    //     const blog = await Blog.findById(id);

    //     if (!blog) {
    //         return res.status(404).json({ error: "Blog not found" });
    //     }
    //     if (req.file) {
    //         if (blog.image) {
    //             // Import the fs module to handle file operations
    //             const fs = require("fs");
    //             const imagePath = `./uploads/${blog.image}`;
    //             if (fs.existsSync(imagePath)) {
    //                 fs.unlinkSync(imagePath);
    //             }
    //         }

    //         // Update the image field with the new file name
    //         blog.image = req.file.filename;
    //     }

    //     // Update the other blog fields
    //     blog.title = title;
    //     blog.category = category;
    //     blog.content = content;

    //     await blog.save();

    //     return res.status(200).json({ message: "Blog updated successfully" });
    // } catch (error) {
    //     console.error(error);
    //     return res.status(500).json({ error: "Internal server error" });
    // }
};
