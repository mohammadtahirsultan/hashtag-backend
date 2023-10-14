import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  category: String,
  content: String,
  shortDescription: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  image: {
    public_id: {
        type: String,
    },
    url: {
        type: String,
        required: true
    }
}
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
