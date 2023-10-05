import JobApplication from "../models/job-application.js";


export const submitApplication = async (req, res) => {

    const { fullname, email, phoneNo, linkedInProfile, city } = req.body;

    if (!fullname || !email || !phoneNo || !linkedInProfile || !city) {
        return res.status(401).json({ message: "All Fields are Required!" });
    }

    try {
        // Create a new job application instance
        await JobApplication.create({
            fullname, email, phoneNo, linkedInProfile, city
        });

        return res.status(201).json({ message: "Application Submitted Successfully!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }


}


