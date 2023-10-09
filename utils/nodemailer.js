import nodemailer from 'nodemailer'
import NewsLetter from '../models/newsletter.js';

export default async function sendEmailNotificationsToUsers() {
    try {
        // Fetch the list of users from your database with their email addresses
        const users = await NewsLetter.find({}, 'email'); // Replace 'User' with your actual User model

        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                // user: 'Hashtag Web', // Replace with your Gmail email address
                user: process.env.SMTP_USERNAME, // Replace with your Gmail email address
                pass: process.env.SMTP_PASSWORD, // Replace with your Gmail password or app-specific password
            },
        });

        // Loop through each user and send them an email
        for (const user of users) {
            const mailOptions = {
                from: 'hashtagweb69@gmail.com', // Replace with your Gmail email address
                to: user.email,
                subject: 'New Blog Created',
                text: 'A new blog has been created. Check it out!',
            };

            // Send the email
            await transporter.sendMail(mailOptions);
        }
    } catch (error) {
        console.error("Error sending email notifications:", error);
    }
}