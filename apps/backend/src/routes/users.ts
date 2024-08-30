import express from 'express';
const { registerUser,loginUser , logoutUser } = require("../controllers/users");
import catchAsync from "../utils/catchAsync";

const router=express.Router();

router.route('/register')
    .post(catchAsync(registerUser));

router.route('/login')
    .post(catchAsync(loginUser));

router.route('/logout')
    .get(catchAsync(logoutUser));

export { router };