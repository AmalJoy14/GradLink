//logout
const logout=document.querySelector(".logout");
const okBtn=document.querySelector(".button1");
const cancelBtn=document.querySelector(".button2");
const mainDiv=document.querySelector(".maindiv");

logout.addEventListener("click",(e)=>{
    document.querySelector(".logoutContainer").classList.add("show");
    mainDiv.classList.add("blur");
});

okBtn.addEventListener("click",(e)=>{
    document.querySelector(".logoutContainer").classList.remove("show");
    window.location.href="/logout";
    mainDiv.classList.remove("blur");
})

cancelBtn.addEventListener("click",(e)=>{
    document.querySelector(".logoutContainer").classList.remove("show");
    mainDiv.classList.remove("blur");
})