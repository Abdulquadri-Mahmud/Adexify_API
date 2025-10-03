import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  postalCode: {
    type: String
  },
  notes: {
    type: String
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  addresses: [addressSchema], // multiple addresses
  resetPasswordToken: { type: String, default: "" },
  resetPasswordExpires: { type: Date, default: "" }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
