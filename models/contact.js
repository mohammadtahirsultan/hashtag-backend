import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phoneNo: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    business: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    contactAt: {
        type: Date,
        default: Date.now,
    },
});

const Contact = mongoose.model("Contact", ContactSchema);

export default Contact;
