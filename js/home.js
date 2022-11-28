const joinRoomBox = document.querySelector('.join-room-box');
const joinRoom = document.querySelector('.join-room');
const errClass = document.querySelector('.text-err');
const nickname = document.getElementById('nick');
const roomID = document.getElementById('roomID');
const showJoinRoom = ()=>{
    if(nickname.value.length < 3 || checkSpecialChar(name)){
        nickname.classList.add("int-err");
        errClass.style.display = "block";
    }
    else{
        joinRoomBox.style.display = 'block';
        joinRoom.style.display = 'none';
        nickname.classList.remove("int-err");
        errClass.style.display = "none";
    }
}

if(localStorage.getItem("Nick")!=undefined){
    nickname.value = localStorage.getItem("Nick")
}
const checkNick = (flag = false)=>{
    let name = nickname.value;
    if(name.length < 3 || checkSpecialChar(name)){
        nickname.classList.add("int-err");
        errClass.style.display = "block";
    }
    else{
        if(flag){
            localStorage.setItem('key',roomID.value)
        }
        else{
            localStorage.setItem('key'," ")
        }
        localStorage.setItem('name',name)
        localStorage.setItem("Nick",name);
        nickname.classList.remove("int-err");
        errClass.style.display = "none";
        window.location.href = '/party';
    }
}
const checkSpecialChar = (str=" ")=>{
    let arr = str.split('');
    for (let i of arr){
        let asci = i.charCodeAt(0);
        if(asci >= 32 && asci <= 47 || asci >=58 && asci <=64 || asci >=91 && asci <=96 || asci >=123 && asci <=126 || i==" " || str.length > 10){
            return true;
        }
    }
    return false;
}
