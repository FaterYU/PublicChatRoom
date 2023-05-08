var userList;
// init client
var client = {
  socket: null,
  InitMsg: function (name) {
    this.socket = io();
    this.socket.emit("init", name);
    this.socket.on("init", (msg) => {
      userList = msg;
      updateUserList();
    });
    this.socket.on("chat", (msg) => {
      if (this.socket.id == msg.sender) {
        createDialogSelf(msg);
      } else {
        createDialogOther(msg);
      }
    });
    this.socket.on("come", (msg) => {
      userList[msg.id] = msg;
      createBroadcastCome(msg);
      updateUserList();
    });
    this.socket.on("leave", (msg) => {
      createBroadcastLeave(userList[msg]);
      delete userList[msg];
      updateUserList();
    });
    this.socket.on("state", (msg) => {
      userList[msg.id].state = msg.state;
      updateUserList();
    });
  },
};
// listen to enter key
document.getElementById("input").addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("send").click();
  }
});
// catch typing event
var typing = false;
document.getElementById("input").addEventListener("input", function (event) {
  if (client.socket != null && !typing && event.data != null) {
    typing = true;
    client.socket.emit("state", "Typing");
  } else if (client.socket != null && typing && event.data == null) {
    typing = false;
    client.socket.emit("state", "Alive");
  }
});
// update chat user list
function updateUserList() {
  var userlist = document.getElementsByClassName("userlist-content")[0];
  userlist.innerHTML = "";
  for (var key in userList) {
    var user = userList[key];
    var li = document.createElement("li");
    li.innerHTML = user.userName;
    if (user.state == "Typing") {
      li.className = "typing";
    } else {
      li.className = "alive";
    }
    userlist.appendChild(li);
  }
}
// create broadcast info when user come
function createBroadcastCome(msg) {
  var broadcast = document.getElementsByClassName("chat-broadcast")[0];
  var broadcast_info = document.createElement("div");
  broadcast_info.className = "broadcast-info";
  broadcast_info.innerHTML = msg.userName + " has joined the chat room";
  broadcast.appendChild(broadcast_info);
  broadcast.scrollTop = broadcast.scrollHeight;
}
// create broadcast info when user leave
function createBroadcastLeave(msg) {
  var broadcast = document.getElementsByClassName("chat-broadcast")[0];
  var broadcast_info = document.createElement("div");
  broadcast_info.className = "broadcast-info";
  broadcast_info.innerHTML = msg.userName + " has left the chat room";
  broadcast.appendChild(broadcast_info);
  broadcast.scrollTop = broadcast.scrollHeight;
}
// create dialog when user chat
function createDialogOther(msg) {
  var name = userList[msg.sender].userName;
  var parp = document.createElement("p");
  parp.innerHTML = name;
  var dialog = document.createElement("div");
  dialog.className = "dialog-other";
  dialog.innerHTML = msg.content;
  var chat_dialog = document.getElementsByClassName("chat-dialog")[0];
  chat_dialog.appendChild(parp);
  chat_dialog.appendChild(dialog);
}
// create dialog when self chat
function createDialogSelf(msg) {
  var name = userList[msg.sender].userName;
  var parp = document.createElement("p");
  parp.innerHTML = name;
  var dialog = document.createElement("div");
  dialog.className = "dialog-self";
  dialog.innerHTML = msg.content;
  var chat_dialog = document.getElementsByClassName("chat-dialog")[0];
  chat_dialog.appendChild(parp);
  chat_dialog.appendChild(dialog);
  chat_dialog.scrollTop = chat_dialog.scrollHeight;
}
// jump to page
function jump2Page(path) {
  window.location.href = window.location.origin + "/" + path;
}
// submit message
function submit() {
  var input_doc = document.getElementById("input");
  if (input_doc.value == "") {
    return;
  }
  if (client.socket == null) {
    var name = input_doc.value;
    client.InitMsg(name);
    input_doc.placeholder = "Please input your message";
    input_doc.value = "";
    var send_btn = document.getElementById("send");
    send_btn.innerHTML = "Send";
  } else {
    var msg = input_doc.value;
    client.socket.emit("chat", msg);
    input_doc.value = "";
  }
}
