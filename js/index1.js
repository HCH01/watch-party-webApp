let socket = io()

const form = document.getElementById('form')
const msginp = document.getElementById("message")
const msgcont = document.querySelector("#msg-cont")
const msgbox = document.querySelector('.msg.left')
const snycO = document.getElementById('btn')
const video_cont = document.getElementById('vid-cont')
const body = document.getElementById('body-container')
const video = document.querySelector("video")
const srcBtn = document.getElementById("src-play")
const videoSrCont = document.getElementById("video-src-cont")
let videoElement = document.getElementById("vide")
let inpSource = document.getElementById("input-source")
var scroll = msgcont.scrollHeight;
let srce = document.getElementById("vid-src")
var time = 0;
let userID;
let videoLink;
let userName = localStorage.getItem("name")
let roomKey = localStorage.getItem("key")
let admin = false
console.log(userName)
console.log(roomKey)
localStorage.setItem("name", " ")
localStorage.setItem("key", " ")

if (userName === " ") {
    window.location.href = "/";
}
else if (roomKey === " ") {

    socket.emit("user-join", userName)
    admin = true
}
else {
    socket.emit("room", roomKey, userName)
}
let id_count = true;
socket.on("room-id", key => {
    if (id_count) {
        showID(key)
        id_count = false
    }
})

// var check = name;
form.addEventListener('keypress', (e) => {
    if (e.key == 'Enter') {
        e.preventDefault();
        const messege = msginp.value;
        append(`${messege}`, 'right')
        socket.emit('send',userName, messege, roomKey)
        msginp.value = ''
    }
    msgcont.scrollTop = scroll;
    // check = name;
})
let flag = true
socket.on('user', data => {
    append(`${data.name} joined chat`, 'right');
    roomKey = data.room_id;
    if (flag) {
        userID = data.id;
        flag = false
    }
    if(admin){
        socket.emit('start-vid-time',video.currentTime,roomKey)
    }
    synFunc(roomKey);
    socket.emit('video-link','null',roomKey)
    // console.log(data.id)
})
socket.on('active_admin',(id,roomList,nameList)=>{
    userList(userName,id,roomList,nameList,true)

})
socket.on('active_user',(id,user)=>{
    userList(user,id,[],{})
})
let check ="null";
socket.on('receive', data => {
    if(check!=data.name){
        namappend(`${data.name}`,'left-name')
    }
        append(`${data.messege}`, 'left')
        console.log(data.name)
    
    
    check = data.name
    msgcont.scrollTop = scroll;
})
// console.log(admin)
const previousChats= (chats)=>{
    chats.forEach((data)=>{
        
    })
}
const pause = () => {
    video.pause();
}
if (admin) {

    video.addEventListener('play', event => {
        socket.emit('playvid', roomKey);
    })
    video.addEventListener('pause', event => {
        socket.emit('pausevid', roomKey);
    })
    video.addEventListener('seeked', event => {

        time = video.currentTime;
        socket.emit('seekvid', time, roomKey)
    })
    
    
}
else {
    video.controls = false
}
socket.on("current-vid-time",time=>{
    video.currentTime = time;
})

socket.on('play', () => {
    video.play();
})
socket.on('leave', data => {
    append(`${data.name} left the chat`, 'right')
    let ele = document.getElementById(data.user_id);
    ele.remove()
})
socket.on('remove',id =>{
    if(id===userID){
        window.location.href = '/'
    }
})
let checkID='null';
socket.on('old-chat',chats=>{
    chats.forEach(chat=>{
        if(check!=chat['name'] || checkID!=chat['userID']){
            namappend(`${chat['name']}`,'left-name')
        }
        append(`${chat['text']}`, 'left')
    
        check = chat['name']
        checkID = chat['userID']
        msgcont.scrollTop = scroll;
    })
})

socket.on('new-admin', data => {
    console.log(userID,data.id)
    if (userID === data.id) {
        video.controls = true
        admin = true
        video.addEventListener('play', event => {
            socket.emit('playvid', roomKey);
        })
        video.addEventListener('pause', event => {
            socket.emit('pausevid', roomKey);
        })
        video.addEventListener('seeked', event => {
            time = video.currentTime;
            socket.emit('seekvid', time, roomKey)
        })
        let user = document.querySelectorAll('.user')
        for(let i=0;i<user.length;i++){
            if(userID!=user[i].id){
                let user_ID = user[i].id
                let user_right = document.createElement('div')
                user_right.classList.add("user_right")
                let close = document.createElement('div')
                user[i].append(user_right);
                close.classList.add("close")
                let user_name = document.querySelector('.user_name')
                user_name.classList.add("adjust")
                user_right.append(close)
                removeEvent(close,user_ID)
            }
        }
        admin = true;
        let user_name = document.querySelector('.user_name')
        user_name.classList.add("adjust")
    }
    let ele = document.getElementById(data.id)
    ele.classList.add('admin')
    socket.emit('start-vid-time',video.currentTime)

})


socket.on('seek', time => {
    video.currentTime = time;
})
socket.on('pause', () => {
    video.pause();
})


//funtions
const append = (message, position) => {
    let msg = document.createElement('div')
    msg.innerText = message;
    msg.classList.add('msg');
    msg.classList.add(position);
    msgcont.append(msg);
    scroll = msgcont.scrollHeight;
}
const namappend = (name, position) => {
    let nam = document.createElement('div')
    nam.classList.add(position);
    nam.innerText = name;
    nam.classList.add('msg');
    msgcont.append(nam);
    scroll = msgcont.scrollHeight;
}
const copyRoomID = document.getElementById('copyId');
function showID(Key) {
    let textID = document.createElement('div')
    textID.innerText = "Room ID : " + Key;
    textID.classList.add("roomID");
    video_cont.append(textID)
    copyRoomID.addEventListener('click',(e)=>{
        e.preventDefault()
        try{
            navigator.clipboard.writeText(Key)
        }
        catch{
            navigator.clipboard.writeText(" ");
        }
    })
    if (!admin) {
        // textID.classList.add("userRoom")
    }
}
// const copyIcon = document.querySelector('#copyId');
// copyRoomID.addEventListener('mouseover',(event)=>{
//     let copyLogo = document.createElement('div')
//     copyLogo.id = 'HoverCopy'
//     copyLogo.innerText ='copy'
//     copyLogo.classList.add('msg-copy')
//     copyIcon.append(copyLogo)
// })
// copyRoomID.addEventListener('mouseout',(event)=>{
//     let copyLogo = document.getElementById('HoverCopy')
//     copyLogo.remove()
// })

const active_user = document.getElementById("users")
const userList = (user_Name,user_ID,userList,nameList,flag=false) =>{
    if(flag){
        for(let i=0;i<userList.length;i++){
            let activeUser = document.createElement('div')
            let user_left = document.createElement('div')
            // let user_right = document.createElement('div')
            // let close = document.createElement('div')
            let user_name = document.createElement('div')
            activeUser.id = userList[i]
            user_name.innerText = nameList[userList[i]]
            user_name.classList.add("user_name")
            user_left.classList.add("user_left")
            // user_right.classList.add("user_right")
            activeUser.classList.add("user")
            // close.classList.add("close")
            active_user.append(activeUser)
            activeUser.append(user_left);
            // activeUser.append(user_right);
            user_left.append(user_name)
            // user_right.append(close)
            if(admin || i===0){
                activeUser.classList.add('admin')
            }
            // removeEvent(close,userList[i])
            // user_right.style.display = 'none';
        }
        
    }
    else{
        let activeUser = document.createElement('div')
        let user_left = document.createElement('div')
        let user_name = document.createElement('div')
        userlist = activeUser
        activeUser.id = user_ID
        user_name.innerText = user_Name
        activeUser.classList.add("user")
        user_left.classList.add("user_left")
        activeUser.classList.add("user")
        active_user.append(activeUser)
        activeUser.append(user_left);
        user_left.append(user_name)
        if(!admin){
            // user_right.style.display = 'none';
        }
        if(admin){
            let user_right = document.createElement('div')
            user_right.classList.add("user_right")
            let close = document.createElement('div')
            activeUser.append(user_right);
            close.classList.add("close")
            let user_name = document.querySelector('.user_name')
            user_name.classList.add("adjust")
            user_right.append(close)
            removeEvent(close,user_ID)
        }
        // addUserMenu(activeUser)
    }
}
let menu_flag = false

socket.on('make-admin',(id,prev)=>{
    if(id===userID){
        let userDiv = document.getElementById(id)
        userDiv.classList.add('admin')
        video.controls =  true
        let prev_admin = document.getElementById(prev)
        console.log(prev)
        prev_admin.classList.remove('admin')
        socket.emit('previous-admin',prev,id)
    }
    else{
    }
})
socket.on('prev-admin',(id,new_id)=>{
    let prev_admin = document.getElementById(id)
    prev_admin.classList.remove('admin')
    if(userID===id){
        video.controls= false
        // Remove_user_menu()
    }
    let new_admin = document.getElementById(new_id)
    new_admin.classList.add('admin')
})

const removeEvent = (user_id,id)=>{
    user_id.addEventListener('click',()=>{
        socket.emit('remove',id)
    })
}
socket.on('get-link',link=>{
    videoLink = link;
    srce.setAttribute('src',link);
    videoElement.appendChild(srce);
    videoSrCont.style.display = 'none';
})
srcBtn.addEventListener('click',()=>{
    let Glink = "https://drive.google.com/uc?export=download&id=";
    let linkID = inpSource.value.slice(32,65);
    let link = Glink+linkID;
    videoLink = link;
    srce.setAttribute('src',link);
    videoElement.appendChild(srce)
    videoSrCont.style.display = 'none';
    socket.emit('video-link',link,roomKey)
})

const synFunc=(key)=>{
    video.addEventListener('loadstart',()=>{
        video_cont.style.setProperty('--d','block');
        socket.emit('pausevid',key)
        socket.emit('add-sync',key)
    })
    video.addEventListener('canplaythrough',()=>{
        video_cont.style.setProperty('--d','none');
        socket.emit('remove-sync',key)
    })
}
socket.on('remove-user-sync',()=>{
    video_cont.style.setProperty('--d','none');

})
socket.on('add-user-sync',()=>{
    video_cont.style.setProperty('--d','block');

})
