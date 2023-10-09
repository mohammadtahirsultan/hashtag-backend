import NewsLetter from "../models/newsletter.js";


export const newsletterSubscribe = async (req, res) => {

    const { email } = req.body;

    try {
        let newsletter = await NewsLetter.create({ email });

        newsletter.status = true

        await newsletter.save()

        return res.status(201).json({ message: "Newsletter Subscribed Successfully!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

}
export const newsletterUnsubscribe = async (req, res) => {

    try {

        let newsletter = await NewsLetter.findOne({ email })
        newsletter.status = false
        await newsletter.save()

        return res.status(201).json({ message: "Newsletter Unsubscribed Successfully!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

}


