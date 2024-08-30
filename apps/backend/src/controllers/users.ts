import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import redis from "../redisClient";
import { UserModel } from "@myorg/db";

const registerUser=async(req:Request,res:Response)=>{
    console.log(req.body);
    const { username, password ,email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user=new UserModel({name:username,password:hashedPassword,email:email});
    await user.save();
    } catch (error) {
        console.log(error);
    }
    res.status(201).json({ message: 'User registered successfully' });
}
const loginUser=async(req:Request,res:Response)=>{
    console.log(req.body);
    const { username, password } = req.body;
    const user = await UserModel.findOne({ name:username });
    
    if (user && (await bcrypt.compare(password, user.password))) {
      const userToken=uuidv4();
      req.session.user = user;
      req.session.token=userToken;
      await redis.set(userToken,JSON.stringify({username:user.name,userId:user.id}),'EX',24*3600);
      console.log(user.name);
      res.status(200).json({ message: 'Login successful', userId:user.id, userToken :userToken });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
}

const logoutUser=async(req:Request,res:Response)=>{
    await redis.del(`${req.session.token}`);
    req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to logout' });
        }
        res.status(200).json({ message: 'Logout successful' });
      });
}

module.exports={registerUser,loginUser,logoutUser};