const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const fs = require('fs');
const mongoose = require('mongoose');
const User = require('./models/user');
const Stats = require('./models/stats');

const db = 'mongodb+srv://Dmitriy303:Dmitriy303@cluster0.nnrtw4y.mongodb.net/node-db?retryWrites=true&w=majority';

mongoose
  .connect(db)
  .then((res) => console.log('Connected to Database'))
  .catch((error) => console.log(error));

'use strict';

app.set("port", 3000);

app.get('/', function (request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

app.use("/", express.static(__dirname + '/'));

server.listen(process.env.PORT || 3000, function () {
  console.log('http://localhost:3000');
});

var p = -1;
var r = 0;
var players = {};

io.on('connection', function (socket) {
  socket.on('Login', (login) => {
    User.findOne({ user: login })
      .then(users => {
        if(users != null) socket.emit('ReqPass', login);
        else socket.emit('SetPass', login);
      });
  });
  socket.on('checkPass', (login, pass) => {
    User.findOne({ user: login })
      .then(users => {
        if (users['pass'] == pass) socket.emit('doneLogin', (login));
        else socket.emit('invalidPass');
      });
  });
  socket.on('settingPass', (login, pass) => {
    User.create({user: login, pass: pass});
    socket.emit('doneLogin', (login));
  });

  socket.on("createRoom", () => {
    r++;
    players["no" + r] = {};
    socket.emit('POSTnoRoom', "no" + r);
  });

  Stats.find({})
    .then(stats => {
      socket.emit('dataStats', stats);
    })
  
  socket.on('getStats', ()=>{
    Stats.find({})
      .then(stats => {
        socket.emit('dataStats', stats);
      })
  })
      
  socket.on('SentStats', (nickname, winnings, draws, losses) => {
    Stats.findOne({ user: nickname })
      .then(user => {
        if(user == null){
          Stats.create({ user: nickname, winnings: winnings, draws: draws, losses: losses});
        } else {
          Stats.updateOne({ user: nickname }, { winnings: winnings, draws: draws, losses: losses }, (err, done)=>{})
        }
      })
      Stats.find({})
        .then(stats => {
          socket.emit('dataStats', stats);
        })
  });

  socket.on('createLink', (field, player, roomno) => {
    var links = fs.readFileSync('link.json');
    links = JSON.parse(links);
    var link = {
      nickname: null,
      field: field,
      num_player: Object.keys(players[roomno]).length,
      player: player
    }
    links[roomno] = link;
    var data = JSON.stringify(links);
    fs.writeFileSync('link.json', data);
  });

  socket.on("GETLinks", () => {
    var links = fs.readFileSync('link.json');
    links = JSON.parse(links);
    if (links != "{}") {
      for (var i = 0; i < Object.keys(links).length; i++) {
        var obj = Object.keys(links)[i];
        socket.emit('AddLinks', obj, links[obj]["nickname"], links[obj]["field"], links[obj]["num_player"], links[obj]["player"]);
      }
    }
  });

  //Работа над ссылками в файле
  function workOnLinks(roomno) {
    var links = fs.readFileSync('link.json');
    links = JSON.parse(links);
    links[roomno]["nickname"] = "";
    for (var i = 0; i < Object.values(players[roomno]).length; i++) {
      var nick = Object.values(players[roomno])[i];
      if (links[roomno]["nickname"] != "")
        links[roomno]["nickname"] += ", " + nick.slice(2);
      else links[roomno]["nickname"] = nick.slice(2);
    }
    var link = {
      nickname: links[roomno]["nickname"],
      field: links[roomno]["field"],
      num_player: Object.keys(players[roomno]).length,
      player: links[roomno]["player"]
    }
    links[roomno] = link;
    if (links[roomno]["num_player"] == 0) {
      var obj = links;
      delete obj[roomno];
    }
    var data = JSON.stringify(links);
    fs.writeFileSync('link.json', data);
  }

  //Добавление пользователя в комнату и инкрементирование числа пользователей в комнате
  socket.on("connectGame", (nickname, roomno) => {
    p = Object.keys(players[roomno]).length;
    players[roomno][p] = nickname;
    if (nickname.indexOf('Bot') == -1) {
      socket.username = nickname;
      socket.join("room-" + roomno);
    }
    workOnLinks(roomno);
    io.sockets.emit("clearLinks");
  });

  socket.on('delBot', (roomno) => {
    var pos = null;
    for (var i = Object.values(players[roomno]).length - 1; i >= 0; i--) {
      if (players[roomno][i].indexOf("Bot") != -1) {
        pos = i;
        break;
      }
    }
    if (pos != null) exit(roomno, players[roomno][pos]);
  });

  socket.on("sendMess", (text, nickname, roomno) => {
    io.to("room-" + roomno).emit('messPost', text, nickname);
  });

  //Отправка запроса на подключение к комнате
  socket.on("connectToRoom", (noRoom, player) => {
    if (Object.keys(players[noRoom]).length < player) {
      socket.join("room-" + noRoom);
      socket.emit("connectGame");
    }
  });

  //Отправка запроса с информацией о пользователях в комнате
  socket.on('getPlayers', (room) => {
    io.to("room-" + room).emit('players', players[room]);
  });

  //Получение запроса на установление значка и отправка разрешения
  socket.on('click', function (slot, nickname, noRoom) {
    io.to("room-" + noRoom).emit('clickON', slot, Object.values(players[noRoom]).indexOf(nickname));
  });

  //Получение запроса на сброс и отправка разрешения на сброс
  socket.on('clickReset', (roomno) => {
    io.to("room-" + roomno).emit('reset');
  });

  function exit(roomno, nickname) {
    var numNick = Object.values(players[roomno]).indexOf(nickname);
    for (var i = numNick; i < Object.keys(players[roomno]).length; i++)
      players[roomno][i] = players[roomno][i + 1];
    delete players[roomno][Object.keys(players[roomno]).length - 1];

    var links = fs.readFileSync('link.json');
    links = JSON.parse(links);
    if (Object.keys(players[roomno]).length == 0) {
      delete players[roomno];
      var obj = links;
      delete obj[roomno];
      var data = JSON.stringify(obj);
      fs.writeFileSync('link.json', data);
    } else {
      workOnLinks(roomno);
      var numPl = 0;
      for (var i = 0; i < Object.keys(players[roomno]).length; i++) {
        if (players[roomno][i].indexOf('Bot') == -1) numPl++;
      }
      if (numPl == 0) {
        delete players[roomno];
        var obj = links;
        delete obj[roomno];
        var data = JSON.stringify(obj);
        fs.writeFileSync('link.json', data);
      }
    }

    var links = fs.readFileSync('link.json');
    links = JSON.parse(links);
    if (Object.keys(links).indexOf(roomno) != -1) {
      io.sockets.emit("clearLinks");
    } else {
      io.sockets.emit('AddLinks', roomno, 0, 0, 0, 0);
    }
    io.to("room-" + roomno).emit('players', players[roomno]);
    io.to("room-" + roomno).emit('reset');
    if (nickname.indexOf('Bot') == -1) socket.leave("room-" + roomno);
  }

  //Отключение пользователя из комнаты
  socket.on('exitGame', (roomno, nickname) => {
    exit(roomno, nickname);
  });

  socket.on('disconnect', () => {
    if (socket.username != undefined) {
      var nickname = socket.username;
      var roomno;
      if (Object.keys(players).length != 0) {
        for (var i = 0; i < Object.keys(players).length; i++) {
          var obj = players[Object.keys(players)[i]];
          for (var j = 0; j < Object.keys(obj).length; j++) {
            if (obj[j] == nickname) {
              roomno = Object.keys(players)[i];
              break;
            }
          }
        }
      }
      if (players[roomno] != undefined)
        if (Object.keys(players[roomno]).length != 0)
          exit(roomno, nickname);
    }
  });
});