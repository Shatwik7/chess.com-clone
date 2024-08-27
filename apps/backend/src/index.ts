
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import cors from 'cors';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase, UserModel, GameModel, MoveModel, NotificationModel } from '@myorg/db';
const run = async () => {
  await connectToDatabase('mongodb://127.0.0.1:27017/testChess');

  // Create a new user
  const user1 = new UserModel({
    userId: 'user23',
    name: 'Alice',
    email: 'alice@example.com',
    password: 'hashed_password',
    rating: 1400,
    online: true,
  });

  await user1.save();

  // Create a new game
  const game = new GameModel({
    gameId: 'game2',
    player1Id: 'user4',
    player2Id: 'user5',
    startTime: new Date(),
    result: 'draw',
  });

  await game.save();

  // Create a new move
  const move = new MoveModel({
    moveId: 'move43',
    gameId: 'game1',
    playerId: 'user1',
    move: 'e4',
  });

  await move.save();

  // Add the move to the game
  game.moves.push(move._id);
  await game.save();

  // Create a notification
  const notification = new NotificationModel({
    notificationId: 'noti32',
    userId: 'user1',
    message: 'Your game has started!',
  });

  await notification.save();
};

run().catch(console.error);

const redis=new Redis({
  port: 6380, // Redis port
  host: "127.0.0.1", // Redis host
});
const { default: RedisStore } = require('connect-redis');
const app = express();
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

interface User {
  username: string;
  password: string;
  id:string;
  
}

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

const users: User[] = [];

app.post('/register', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  let id= uuidv4();
  users.push({ username, password: hashedPassword,id });
  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = users.find((user) => user.username === username);
  
  if (user && (await bcrypt.compare(password, user.password))) {
    const userToken=uuidv4();
    redis.set(userToken,JSON.stringify({username:user.username,userId:user.id}),'EX',24*3600);
    console.log(user.username);
    res.status(200).json({ message: 'Login successful', userId:user.id, userToken :userToken });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

app.get('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});

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

app.all('*', (req: Request, res: Response) => {
  res.status(404).json({ message: 'LOST YOUR WAY' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
