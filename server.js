const express = require('express');
const app = express();
const server = require('http').Server(app);
const { v4: uuidV4 } = require('uuid');
const PORT = process.env.PORT || 3000;
const io = require('socket.io')(server
    // , {
    // cors:{
        // origin:"*"
    // }
// }
);

// const {ExpressPeerServer} = require("peer");
// const peerServer = ExpressPeerServer(server, {
//     debug : true,
// });

// app.use("/peerjs", peerServer);

app.set("view engine", "ejs");
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/create_room/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, user_name) => {
        // console.log(roomId, userId);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-connected", userId);

        socket.on("disconnect", () => {
            socket.broadcast.to(roomId).emit("user-disconnected", userId);
          });

        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, user_name);
        })
    })
})


server.listen(PORT, (res, req) => console.log(`connected to port ${PORT}`));