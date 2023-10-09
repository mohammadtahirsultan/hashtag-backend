import Contact from "../models/contact.js";


export const contactUs = async (req, res) => {
    try {
        const { name, phoneNo, email, business, subject, content } = req.body

        await Contact.create({
            name, phoneNo, email, business, subject, content
        });

        return res.status(201).json({ message: "Message Received Successfully!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}