var Top=document.getElementById("top");
var down=document.getElementById("down");
var right=document.getElementById("right");
var left=document.getElementById("left");
let no_click = document.querySelectorAll('body *')


function Add(animeName,animeName1,animeName2,animeName3,addAnimeClass){
    animeName.classList.add("z");
    animeName.classList.add(addAnimeClass);
    animeName1.classList.remove("z");
    animeName2.classList.remove("z");
    animeName3.classList.remove("z");
    Top.classList.add('no-click')
    down.classList.add('no-click')
    right.classList.add('no-click')
    left.classList.add('no-click')
}

function remove(removeAnime,removeNameClass,animeName){
    removeNameClass.classList.remove(removeAnime); 
    Top.classList.remove('no-click'); 
    down.classList.remove('no-click'); 
    left.classList.remove('no-click'); 
    right.classList.remove('no-click'); 
}


function Anime(removeAnime,removeNameClass,animeName,animeName1,animeName2,animeName3,addAnimeClass){
    setTimeout(remove,2000,removeAnime,removeNameClass,animeName);
    Add(animeName,animeName1,animeName2,animeName3,addAnimeClass);
}

