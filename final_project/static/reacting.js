// class TheseButts extends React.component{
//   render(){
//     return(
//       <li>Text</li>
//     );
//   }
// }

class Chats extends React.Component{

  // let ct = sessionStorage.getItem('chat_token');


  render() {
    return (
      <form action="#" id='chats_me'>
        
        <button id="CreateButton" >Create New Chat!</button>
        <button id="0">Random</button>  

      </form>  
    );
  }
}

// console.log("React loaded");
ReactDOM.render(
  <Chats />,
  document.getElementById('chats')
);

