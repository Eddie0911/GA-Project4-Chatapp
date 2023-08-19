import express from 'express';
import dotenv from 'dotenv';
import mongoose, { connect } from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import Message from './models/Message.js';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';



dotenv.config();
mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname ,'uploads')));


app.use(cors({
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    origin: process.env.CLIENT_URL,
}));

app.use(express.static('../dist'));

async function getUserDataFromRequest(req) {
    return new Promise((resolve, reject) => {
      const token = req.cookies?.token;
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          resolve(userData);
        });
      } else {
        reject('no token');
      }
    });
  }

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



app.get('/people', async (req,res) => {
    const users = await User.find({},{'_id':1,username:1});
    res.json(users);
    console.log(users);
})

app.get('/api/check-username/:username', async (req,res)=>{
    const{ username } = req.params;
    try {
        const user = await User.findOne({ username });
        res.json({exists:!!user});
    } catch(error){
        console.log(error);
        res.status(500).json({message:"An error occurred"});
    }
});

app.get('/messages/:userId', async (req,res)=>{
    const {userId} = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;
    const messages = await Message.find({
        sender:{$in:[userId,ourUserId]},
        recipient:{$in:[userId,ourUserId]},
    }).sort({createdAt:1});
    res.json(messages);
});

app.delete('/messages/:messageId', async (req,res) =>{
  const messageId = req.params.messageId;
  const messages = await Message.deleteOne({_id:messageId});
  res.json(messages);
});

app.put("/updateUser/:id", async (req, res) => {
  const userId = req.params.id;
  console.log(userId);
  const { newUsername, newPassword } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "user does not exist" });
    }

    
    if (newUsername) {
      user.username = newUsername;
    }
    if (newPassword) {
      const hashedNewPassword = bcrypt.hashSync(newPassword, bcryptSalt);
      user.password = hashedNewPassword;
    }

    await user.save();

   
    const token = jwt.sign({ userId: user._id, username: user.username }, jwtSecret, {});

  
    res.cookie("token", token, { sameSite: "none", secure: true }).status(200).json({ message: "update succeed" });
  } catch (error) {
    console.error("error:", error);
    return res.status(400).json({ message: "something wrong." });
  }
});
  

app.post('/login', async (req,res) => {
    const {username, password} = req.body;
    const foundUser = await User.findOne({username});
    if (foundUser) {
      const passOk = bcrypt.compareSync(password, foundUser.password);
      if (passOk) {
        jwt.sign({userId:foundUser._id,username}, jwtSecret, {}, (err, token) => {
          res.cookie('token', token, {sameSite:'none', secure:true}).json({
            _id: foundUser._id,
          });
        });
      }
    }
  });

app.post('/logout', (req,res) =>{
    res.cookie('token', '', {sameSite:'none', secure:true}).json('ok');
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
});


const server = app.listen(process.env.PORT || 4040);
// const server = app.listen(4040);

const wss = new WebSocketServer({server});

wss.on('connection',(connection,req)=>{

    function notifyAboutOnlinePeople() {
        [...wss.clients].forEach(client => {
          // console.log(wss.clients);
          client.send(JSON.stringify({
            online: [...wss.clients]
            .filter(c =>c.userId && c.username)
            .map(c => ({userId:c.userId,username:c.username,isAlive:c.isAlive})),
          }));
        });
      }
    
      connection.isAlive = true;
    
      // connection.timer = setInterval(() => {
      //   connection.ping();
      //   connection.deathTimer = setTimeout(() => {
      //     connection.isAlive = false;
      //     clearInterval(connection.timer);
      //     connection.terminate();
      //     notifyAboutOnlinePeople();
      //     console.log('dead');
      //   }, 1000);
      // }, 5000);
    
      connection.on('pong', () => {
        clearTimeout(connection.deathTimer);
      });  




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


    connection.on('message', async (message)=>{
        console.log(`receive the message ${message}`);
        const messageData = JSON.parse(message.toString());
        if(messageData['type'] && messageData['type'] === 'delete'){
          console.log(`excuting delete`);
          [...wss.clients].forEach(c =>c.send(JSON.stringify({
                type:'delete',
            }))  
          )
          // return;
        } else {
          console.log(`saving message`);
        // const messageData = JSON.parse(message.toString());
        // console.log(messageData);
        const{recipient, text,file} = messageData;
        let filename = null;
        if(file){
            // console.log('size',file.data.length);
            const parts = file.name.split('.');
            // console.log(parts);
            const ext = parts[parts.length -1];
            filename = parts[0] + "." + ext;
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const filePath = path.join(__dirname,'uploads',filename);
            const bufferData = new Buffer.from(file.data.split(',')[1], 'base64');
            fs.writeFile(filePath,bufferData, ()=>{
                console.log('file saved:' + filePath);
            })
        }
        if(recipient && (text || file)){
            const messageDoc =  await Message.create({
                sender:connection.userId,
                recipient,
                text,
                file:file ? filename : null,
            });
            [...wss.clients]
            .filter(c => c.userId === recipient)
            .forEach(c =>c.send(JSON.stringify({
                text,
                sender:connection.userId,
                id:messageDoc._id,
                recipient,
                file:file ? filename : null,
            })));
        }
      }
    });
  
    //TRY creating close 
    connection.on('close', (message)=>{
          connection.isAlive = false;
          connection.terminate();
      // console.log(message);
      console.log('closing connection');
      notifyAboutOnlinePeople();
    })
    notifyAboutOnlinePeople();
});

