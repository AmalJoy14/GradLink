const socket = io({
  auth: {
    serverOffset: 0,
  },
});


//viewing others profile
const viewProfileList = document.querySelectorAll(".user1");

for (let viewProfile of viewProfileList){
    viewProfile.addEventListener("click",(e)=>{
    const otherUsername = viewProfile.querySelector("h6").innerHTML;
    window.location.href = "/view-profile/" + otherUsername + "?From=global"; 
  });
}



/*************************************************************Global Chat***************************************************************/
const form = document.getElementById("globalForm");
const username = form.getAttribute("username");
const input = document.getElementById("globalInput");
const messages = document.getElementById("globalMessagediv");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    ////////////////////////////////////////////
    const item = document.createElement("div");
    item.classList.add("mymessage");

    const innerItem = document.createElement("span");

    const innerDiv = document.createElement("div");
    innerDiv.classList.add("mynametag");
    innerDiv.innerText = "You";

    innerItem.appendChild(innerDiv);

    // Append the user input value to the span, after the name tag div
    const messageText = document.createTextNode(input.value);
    innerItem.appendChild(messageText);

    // Append the span to the main container div
    item.appendChild(innerItem);
    messages.appendChild(item);
    messages.scrollTo(0, messages.scrollHeight);
    ////////////////////////////////////////////
    socket.emit("Global Chat", input.value, username);
    input.value = "";
  }
});

socket.on("Global Chat", (msg, username) => {

  const item = document.createElement("div");
  item.classList.add("othermessage");

  const innerItem = document.createElement("span");

  const innerDiv = document.createElement("div");
  innerDiv.classList.add("othernametag");
  innerDiv.innerText = username;

  innerItem.appendChild(innerDiv);

  // Append the user input value to the span, after the name tag div
  const messageText = document.createTextNode(msg);
  innerItem.appendChild(messageText);

  // Append the span to the main container div
  item.appendChild(innerItem);
  messages.appendChild(item);
  messages.scrollTo(0, messages.scrollHeight);
});

// Handle recovered messages
socket.on("Recover global messages", (msg, username) => {
  const item = document.createElement("div");
  if (form.getAttribute("username") === username) {

    item.classList.add("mymessage");
    const innerItem = document.createElement("span");
    const innerDiv = document.createElement("div");
    innerDiv.classList.add("mynametag");
    innerDiv.innerText = "You";
    innerItem.appendChild(innerDiv);
    const messageText = document.createTextNode(msg);
    innerItem.appendChild(messageText);
    item.appendChild(innerItem);


  } else {

    item.classList.add("othermessage");
    const innerItem = document.createElement("span");
    const innerDiv = document.createElement("div");
    innerDiv.classList.add("othernametag");
    innerDiv.innerText = username;
    innerItem.appendChild(innerDiv);
    const messageText = document.createTextNode(msg);
    innerItem.appendChild(messageText);
    item.appendChild(innerItem);

  }

  messages.appendChild(item);
  messages.scrollTo(0, messages.scrollHeight);
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////