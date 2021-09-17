const socket = io("/");
const videoGrid = document.getElementById('video_grid');

// const myPeer = new Peer(undefined, {
//     path : "/peerjs",
//     host: '/',
//     port : '443'
//     // host: '/chatter-video-chat-website.herokuapp.com',
//     // secure : true,
//     // port: '3001'
// });


const myPeer = new Peer(undefined,{
    host: "chatter-video-chat-website.herokuapp.com",
    port: "443",
    path: "/peerjs",
  });

const user = prompt("Enter your Nmae: ");

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {}

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    myPeer.on('call', (call) => {
        call.answer(stream);
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    });

    socket.on('user-connected', (userId) => {
        // user is joining
        console.log('New user connected');
        setTimeout(() => {
            // user joined
            connectToNewUser(userId, stream)
        }, 1000)
    })
});

socket.on('user-disconnected', (userId) => {
    if (peers[userId]) peers[userId].close()
})


myPeer.on('open', (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}


//////////////  Input Link  /////////////////////
function getInputLink() {
    const Link = document.getElementById("input_link").value;
    const code = Link.split('/');
    window.open(code[3]);
}


////////////// URL Copy To Clipboard  //////////////
document.getElementById("invite_btn").addEventListener("click", getURL);

function getURL() {
    const c_url = window.location.href;
    copyToClipboard(c_url);
    alert("Url Copied to Clipboard,\nShare it with your Friends!\nUrl: " + c_url);
}

function copyToClipboard(text) {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

////////////// MUTE UNMUTE VIDEO / AUDIO ///////////////
const mute_btn = document.querySelector('#mute_btn');
const video_btn = document.querySelector('#video_btn');

mute_btn.addEventListener('click', () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;

    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        html = `<i class="fas fa-microphone-alt-slash"></i>`;
        // mute_btn.classList.toggle("background__red");
        mute_btn.innerHTML = html;
    }
    else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        html = `<i class="fas fa-microphone-alt"></i>`;
        // mute_btn.classList.toggle("background__red");
        mute_btn.innerHTML = html;
    }
})


video_btn.addEventListener("click", () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        html = `<i class="fas fa-video-slash"></i>`;
        //   video_btn.classList.toggle("background__red");
        video_btn.innerHTML = html;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        html = `<i class="fas fa-video"></i>`;
        //   video_btn.classList.toggle("background__red");
        video_btn.innerHTML = html;
    }
});



/////////////////   End Call  ///////////////////////
document.getElementById("end_btn").addEventListener("click", endCall);

function endCall() {
    window.location.href = "/";
}


//////////////////  CHAT SECTION  /////////////////////

let text = document.querySelector("#chat_message");
let send = document.getElementById("send_message");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
    if (text.value.length !== 0) {
        socket.emit("message", text.value);
        text.value = "";
    }
});

text.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && text.value.length !== 0) {
        socket.emit("message", text.value);
        text.value = "";
    }
});


socket.on("createMessage", (message, user_name) => {
    messages.innerHTML =
        messages.innerHTML +
        `<div class="message">
          <b><i class="far fa-user-circle"></i> <span> ${user_name === name ? "me" : user_name
        } : </span> </b>
          <span>${message}</span>
      </div>`;
});