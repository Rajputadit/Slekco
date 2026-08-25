import mongoose from "mongoose";

const contactLeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ContactLead", contactLeadSchema);
