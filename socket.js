require('dotenv').config();
const socket = require('socket.io');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const path = require('path');
const bodyParser = require('body-parser')
const Server = require('http').createServer(app);
const io = require('socket.io')(Server, {
    cors: {
        origin: '*',
    }
});
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(()=>{
    console.log('connection successfull :))')
  }).catch((err)=>{
    console.log(err)
  });
const db = require('./db/dbmongo')
const ROOMS = [];

app.set('view engine', 'ejs')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')))
app.use(express.static(path.join(__dirname, 'pics')))
app.use(express.static(path.join(__dirname, 'js')))
app.use(express.static(path.join(__dirname, 'node_modules')))
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/newHome.html'))
})

// let id = null
app.get('/party', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'))
})
app.get('/swipe', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/swip.html'))
})
app.get("/room-not-found",(req,res)=>{
    res.sendFile(path.join(__dirname,'views/notfound.html'))
})
let checkRoomID = "";
app.post('/check', (req, res) => {
    let reqRoomID = req.body['room'];
    if(ROOMS.length===0){
        res.redirect("/room-not-found")
    }
    for (let i of ROOMS) {
        if (i === reqRoomID) {
            res.redirect('/party')
            break
        }
        else {
            res.redirect("/room-not-found")
            break
        }
    }
})
const users = {};  //id with name
const room = {};   //roomid -> users id
const userRoom = {};  //userid -> roomid
const links = {};  //roomid -> link
io.on('connection', socket => {
    socket.on('user-join', name => {
        const newID = db.makeid(6);
        socket.join(newID);
        ROOMS.push(newID);
        users[socket.id] = name;
        room[newID] = [socket.id];
        db.makeModel(newID);
        userRoom[socket.id] = newID;
        // console.log("hello", name, socket.id, newID);
        // console.log(users[socket.id])s
        io.in(newID).emit('user', { name: users[socket.id], room_id: newID, id: socket.id })
        socket.emit('room-id', newID)
        let userList = room[newID]
        io.to(socket.id).emit('active_admin', socket.id, userList, users)
    })
    socket.on("room", (key, name) => {
        socket.join(key)
        users[socket.id] = name
        userRoom[socket.id] = key;
        room[key].push(socket.id)
        db.getChat(key).then((doc)=>{
            io.to(socket.id).emit('old-chat',doc)
            io.in(key).emit('user', { name: users[socket.id], room_id: key, id: socket.id })
        })
        socket.emit('room-id', key)
        let userList = room[key]
        io.to(socket.id).emit('active_admin', socket.id, userList, users)
        socket.to(key).emit('active_user', socket.id, name)
        // console.log(rooms)
    })
    // socket.on('queue',(userQueue,key)=>{
    //     socket.to(key).emit('add-queue',userQueue)
    // })
    socket.on('admin', (user_id, room_id) => {
        socket.emit('new-admin', user_id)
    })
    socket.on("send", (userName,messege, key) => {
        db.insertChat(key,userName,messege,socket.id);
        socket.to(key).emit('receive', { messege: messege, name: users[socket.id] })
        // console.log(users)
    })
    socket.on("start-vid-time",(time,key)=>{
        socket.to(key).emit('current-vid-time',time)
    })
    socket.on('playvid', key => {
        socket.to(key).emit('play')
    })
    socket.on("pausevid", key => {
        socket.to(key).emit('pause')
    })
    socket.on('remove-sync',key=>{
        socket.to(key).emit('remove-user-sync')
    })
    socket.on('add-sync',key=>{
        socket.to(key).emit('add-user-sync')
    })
    socket.on("seekvid", (time, key) => {
        socket.to(key).emit('seek', time)
    })
    socket.on("video-link",(link,key)=>{
        if(link!="null"){
            links[key]=link;
            socket.to(key).emit('get-link',link)
        }
        else{
            if(links[key]!=undefined){
                socket.to(key).emit('get-link',links[key])
            }
            else if(link.length ==80){//https://drive.google.com/file/d/1ZdcTeG5vBcbc4eVq352SpQGz-P04g-UL/view?usp=sharing
                links[key]=link;
                socket.to(key).emit('get-link',links[key])//https://drive.google.com/file/d/1QD_Sqq_Ee6xt-KR6Ob0tBPKL0L7naVS8/view?usp=sharing
            }
        }
    })
    socket.on('remove', userid => {
        io.to(userid).emit('remove', userid)
    })
    socket.on('make-admin', (userid, prev) => {
        let key = userRoom[userid]
        const index = room[key].indexOf(userid);
        [room[key][0], room[key][index]] = [room[key][index], room[key][0]]
        io.to(key).emit('make-admin', userid, prev)
    })
    socket.on('previous-admin', (id, prev_id) => {
        let key = userRoom[id]
        io.to(key).emit('prev-admin', id, prev_id)
    })
    socket.on("disconnect", messege => {
        let key = userRoom[socket.id];
        socket.to(key).emit('leave', { name: users[socket.id], user_id: socket.id })
        if (Object.keys(room).length > 0) {
            try{
                let userList = room[key]

            if (userList[0] === socket.id) {
                let left = room[key].shift()
                socket.to(key).emit('new-admin', { id: userList[0], room: key })
                // console.log(userList[0])
            }
            else {
                const index = room[key].indexOf(socket.id);
                if (index > -1) {
                    room[key].splice(index, 1);
                }
            }
        
            console.log(room[key])
            if (room[key].length === 0) {
                const index = ROOMS.indexOf(key);
                if (index > -1) {
                    ROOMS.splice(index, 1);
                }
                delete users[socket.id];
                delete room[key]
                delete links[key]
                db.deleteCollection(key);
                console.log(ROOMS)
            }
        }
        catch{
            console.log('err')
        }
            // console.log(rooms)
        }
        console.log('end')
        delete userRoom[socket.id];
    })
})

Server.listen(process.env.PORT || 8000, () => {
    console.log(`http://localhost:${PORT}`)
})

