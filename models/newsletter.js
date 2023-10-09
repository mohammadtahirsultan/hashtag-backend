import mongoose from "mongoose";

const NewsLetterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },

    status: {
        type: Boolean,
        default: false
    },


});

const NewsLetter = mongoose.model("NewsLetter", NewsLetterSchema);

export default NewsLetter;
