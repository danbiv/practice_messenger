var modal = document.getElementById("myModal");
var mythread = document.getElementById("myThread");

document.getElementById("login").addEventListener('click',function(e){
  logIn(e);
});

// Signup Event
document.getElementById("signup").addEventListener('click',function(e){
  signUp(e);
});

// Open Create Chat form 
document.getElementById("CreateButton").addEventListener('click',function(e){
  showModal(e);
});

// Makes new chat
document.getElementById("MakeNew").addEventListener('click', function(e){
  createChat(e);
});

//On hitting send 
document.getElementById("sendbutton").addEventListener('click',function(e){
  postMessage(e);
});

// 
document.getElementById("replybutton").addEventListener('click',function(e){
  postReply(e);
  e.preventDefault();
});

setInterval(pollMessages, 500);
setInterval(load_btns, 2000); //Load New btns Every 2 seconds , in here poll last unread

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }else if (event.target == mythread){
    mythread.style.display ='none';
  }
}