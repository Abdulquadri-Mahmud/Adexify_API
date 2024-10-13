import express from "express";
import { allUsers, deleteAccount, signin,
    signOut, signup, updateUser, userForgotPassword, 
    userResetPassword
} from "../controller/user_controller.js";

const app = express();

app.post('/signup', signup);
app.post('/signin', signin);
app.get('/signout', signOut);
app.patch('/update/:id', updateUser);
app.delete('/delete/:id', deleteAccount);
app.get('/all-user', allUsers);
app.post('/forgot-password', userForgotPassword);
app.post('/reset-password/:token', userResetPassword);

export default app;