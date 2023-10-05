import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema({
  fullname:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  phoneNo:{
    type:Number,
    required:true
  },
  linkedInProfile:{
    type:String,
    required:true
  },
  city:{
    type:String,
    required:true
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;
