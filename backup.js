// server.js
const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const Blog = require("./models/blogs");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const app = express();
const port = 5000;
const fs = require("fs");

mongoose.connect("mongodb://127.0.0.1:27017/hashtagweb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// multer configs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "uploads");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.get("/hi", async (req, res) => {
  res.send("Hello World")
})
// Define routes for login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }



    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If authentication is successful, you can return the user's role
    return res
      .status(200)
      .json({ message: "Login successful", role: user.role });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Register route
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  // Check if the email already exists
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create a new user with the provided role
    const newUser = new User({ username, email, password, role });

    // Save the new user to the database
    await newUser.save();

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// implementation of blogs

app.post("/api/addblogs", upload.single("image"), async (req, res) => {
  const { title, author, category, content } = req.body; // Include author field

  try {
    // Check if an image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Get the uploaded image file name
    const image = req.file.filename;

    // Create a new blog with the author's ID and the uploaded image
    const newBlog = new Blog({
      title,
      author, // Set the author field
      category,
      content,
      image, // Set the image field to the uploaded image file name
    });

    // Save the new blog to the database
    await newBlog.save();

    return res.status(201).json({ message: "Blog created successfully" });
  } catch (error) {
    console.error(error);

    // Handle specific errors
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Validation error", details: error.errors });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
});

// ... (other routes)

// endpoint to get all the blogs
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find(); // Fetch all blogs from the database
    return res.status(200).json(blogs);
  } catch (error) {
    alert("error occured");
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// endpopint to delete the blog with respect to its id
app.delete("/api/blogs/:id", async (req, res) => {
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
});

// fetch specific blog by given id
app.get("/api/blogs/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    // create the complete url for the image
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${blog.image
      }`;

    //  send the image with the url
    const blogWithImage = {
      ...blog._doc,
      image: imageUrl,
    };

    return res.status(200).json(blogWithImage);
  } catch (error) {
    console.error(error);

    // Handle specific errors
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid blog ID" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
});

// endpoint to update the blog by teh given id
app.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, category, content, author } = req.body;

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    blog.title = title;
    blog.category = category;
    blog.content = content;
    blog.author = author;

    if (req.file) {
      blog.image = req.file.filename;
    }

    await blog.save();

    return res.status(200).json({ message: "Blog updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});

// schema

const mongoose = require("mongoose");
const { log } = require("console");

const authSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["Super Admin", "Admin"],
    default: "Admin", // Set default role to Admin
  },
});

module.exports = mongoose.model("User", authSchema);
