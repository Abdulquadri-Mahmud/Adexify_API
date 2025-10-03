import express from "express";
import { allUsers, deleteAccount, getUserById, signin,
    signOut, signup, updateUser, userForgotPassword, 
    userResetPassword
} from "../controller/user_controller.js";

const app = express();

app.post('/signup', signup);
app.post('/signin', signin);
app.get('/signout', signOut);

app.get('/get-user', getUserById);

app.patch('/update', updateUser);
app.delete('/delete/:id', deleteAccount);
app.get('/all-user', allUsers);
app.post('/forgot-password', userForgotPassword);
app.post('/reset-password/:token', userResetPassword);

export default app;