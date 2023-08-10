import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import WebSocket, { WebSocketServer } from 'ws';



dotenv.config();
mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    origin: process.env.CLIENT_URL,
}));

app.get('/test', (req,res)=>{
    res.json('test ok');
});

app.get('/profile',(req,res)=>{
    const token = req.cookies?.token;
    // console.log(token);
    if(token){
    jwt.verify(token, jwtSecret, {}, (err, userData)=>{
        if (err) throw err;
        res.json(userData);
        });
    } else {
        res.status(401).json("no token");
    }
});

app.get('/api/check-username/:username', async (req,res)=>{
    const{ username } = req.params;

    try {
        const user = await User.findOne({ username });
        res.json({exists:!!user});
    } catch(error){
        console.log(error);
        res.status(500).json({message:"An error occurred"});
    }
})

app.post('/login', async (req,res) => {
    const {username, password} = req.body;
    const foundUser = await User.findOne({username});
    if (foundUser) {
      const passOk = bcrypt.compareSync(password, foundUser.password);
      if (passOk) {
        jwt.sign({userId:foundUser._id,username}, jwtSecret, {}, (err, token) => {
          res.cookie('token', token, {sameSite:'none', secure:true}).json({
            id: foundUser._id,
          });
        });
      }
    }
  });

app.post('/register', async(req,res)=>{
    // const {username , password} = req.body;
    const username = req.body.username;
    const password = req.body.password;
    try{
        const hashedPassword = bcrypt.hashSync(password,bcryptSalt);
        const createdUser = await User.create({username:username , password: hashedPassword});
        jwt.sign({userId:createdUser._id,username},jwtSecret,{},(err,token)=>{
            if(err) throw err;
            res.cookie('token',token, {sameSite:'none',secure:true}).status(201).json({
                id:createdUser._id,
            })})
        } catch(error){
            res.status(400).json({message:"send this error"});
        }
})


const server = app.listen(4040)

const wss = new WebSocketServer({server});

wss.on('connection',(connection,req)=>{
    const cookies = req.headers.cookie;
    if(cookies){
        const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
        if(tokenCookieString){
            const token = tokenCookieString.split('=')[1];
            if(token){
                jwt.verify(token, jwtSecret, {} , (err,userData)=>{
                    if(err) throw err;
                    const {userId, username} = userData;
                    connection.userId = userId;
                    connection.username = username;
                });
            }
        }
    }

    connection.on('message',(message)=>{
        const messageData = JSON.parse(message.toString());
        console.log(messageData);
        const{recipient, text} = messageData;
        if(recipient && text){
            [...wss.clients]
            .filter(c => c.userId === recipient)
            .forEach(c =>c.send(JSON.stringify({text})));
        }
    });

    [...wss.clients].forEach(client =>{
        client.send(JSON.stringify({
            online:[...wss.clients].map(c => ({userId: c.userId, username:c.username}))
        }));
    });
});