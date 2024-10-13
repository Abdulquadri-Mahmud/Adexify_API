import mongoose from "mongoose";

var userSchema = new mongoose.Schema({
    firstname : {
        type: String,
        required: true,
    },
    lastname : {
        type: String,
        required: true,
    },
    phone : {
        type: String,
        required: true,
        unique: true
    },
    email : {
        unique: true,
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true,
    },
    address : {
        type: String,
        required: true,
    },
    avatar : {
        type: String,
    },
    resetPasswordToken: {
        type: String,
        default: ''
    },
    resetPasswordExpires: {
        type: Date,
        default: ''
    }
}, {timestamps: true});

const User = mongoose.model('user', userSchema);

export default User;