//When no users are found
const existingUsers = document.querySelector(".existingUserGroup");

if (existingUsers.innerText===''){
    existingUsers.innerHTML="<img class='noUserFoundImage' src='/images/noUsersFound.jpg'>";
}

//When no requests are found
const reqList = document.querySelector(".requestsdiv");

if (reqList.innerText === '') {
    reqList.innerHTML = `
            <div class="norequests">
                <img src="/images/NoRequests.png" alt="">
            </div>`;
}

//viewing others profile
const viewProfileList = document.querySelectorAll(".userdetails");

for (let viewProfile of viewProfileList){
    viewProfile.addEventListener("click",(e)=>{
        const otherUsername = viewProfile.querySelector("p").innerHTML;
        console.log(otherUsername);
        window.location.href = "/view-profile/" + otherUsername +"?From=addUser"; 
    });
}

//viewing others profile
const viewProfileList2 = document.querySelectorAll(".userarea");

for (let viewProfile2 of viewProfileList2){
    viewProfile2.addEventListener("click",(e)=>{
        const otherUsername = viewProfile2.querySelector("p").innerHTML;
        window.location.href = "/view-profile/" + otherUsername +"?From=addUser"; 
    });
}