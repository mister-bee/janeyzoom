const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { v4: uuidV4 } = require('uuid');
const { ExpressPeerServer } = require('peer');

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

const peerServer = ExpressPeerServer(http, {
  debug: true,
  path: '/',
});
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

io.on('connection', (socket) => {
  console.log('SERVER - a user connected');

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    console.log('user ', userId, ' joins room', roomId);
    socket.broadcast.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      console.log('user disconnected', userId);
      socket.broadcast.to(roomId).emit('user-disconnected', userId);
    });
  });
});

http.listen(3333, () => {
  console.log('SERVER - listening on *:3333');
});
