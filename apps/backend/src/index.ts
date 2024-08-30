
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase, UserModel, GameModel, MoveModel, NotificationModel } from '@myorg/db';
import ExpressError from './utils/expressError';
import { initializeDatabase } from './initDb';
import redis from './redisClient';
import { router as userRoutes } from './routes/users';

const app = express();
initializeDatabase();

const { default: RedisStore } = require('connect-redis');

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET || 'YOUR_SECRET';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin:  ['http://localhost:4173', 'http://localhost:5173'], // Adjust to match your frontend URL
  credentials: true
}));

app.use(
  session({
    store: new RedisStore({ client: redis }),
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);



const isLoggedIn=(req:Request,res:Response,next:NextFunction)=>{
  console.log(req.session);
    if(req.session.userId){
        console.log("logged in : true");
        return next(); 
    }
    return res.json({
        type:"login_failure",
        message:"You are not logged in"
    })
}


app.use('/',userRoutes);

app.get('/secure',isLoggedIn,(req:Request,res:Response)=>{
    console.log("secure route");
    res.json({
        "message":"this is secure route and you are logged in"
    })
})
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    type: 'health',
    status: 'all good',
  });
});

app.all('*', (req: Request, res: Response,next:NextFunction) => {
  next(new ExpressError('page not found',404));
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if(!err.messaage) err.messaage="Oh no somthing went wrong !!";
  res.status(err.statusCode || 500).json({ message: err.message });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
