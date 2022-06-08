
// On hitting chats button 
function openNav() {
  document.getElementById("mailbox").style = "display:none";
  document.getElementById("chats").style = "display: grid;";
  }

function closeNav() {
  document.getElementById("chats").style = "display:none";
  document.getElementById("mailbox").style= "display:grid";
}

// On hitting create chat button
function showModal(e) {
  let modal = document.getElementById("myModal");
  modal.style.display = "block";
  e.preventDefault();
}

function hideModal() {
  let modal2 = document.getElementById("myModal");
  modal2.style.display = "none";
}

// // 22. https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
// function isNumeric(str) {
//   if (typeof str != "string") return false // we only process strings!  
//   return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
//          !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
// }

// Loads login Page
function load_login(pushHistory=true){

  // If pushhistory
  if (pushHistory){
    history.pushState("Login/Signup", "Login/Signup","");
  }

  document.querySelectorAll(".columned").forEach((n) => {n.setAttribute("style", "display: none")});
  document.querySelectorAll(".logbox").forEach((n) => {n.setAttribute("style", "display: flex")});
  
  localStorage.setItem('cht_poll','no');
  localStorage.setItem('btn_poll','no');
  
  return;
}

// Loads Chat page
function load_chats(pushHistory=true){

  if (pushHistory){

    let dchat = sessionStorage.getItem('desired_chat');
    sessionStorage.setItem('chat_token',dchat);

    if (dchat){
      let chat_history_desired = "chat/"+dchat;
      history.pushState("Belay:ChatApp", "Belay","/"+chat_history_desired);
    } else {
      history.pushState("Belay:ChatApp", "Belay","");
    }
    
  }

  document.querySelectorAll(".columned").forEach((n) => {n.setAttribute("style", "display: block")});
  document.querySelectorAll(".logbox").forEach((n) => {n.setAttribute("style", "display: none")});

  // Load chats buttons
  load_btns();

  // Do first poll
  pollMessages();

  // Begin Message and BTN Polling
  localStorage.setItem('cht_poll','yes'); //Polling for chats
  localStorage.setItem('btn_poll','yes'); //Polling for lastread


  return;
}

// LOGIC FOR LOADING THE STATE BASED ON URL - NAVIGATE 
function loadState(pushHistory=true){
  // On Load of any page

  // Take url pathname
  pathname = document.location.pathname;
  console.log("Pathname: ",pathname);
  paths = pathname.split("/");
  console.log(paths);
  

  // IF THERE IS A CHAT IN THE URL
  if (pathname != "/") {

    // Store desired chat
    if (paths[1] == 'chat' && paths[2]){
     sessionStorage.setItem('desired_chat', paths[2]);
    } 
    if(paths[3]){
      console.log("THREAD: ",paths[3]);
      sessionStorage.setItem('desired_thread',paths[3]);
    }

    // Check for local sessiontoken
    let st = localStorage.getItem('session_token');
    if (st) {

      // Validate st
      options = {
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
          'session_token': st 
        },
        body: JSON.stringify({})
      };

      fetch( '/api/auth', options).then((response) => {
        console.log(response);
        if (response.status == 200){
          load_chats(pushHistory);
          
        } else {
          load_login(pushHistory);
        }
    
      });

      // If there is a token, Load chats - with selected chat active
    } else {

      // If there is no login token in local storage
      load_login(pushHistory);

    }


  } else {

    // Loads login-signup page
    load_login(pushHistory);

  }
}

// LOGIN:---------------------------------------------------

function logIn(e){

  //takes username and pasword
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  options = {
    method: 'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      'username': username, 
      'password': password
    })
  };

  console.log("JSON - Login:",options);

  fetch('/api/login', options).then((response) => {
    
    console.log(response);
    if(response.status == 200){
      console.log("Login Successful: "+ username);
      return response.json();
    }

  }).then((json) => {

    console.log("Storing Session_token: ",json.session_token);
    localStorage.setItem("session_token",json.session_token)

    return true;

  }).then((response) => {

    //Redirects to chatlist page on successfual login
    if (response){
      //Hide current Login dock show chats
      load_chats();   
    }
    
  }).catch((error) => {
    console.error('Error:', error);
  });

  e.preventDefault();
}

// SIGNUP ----------------------------------------------------------------
function signUp(e){
  //takes username and pasword
  console.log("Username: ", document.querySelector("#username").value);
  console.log("Password: ", document.querySelector("#password").value);
  let username = document.querySelector("#username").value;
  let password = document.querySelector("#password").value;


  //Posts it to api
  options = {
    method: 'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      'username': username,
      'password': password
    })
  };

  console.log("JSON - Signup: ", options );

  //Sends Post
  fetch('/api/signup', options).then((response) => {
    console.log(response);

    if (response.status == 302){
      alert("Username already registered"+username);
    }else{
      //Confirms succsessful registration bby moving on
      return response.json();
    }
    
  }).then((json) => {
    console.log("Sucessful Registration")
    //Store Session Token in local storage
    console.log("Storing Session_token: ",json.session_token);
    localStorage.setItem("session_token",json.session_token);

    return true;

  }).then((response) => {

    //Redirects to chatlist page
    if (response){

      //Hide current Login dock show chats
      load_chats();

    }

  }).catch((error) => {
    console.error('Error:', error);
  });

  e.preventDefault();

}

// CREATE CHAT ==================================================
function createChat(e) {
  // Send fetch request /api/create/
  let titl = document.querySelector("#chatname").value;
  let st = localStorage.getItem("session_token");
  document.querySelector('#chatname').value='';
  hideModal();
    
  options = {
    method: 'POST',
    headers:{
      'Content-Type':'application/json',
      'session_token': st,
      'title': titl
    },
    body: JSON.stringify({})
  };

  fetch( '/api/create', options).then((response) => {
    console.log(response);
    if (response.status == 200){
      return response.json();
    }     

  }).then((json) => {

    sessionStorage.setItem("desired_chat",json.chat_id);
 
    //set state to chat settings and load chats start 
    load_chats();


  }).catch((error)=> {
    console.error('Error:', error);
  });

  e.preventDefault();

}
// GET CHANNELS=========================================================
function load_btns(){

  let st = localStorage.getItem("session_token");
  if (st){

    options = {
      method: 'GET',
      headers:{
        'Content-Type':'application/json',
        'session_token': st,
      }
    };

    fetch( '/api/channels', options).then((response) => {

      if (response.status == 200){
        return response.json();
      }     
  
    }).then((json) => {
      // console.log(json.counts);
      
      // Clear old chats:
      document.querySelectorAll('.aaa').forEach(e => e.remove());

      // ARRAY OF CHANNELS 
      // json array[i][1]=id,[2]=title,[3]=author
      //  <button class='0' id="rando">Random</button>

      var chat_parent = document.getElementById("chats_me");
      for(let i=0; i < json.channels.length; i++){
        console.log(json.counts[json.channels[i][1]]);

        var button_create = document.createElement("button");
        var button_click = document.createElement("script");

        let hold_channel =  json.channels[i][1];
        button_click.innerHTML = 'document.getElementById("'+hold_channel+'").addEventListener("click",function(e){joinChat(e,"'+hold_channel+'")});';
        button_click.setAttribute("class","aaa");

        // if(json.counts[i][1]!=0){
        //   button_create.innerHTML = json.channels[i][1];
        // } else{
        //   button_create.innerHTML = json.channels[i][1]+" ("+json.counts[json.channels[i]]+") ";
        // }
        
        if (json.counts[json.channels[i][1]] != "0"){
          button_create.innerHTML = json.channels[i][1]+" ("+json.counts[json.channels[i][1]]+")";
        }else{
          button_create.innerHTML = json.channels[i][1];
        }
        
        button_create.setAttribute("id",json.channels[i][1]);
        button_create.setAttribute("class","aaa");

        chat_parent.append(button_create);
        chat_parent.append(button_click);
        
      }
  
    }).catch((error)=> {
      console.error('Error:', error);
    });
  } 
}
// LOAD COUNTS ===========================================================
// function loadcounts(){

//   let st = localStorage.getItem("session_token");
//   if (st){

//     options = {
//       method: 'GET',
//       headers:{
//         'Content-Type':'application/json',
//         'session_token': st,
//       }};
    
//     fetch( '/api/unread', options).then((response) => {

//       if (response.status == 200){
//         return response.json();
//       }     
  
//     }).then((json) => {

//       console.log(json)
    
//     }).catch((error)=> {
//       console.error('Error:', error);
//     });


      
//   }
  
// }


//Post Messages ========================================================
function postMessage(e) {

  // console.log("Message: ", document.querySelector("#tosend").value)
  let mess = document.querySelector("#tosend").value;
  let st = localStorage.getItem("session_token");
  let ct = sessionStorage.getItem("chat_token");
    
  options = {
    method: 'POST',
    headers:{
      'Content-Type':'application/json',
      'session_token': st,
      'chat_token': ct
    },
    body: JSON.stringify({'message': mess})
  };

  // Execute Send
  fetch( '/api/messages', options).then((response) => {
    
    console.log(response);
    return response.json()
  
  }).then((json) => {

    // console.log(json);
    // Clear textbox
    document.querySelector('#tosend').value='';

    //Scrolls to the bottom
    window.scrollTo(0,document.querySelector("#messages").scrollHeight);
  });

  e.preventDefault();

}

// CHANGE CHAT =============================================================
function joinChat(e,givenid){
  sessionStorage.setItem("desired_chat",givenid);
  load_chats();
  e.preventDefault();
}

// POLLING CHATS ===========================================================
function pollMessages(){
  let st = localStorage.getItem('session_token');
  if (st){ //If has session token
  let cp = localStorage.getItem('cht_poll');
  if (cp == 'yes'){ //If on chat window
  let ct = sessionStorage.getItem('chat_token');
  if (ct){ //If chat token is set

    options = {
      method: 'GET',
      headers:{
        'Content-Type':'application/json',
        'session_token': st,
        'chat_token': ct
      },
    };

    fetch( '/api/messages', options).then((response) => {
      console.log(response);
      return response.json()
    }).then((json) => {

      // Remove messages
      const myNode = document.querySelector(".messages");
      while (myNode.lastElementChild) {
        myNode.removeChild(myNode.lastElementChild);
      }


      // ARRAY OF messages 
      // json array[i][1]
      //    id author, body time
      
      // Format: 
      // <div class="lets">
      //   <li>Test Message</li></br><div class='time'>Sender - 1:00pm</div><br>
      // </div>

      for(let i=0; i < json.messages.length; i++){
        
        var mmm = document.createElement("div");
        mmm.setAttribute("class","lets");
        mmm.setAttribute("id",json.messages[i][0]);

        var message_in = '<li>'+json.messages[i][2]+'</li></br><div class="time">'+json.messages[i][1]+' - '+ json.messages[i][3]+ '</div><br>';
        mmm.innerHTML = message_in;

        var thread_click = document.createElement("script");
        thread_click.innerHTML = 'document.getElementById("'+json.messages[i][0]+'").addEventListener("click",function(){openThread("'+json.messages[i][0]+'")})';

        

        var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        var patt = new RegExp(urlRegex);

        if (patt.test(message_in)){
          const matches = message_in.matchAll(urlRegex);
              
          for (const match of matches) {
            var ppp = document.createElement('img');
            ppp.setAttribute('src',match);
            console.log(match.index);
            mmm.append(ppp);
           }
        }

        myNode.appendChild(mmm);
        myNode.appendChild(thread_click);      
        

      }
  
    }).catch((error)=> {
      console.error('Error:', error);
    });

  }}}
}

// THREADing ===============================================

// Create thread
function createThread(mid) {

  // Send fetch request /api/create/
  let st = localStorage.getItem("session_token");
  let ct = sessionStorage.getItem("chat_token");
    
  options = {
    method: 'POST',
    headers:{
      'Content-Type':'application/json',
      'session_token': st,
      'message_id': mid,
      'chat_token': ct
    },
    body: JSON.stringify({})
  };

  fetch( '/api/createThread', options).then((response) => {
    console.log(response);
    if (response.status == 200){
      return response.json();
    } 
  }).catch((error)=> {
    console.error('Error:', error);
  });

  return;
}

function pollThread(){
  let st = localStorage.getItem('session_token');
  if (st){ //If has session token
  let cp = localStorage.getItem('cht_poll');
  if (cp == 'yes'){ //If on chat window
  let ct = sessionStorage.getItem('chat_token');
  if (ct){ //If chat token is set
  let tt = sessionStorage.getItem('thread_token');
  if (tt){ //If thread token

    options = {
      method: 'GET',
      headers:{
        'Content-Type':'application/json',
        'session_token': st,
        'chat_token': ct,
        'thread_token': tt
      },
    };

    fetch( '/api/replys', options).then((response) => {
      console.log(response);
      return response.json()
    }).then((json) => {

      // Remove messages
      const myNode = document.querySelector("#threadreplys");
      while (myNode.lastElementChild) {
        myNode.removeChild(myNode.lastElementChild);
      }

      // ARRAY OF messages 
      // json array[i][1]
      //    id author, body time
      
      // Format: 
      // <div class="lets">
      //   <li>Test Message</li></br><div class='time'>Sender - 1:00pm</div><br>
      // </div>

      for(let i=0; i < json.messages.length; i++){
        
        var mmm = document.createElement("div");
        mmm.setAttribute("class","lets");
        mmm.setAttribute("id",json.messages[i][0]);

        var message_in = '<li>'+json.messages[i][2]+'</li></br><div class="time">'+json.messages[i][1]+' - '+ json.messages[i][3]+ '</div><br>';
        mmm.innerHTML = message_in;
     
        var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        var patt = new RegExp(urlRegex);

        if (patt.test(message_in)){
          const matches = message_in.matchAll(urlRegex);
              
          for (const match of matches) {
            var ppp = document.createElement('img');
            ppp.setAttribute('src',match);
            console.log(match.index);
            mmm.append(ppp);
           }
        }

        myNode.appendChild(mmm);

      }
  
    }).catch((error)=> {
      console.error('Error:', error);
    });

  }}}}
}


function openThread(mid,pushHistory=true){

  let ct = sessionStorage.getItem('chat_token');
  // Push tag to history
  if(pushHistory){
    let threaded_history = "chat/"+ct+"/"+mid;
    history.pushState("Thread", "Thread","/"+threaded_history);
  }
  

  // Take chat token
  createThread(mid); //Wont work if exists

  // Set thread token
  sessionStorage.setItem('thread_token',mid);

  let three = document.getElementById("myThread");
  three.style.display = "block";

  setInterval(pollThread,500);

}

function hideThread(){

  // let mid = sessionStorage.getItem('thread_token');
  clearthreadpoll();
  // Remove history

  // Remove threadtoken
  sessionStorage.removeItem('thread_token');

  // Hide thread
  let three = document.getElementById("myThread");
  three.style.display = "none";


}

function clearthreadpoll(){

  for (var i = 1; i < 99999; i++){
        window.clearInterval(i);
  }
  load_chats();
  setInterval(pollMessages, 500);
  setInterval(load_btns, 2000); //Load New btns Every 2 seconds , in here poll last unread

}

function postReply(e) {

  // console.log("Message: ", document.querySelector("#tosend").value)
  let mess = document.querySelector("#toreply").value;
  let st = localStorage.getItem("session_token");
  let ct = sessionStorage.getItem("chat_token");
  let tt = sessionStorage.getItem('thread_token');
    
  options = {
    method: 'POST',
    headers:{
      'Content-Type':'application/json',
      'session_token': st,
      'chat_token': ct,
      'thread_token':tt
    },
    body: JSON.stringify({'message': mess})
  };

  // Execute Send
  fetch( '/api/replys', options).then((response) => {
    
    console.log(response);
    return response.json()
  
  }).then((json) => {

    // console.log(json);
    // Clear textbox
    document.querySelector('#toreply').value='';

    //Scrolls to the bottom
    window.scrollTo(0,document.querySelector("#threadreplys").scrollHeight);
  });

  e.preventDefault();

}
