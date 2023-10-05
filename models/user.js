import mongoose from "mongoose";

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

const User = mongoose.model("User", authSchema);

export default User
