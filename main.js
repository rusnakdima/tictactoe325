//Следующие строки показывают/скрывают некоторые элементы страницы
$(".profile").show();
$("#profile").css({ "color": "#fff" });
$(".opengame").hide();
$("#opengame").css({ "color": "#aaa" });
$(".creategame").hide();
$("#creategame").css({ "color": "#aaa" });
$(".statistics").hide();
$("#statistics").css({ "color": "#aaa" });
$("#back, #Login, #ReqPass, #SetPass, #game1, .Wait, #chat, #backRank, #Logout").hide();
$("#addBot").show();
var playRadAll = $("input[name=player]");
for (var i = 0; i < playRadAll.length; i++) {
  $(playRadAll[i]).prop('disabled', true).prop('checked', false);
}

//Окнам Профиль, Открытые и Создание задается отступ снизу
var topFooter = $("footer").height() + 50;
$(".profile").css({ "margin-bottom": topFooter });
$(".opengame").css({ "margin-bottom": topFooter });
$(".creategame").css({ "margin-bottom": topFooter + 50 });
$(".statistics").css({ "margin-bottom": topFooter + 50 });

//Установка русского текста
function langRu() {
  var lang = document.querySelectorAll("[data-rval]");
  for (var i = 0; i < lang.length; i++) {
    if ($(lang[i])[0].tagName != "INPUT") {
      $(lang[i]).text(lang[i].dataset.rval);
    } else {
      $(lang[i]).attr("placeholder", lang[i].dataset.rval);
    }
  }
  return 0;
}
//Установка английского текста
function langEn() {
  var lang = document.querySelectorAll("[data-eval]");
  for (var i = 0; i < lang.length; i++) {
    if ($(lang[i])[0].tagName != "INPUT") {
      $(lang[i]).text(lang[i].dataset.eval);
    } else {
      $(lang[i]).attr("placeholder", lang[i].dataset.eval);
    }
  }
  return 0;
}

//Проверяем в локальном хранилище наличие ключа "lang"
if (localStorage['lang'] == undefined) {
  //Если отсутствует, то задаём ключу значение системного языка
  change = window.navigator.language.substring(0, 2);
  localStorage.setItem("lang", change);
}

//Функция установки языка
function setLang() {
  //Проверяем какой язык в хранилище и запускаем соответствующую функцию
  if (localStorage.getItem('lang') === "ru") langRu();
  else if (localStorage.getItem('lang') === "en") langEn();
  else langEn();
  return 0;
}

//Вызов функции на стадии загрузки страницы
$(() => { setLang(); });

//При клике на вкладку "Профиль" она откроется
$("#profile").click(function () {
  $(".profile").show();
  $("#profile").css({ "color": "#fff" });
  $(".opengame").hide();
  $("#opengame").css({ "color": "#aaa" });
  $(".creategame").hide();
  $("#creategame").css({ "color": "#aaa" });
  $(".statistics").hide();
  $("#statistics").css({ "color": "#aaa" });
});
//При клике на вкладку "Открытые игры" она откроется
$("#opengame").click(function () {
  $(".profile").hide();
  $("#profile").css({ "color": "#aaa" });
  $(".opengame").show();
  $("#opengame").css({ "color": "#fff" });
  $(".creategame").hide();
  $("#creategame").css({ "color": "#aaa" });
  $(".statistics").hide();
  $("#statistics").css({ "color": "#aaa" });
});
//При клике на вкладку "Создать игру" она откроется
$("#creategame").click(function () {
  $(".profile").hide();
  $("#profile").css({ "color": "#aaa" });
  $(".opengame").hide();
  $("#opengame").css({ "color": "#aaa" });
  $(".creategame").show();
  $("#creategame").css({ "color": "#fff" });
  $(".statistics").hide();
  $("#statistics").css({ "color": "#aaa" });
});
//При клике на вкладку "Статистика" она откроется
$("#statistics").click(function () {
  $(".profile").hide();
  $("#profile").css({ "color": "#aaa" });
  $(".opengame").hide();
  $("#opengame").css({ "color": "#aaa" });
  $(".creategame").hide();
  $("#creategame").css({ "color": "#aaa" });
  $(".statistics").show();
  $("#statistics").css({ "color": "#fff" });
});

//Переменные для хранения некоторой информации
var field = null; //Размер поля в игре
var player = null; //Количество игроков, допустимые в игру
var num_player1; //Количество игроков, находящиеся в игре
var gameOn = false; //Состояние игры (закончена или нет)
var k = 0; //Счетчик установленных фишек на поле
var noRoom; //Номер комнаты, в которой находится текущий пользователь
var nickname; //Никнэйм данного пользователя
var turnPlayer = []; //Массив для хранения очередности хода игроков
var Players = {}; //Объект для хранения никнэймов игроков в комнате
var socket = io(); //Переменная для создания связи с сервером
var botYes = false; //Проверка на участия игры с ботом
var fishki = ["X", "O", "∆", "□", "◊", "♫", "♡", "♤"]; //Фигурки игроков
var colFishki = ["#0af", "#0f5", "#f00", "#ff0", "#f0f", "#ffa500", "#FF9999", "#CCFF00"];
var numMess = 0; //Количество непрочтенных сообщений
var tempNick = "Guest"; //Временное имя игрока
var winnings = 0; //Количество побед
var draws = 0; //Количество ничьих
var losses = 0; //Количество проигрышей
var rank = ""; //Ранг пользователя
var RanksEN = ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Grandmaster"];
var RanksRU = ["Железо", "Бронза", "Серебро", "Золото", "Платина", "Алмаз", "Грандмастер"];
var lvlRank = [[20, 40, 80], [130, 180, 230], [290, 350, 410], [480, 550, 620], [700, 780, 860], [950, 1040, 1130], [1230, 1330, 1430]];

//Обновление статистики каждые полсекунды 
setInterval(() => {
  $("#winnings").html(winnings);
  $("#draws").html(draws);
  $("#losses").html(losses);
  if(rank != "") $("#rank").html(rank);
  $("#nickname").html(tempNick);
}, 500);

var playerBlock = $(".player");
playerBlock = Object.values(playerBlock);
playerBlock.splice(-2);
var a = playerBlock.splice(-1)[0];
playerBlock.unshift(a);

var nickBlock = $(".nickBlock");
nickBlock = Object.values(nickBlock);
nickBlock.splice(-2);
var a = nickBlock.splice(-1)[0];
nickBlock.unshift(a);

if(document.cookie.indexOf("token") != -1 && document.cookie.match(/token=(.+?)(;|$)/)[1] != 'null'){
  socket.emit('getNickToken', document.cookie.match(/token=(.+?)(;|$)/)[1]);
}

socket.on('setNickToken', (nick) => {
  tempNick = nick;
  $("#butSign").hide();
  $("#Logout").show();
  socket.emit('getStats');
});

socket.on('delToken', () => {
  document.cookie = "token=null";
});

$("#Logout").click(()=>{
  document.cookie = "token=null";
  window.location.reload();
});

//При клике на одну из радиокнопок в переменную будет занесено значение
$("input[name=field]").click(function () {
  player = null;
  for (var i = 0; i < playRadAll.length; i++) {
    $(playRadAll[i]).prop('disabled', true).prop('checked', false);
  }
  field = $(this).attr("id").slice(-2);
  field = +field;
  for (var i = 0; i < playRadAll.length; i++) {
    if (field == 3) {
      if ($(playRadAll[i]).attr("id").slice(-1) < field)
        $(playRadAll[i]).prop('disabled', false);
    } else if ($(playRadAll[i]).attr("id").slice(-1) < field - 1) $(playRadAll[i]).prop('disabled', false);
  }
});
$("input[name=player]").click(function () {
  player = $(this).attr("id").slice(-1);
});

//Сообщение запрос статистики игрока
socket.emit('getStats');

//Получение данных о статистики
socket.on('dataStats', (stats) => {
  var outStats = $("#outStats");
  
  function Sort(name, znak){
    for(var i = 0; i < stats.length; i++){
      for(var j = 0; j < Object.keys(stats).length; j++){
        if(stats[j+1] != undefined){
          switch(znak){
            case '>':
              if(stats[j][`${name}`] > stats[j+1][`${name}`]){
                var temp = stats[j+1];
                stats[j+1] = stats[j];
                stats[j] = temp;
              }
              break;
            case '<':
              if(stats[j][`${name}`] < stats[j+1][`${name}`]){
                var temp = stats[j+1];
                stats[j+1] = stats[j];
                stats[j] = temp;
              }
              break;
          }
        }
      }
    }
    switch(znak){
      case '>':
        tableSort(name, " ↓");
        break;
      case '<':
        tableSort(name, " ↑");
        break;
    }
  }
  
  Sort ("winnings", "<");

  function tableSort(name, znak) {
    $(outStats).empty();
    var tableStats = $("<table class='table-auto w-full' id='tableStats'></table>");
    var tr = $('<tr><td class="border-2 border-slate-400 px-2 w-1/6" data-rVal="Никнэйм" data-eVal="Nickname" id="user"></td><td class="border-2 border-slate-400 px-2 w-1/6" data-rVal="Победы" data-eVal="Winnigs" id="winnings"></td><td class="border-2 border-slate-400 px-2 w-1/6" data-rVal="Ничьи" data-eVal="Draws" id="draws"></td><td class="border-2 border-slate-400 px-2 w-1/6" data-rVal="Проигрыши" data-eVal="Losses" id="losses"></td></tr>');
    $(tableStats).append(tr);
    for (var i = 0; i < Object.keys(stats).length; i++) {
      if (tempNick == stats[i]['user']) {
        winnings = stats[i]['winnings'];
        draws = stats[i]['draws'];
        losses = stats[i]['losses'];
        for(var j = 0; j < lvlRank.length; j++){
          for(var k = 0; k < lvlRank[j].length; k++){
            if (lvlRank[j][k] <= winnings) {
              if(localStorage['lang'] == "ru") rank = RanksRU[j]+" "+(k+1);
              if(localStorage['lang'] == "en") rank = RanksEN[j]+" "+(k+1);
            }
          }
        }
      }
      var tr = $("<tr></tr>");
      var td = $("<td class='border-2 border-slate-400 px-2 w-1/6'></td>");
      $(td).text(stats[i]['user']);
      $(tr).append(td);
      var td = $("<td class='border-2 border-slate-400 px-2 w-1/6'></td>");
      $(td).text(stats[i]['winnings']);
      $(tr).append(td);
      var td = $("<td class='border-2 border-slate-400 px-2 w-1/6'></td>");
      $(td).text(stats[i]['draws']);
      $(tr).append(td);
      var td = $("<td class='border-2 border-slate-400 px-2 w-1/6'></td>");
      $(td).text(stats[i]['losses']);
      $(tr).append(td);
      $(tableStats).append(tr);
    }
    outStats.append(tableStats);
    setLang();
    $("#tableStats td#" + name).text($("#tableStats td#" + name).text() + znak);
    $("#tableStats tr:first-child td").click(function(){
      if($(this).text().indexOf("↑") == -1){
        var name = $(this).attr("id");
        Sort (name, "<");
      } else {
        var name = $(this).attr("id");
        Sort (name, ">");
      }
    })
  }
});

$("#statistics").click(function () {
  socket.emit('getStats');
});

//Авторизация в игре
$("#login").click(() => {
  if ($("#newProfile").val().length <= 10) {
    if ($("#newProfile").val() != '') socket.emit('Login', $("#newProfile").val());
  } else {
    $("#back #result").attr("data-rVal", "Вы ввели длинное имя. Максимальная длина 10 символов.").css({ "color": "yellow" });
    $("#back #result").attr("data-eVal", "You have entered a long name. The maximum length is 10 characters.").css({ "color": "yellow" });
    setLang();
  }
});
//Запрос пароля
socket.on('ReqPass', (login) => {
  $("#ReqPass").show();
  $("#Login").hide();
  $("#sentPass").click(function () {
    var pass = $("#reqPass").val();
    if (pass != '') socket.emit('checkPass', login, pass);
  });
});
//Установка пароля
socket.on('SetPass', (login) => {
  $("#SetPass").show();
  $("#Login").hide();
  $("#sentPass1").click(function () {
    var pass = $("#setPass").val();
    if (pass != '') socket.emit('settingPass', login, pass);
  });
});
//Неуспешная авторизация
socket.on('invalidPass', () => {
  $("#back #result1").attr("data-rVal", "Неверный пароль").css({ "color": "yellow" });
  $("#back #result1").attr("data-eVal", "Invalid password").css({ "color": "yellow" });
  setLang();
});
//Успешная авторизация
socket.on('doneLogin', (token) => {
  document.cookie = "token=" + token;
  $("#back, #Login, #ReqPass, #SetPass").hide();
  socket.emit('getNickToken', document.cookie.match(/token=(.+?)(;|$)/)[1]);
});

//Функция-обработчик по клику на ссылку и дальнейшего добавление в комнату 
function clickLink() {
  //Получение id ссылки
  noRoom = $(this).attr('id');
  //Получение значение в конце строки
  field = $("#hyperlink #" + noRoom + " #span2_2").text();
  //Получение значение в конце строки
  player = $("#hyperlink #" + noRoom + " #span3_2").text().slice(-1);
  //Отправка запроса на сервер для добавление в игру 
  socket.emit("connectToRoom", noRoom, player);
  return 0;
}

//Функция создания ссылок на доступ к совместной игре
function hyperCreate(roomno, nickname, field1, num_player1, player1) {
  var hyperlink = document.querySelector("#hyperlink");
  var div = document.createElement("div");
  $(div).attr("id", roomno);
  $(div).attr("class", "hyperLink border-2 border-yellow-300 text-center bg-gray-800 text-white mb-1.5 py-1.5 px-2.5");
  var span1 = document.createElement("span");
  var nameplayer = nickname;
  $(span1).attr("style", "font-size: 20pt;");
  $(span1).attr("id", "span1");
  $(span1).html(nameplayer);
  div.appendChild(span1);
  var br = document.createElement("br");
  div.appendChild(br);
  var span2 = document.createElement("span");
  $(span2).attr("id", "span2");
  var span2_1 = document.createElement("span");
  $(span2_1).attr("id", "span2_1");
  $(span2_1).attr("data-rVal", "Размер поля - ");
  $(span2_1).attr("data-eVal", "Size field - ");
  span2.appendChild(span2_1);
  var span2_2 = document.createElement("span");
  $(span2_2).attr("id", "span2_2");
  $(span2_2).html(field1);
  span2.appendChild(span2_2);
  div.appendChild(span2);
  var span3 = document.createElement("span");
  $(span3).attr("id", "span3");
  var span3_1 = document.createElement("span");
  $(span3_1).attr("id", "span3_1");
  $(span3_1).attr("data-rVal", "x" + field1 + " | Количество игроков - ");
  $(span3_1).attr("data-eVal", " Number of players - ");
  span3.appendChild(span3_1);
  var span3_2 = document.createElement("span");
  $(span3_2).attr("id", "span3_2");
  $(span3_2).html(num_player1 + "/" + player1);
  span3.appendChild(span3_2);
  div.appendChild(span3);
  hyperlink.appendChild(div);
  var clickAllow = document.querySelector("#" + roomno);
  clickAllow.addEventListener("click", clickLink);
  //Установка языка
  setLang();
  return 0;
}

//Получение данных из JSON файла
$("#hyperlink").empty();
socket.emit("GETLinks");

//Обновление ссылок при нажатии на вкладку Открытые
$("#opengame").click(function () {
  $("#hyperlink").empty();
  socket.emit("GETLinks");
});

//Сообщение от сервера на очистку ссылок
socket.on("clearLinks", () => {
  $("#hyperlink").empty();
  socket.emit("GETLinks");
});

//Сообщение от сервера на создание ссылок
socket.on("AddLinks", (roomno, nickname, field, num_player, player) => {
  hyperCreate(roomno, nickname, field, num_player, player);
});

//Разрешение на вход в игру
socket.on("connectGame", () => {
  //Следующие три строки показывают/скрывают элементы интерфейса
  $("#game1").show();
  $("footer").hide();
  $(".opengame").hide();
  createMaps();
  //Запуск функции игры с реальными игроками
  PvP();
});

//Функция выхода из игры с реальными игроками
function exitgame() {
  botYes = false;
  k = 0;
  gameOn = false;
  turnPlayer = [];
  socket.emit("exitGame", noRoom, nickname);
  $("footer").show();
  if ($("#opengame").css("color") == "rgb(255, 255, 255)") {
    $(".opengame").show();
    $(".creategame").hide();
  } else {
    $(".creategame").show();
    $(".opengame").hide();
  }
  $("#game1").hide();
  $("#tablegame1").empty();
  $("#outChat").empty();
  $(".hrWin").remove();
  $("#chat").css({ "display": "none" });
  $("#game1 #input").css({ "color": "white", "display": "none" }).html("");
  $("#game1 #closetic").hide();
  $(".Wait").hide();
  return 0;
}

//Событие отлавливающее кнопку назад 
if(window.history && window.history.pushState){
  $(window).on("popstate",()=>{
    if($("#game1").css("display") == "block")  exitgame();
  });
}

//Функция установления победы
function win(currentMove, field, whatGame, iB, jB, iE, jE) {
  gameOn = true;
  var winner;
  //Проверка кто выиграл через фишку
  for (var i = 0; i < fishki.length; i++) {
    if (currentMove == fishki[i]) winner = Players[i].slice(2);
  }

  $("#" + whatGame + " #input").attr("data-rVal", winner + " выиграл!");
  $("#" + whatGame + " #input").attr("data-eVal", winner + " wins!");
  $("#" + whatGame + " #input").css({ "display": "block" });
  setLang();

  //Переменные для нахождения краев всего поля с клетками
  var size = field - 1;
  var topTD = $("#" + whatGame + " td#0_0").offset().top;
  var leftTD = $("#" + whatGame + " td#0_0").offset().left;
  var rightTD = $("#" + whatGame + " td#" + size + "_" + size).offset().left + $("td#" + size + "_" + size).width();
  var bottomTD = $("#" + whatGame + " td#" + size + "_" + size).offset().top + $("td#" + size + "_" + size).height();
  var width = rightTD - leftTD;
  var height = bottomTD - topTD;
  $("#" + whatGame + " #closetic").css({ "top": topTD, "left": leftTD, "height": height, "width": width }).show();

  //Проверка какой игрок победил и установление цвета тексту, а также запуск ф-ции победы/проигрыша
  var whatCol = colFishki[fishki.indexOf(currentMove)];
  $("#" + whatGame + " #input").css({ "color": whatCol });

  //Выдача побед/проигрышей игрокам
  for (var i = 0; i < fishki.length; i++) {
    if (currentMove === fishki[i]) {
      if ($("#" + whatGame + " #nickOne").text().indexOf(fishki[i]) != -1) winnings += 1;
      for (var j = 0; j < fishki.length; j++) {
        if (fishki[i] != fishki[j]) if ($("#" + whatGame + " #nickOne").text().indexOf(fishki[j]) != -1) losses += 1;
      }
      break;
    }
  }

  //Установление цвета всем игрокам
  $(".player").css({ "background-color": "#000" });
  //Отображение кнопки сброса
  $("#reset").show();

  //Рисование черты по победным фишкам
  var game = document.querySelector("#" + whatGame + " .field");
  var beginSlot = $("#" + whatGame + " #" + iB + "_" + jB);
  var endSlot = $("#" + whatGame + " #" + iE + "_" + jE);
  if (iB == iE) {
    if (iB == 0) var centerTB = $(beginSlot).offset().top + 15;
    else var centerTB = $(beginSlot).offset().top + 20;
    var centerLB = $(beginSlot).offset().left - 8;
    var centerLE = $(endSlot).offset().left + $(endSlot).width() - 10;
    var widthLine = centerLE - centerLB;
    var hr = document.createElement("hr");
    $(hr).css({ "border": "3px solid white", "position": "absolute", "left": centerLB + "px", "top": centerTB + "px", "width": widthLine + "px", "height": "0px", "margin": "0" }).attr("class", "hrWin");
  } else if (jB == jE) {
    if (jB == 0) var centerLB = $(beginSlot).offset().left + 18;
    else var centerLB = $(beginSlot).offset().left + 20;
    var centerTB = $(beginSlot).offset().top - 8;
    var centerTE = $(endSlot).offset().top + $(endSlot).height();
    var heightLine = centerTE - centerTB;
    var hr = document.createElement("hr");
    $(hr).css({ "border": "3px solid white", "position": "absolute", "left": centerLB + "px", "top": centerTB + "px", "width": "0px", "height": heightLine + "px", "margin": "0" }).attr("class", "hrWin");
  } else if (iB < iE && jB < jE) {
    var centerTB = $(beginSlot).offset().top - 10;
    var centerLB = $(beginSlot).offset().left - 10;
    var centerTE = $(endSlot).offset().top + $(endSlot).height();
    var centerLE = $(endSlot).offset().left + $(endSlot).width();
    var a2 = (centerTE - $(beginSlot).offset().top) ** 2;
    var b2 = (centerLE - $(beginSlot).offset().left) ** 2;
    var widthLine = Math.sqrt(a2 + b2);
    centerTB += (centerTE - $(beginSlot).offset().top) / 2;
    centerLB -= (widthLine - (centerLE - $(beginSlot).offset().left)) / 2;
    var hr = document.createElement("hr");
    $(hr).css({ "border": "3px solid white", "position": "absolute", "left": centerLB + "px", "top": centerTB + "px", "width": widthLine + "px", "height": "0px", "margin": "0", "transform": "rotateZ(45deg)" }).attr("class", "hrWin");
  } else if (iB < iE && jB > jE) {
    var centerTB = $(beginSlot).offset().top - 7;
    var centerLB = $(beginSlot).offset().left + $(beginSlot).width();
    var centerTE = $(endSlot).offset().top + $(endSlot).height();
    var centerLE = $(endSlot).offset().left - 10;
    var a2 = (centerTE - $(beginSlot).offset().top) ** 2;
    var b2 = (centerLB - centerLE) ** 2;
    var widthLine = Math.sqrt(a2 + b2);
    centerTB += (centerTE - $(beginSlot).offset().top) / 2;
    centerLE -= (widthLine - (centerLB - centerLE)) / 2;
    var hr = document.createElement("hr");
    $(hr).css({ "border": "3px solid white", "position": "absolute", "left": centerLE + "px", "top": centerTB + "px", "width": widthLine + "px", "height": "0px", "margin": "0", "transform": "rotateZ(-45deg)" }).attr("class", "hrWin");
  }
  game.appendChild(hr);
  if (tempNick != "Guest") socket.emit('SentStats', tempNick, winnings, draws, losses);
  return 0;
}

//Функция ничьих
function Draw(field, whatGame) {
  gameOn = true;
  //Получение значения ключа ничья, интерация значения и отправка значения обратно
  draws += 1;
  //Вывод записи в поле о том что ничья
  $("#" + whatGame + " #input").attr("data-rVal", "Это ничья!");
  $("#" + whatGame + " #input").attr("data-eVal", "It is a Draw!");
  //Установление желтого цвета тексту
  $("#" + whatGame + " #input").css({ "color": "yellow", "display": "block" });
  setLang();

  //Переменные для нахождения краев всего поля с клетками
  var size = field - 1;
  var topTD = $("#" + whatGame + " td#0_0").offset().top;
  var leftTD = $("#" + whatGame + " td#0_0").offset().left;
  var rightTD = $("#" + whatGame + " td#" + size + "_" + size).offset().left + $("td#" + size + "_" + size).width();
  var bottomTD = $("#" + whatGame + " td#" + size + "_" + size).offset().top + $("td#" + size + "_" + size).height();
  var width = rightTD - leftTD;
  var height = bottomTD - topTD;
  $("#" + whatGame + " #closetic").css({ "top": topTD, "left": leftTD, "height": height, "width": width }).show();

  //Установление цвета всем игрокам
  $(".player").css({ "background-color": "#000" });
  //Отображение кнопки сброса
  $("#reset").show();
  if (tempNick != "Guest") socket.emit('SentStats', tempNick, winnings, draws, losses);
  return 0;
}

//Функция проверки на победу 
function proverka(whatGame, currentMove, field) {
  for (var i = 0; i < field; i++) {
    for (var j = 0; j < field; j++) {
      if ($("#" + whatGame + " #" + i + "_" + j).text() == currentMove) {
        //Проверка наличия фигурок с ходом вправо
        var jR = j;
        if ($("#" + whatGame + " #" + i + "_" + (++jR)).text() == currentMove && $("#" + whatGame + " #" + i + "_" + (++jR)).text() == currentMove) {
          if (field == 15) {
            if ($("#" + whatGame + " #" + i + "_" + (++jR)).text() == currentMove && $("#" + whatGame + " #" + i + "_" + (++jR)).text() == currentMove && $("#" + whatGame + " #" + i + "_" + (++jR)).text() == currentMove) win(currentMove, field, whatGame, i, j, i, jR);
          } else if (field > 3) {
            if ($("#" + whatGame + " #" + i + "_" + (++jR)).text() == currentMove) win(currentMove, field, whatGame, i, j, i, jR);
          } else win(currentMove, field, whatGame, i, j, i, jR);
        }
        //Проверка наличия фигурок с ходом вниз
        var iB = i;
        if ($("#" + whatGame + " #" + (++iB) + "_" + j).text() == currentMove && $("#" + whatGame + " #" + (++iB) + "_" + j).text() == currentMove) {
          if (field == 15) {
            if ($("#" + whatGame + " #" + (++iB) + "_" + j).text() == currentMove && $("#" + whatGame + " #" + (++iB) + "_" + j).text() == currentMove && $("#" + whatGame + " #" + (++iB) + "_" + j).text() == currentMove) win(currentMove, field, whatGame, i, j, iB, j);
          } else if (field > 3) {
            if ($("#" + whatGame + " #" + (++iB) + "_" + j).text() == currentMove) win(currentMove, field, whatGame, i, j, iB, j);
          } else win(currentMove, field, whatGame, i, j, iB, j);
        }
        //Проверка наличия фигурок с ходом в правый нижний угол
        var iB = i, jR = j;
        if ($("#" + whatGame + " #" + (++iB) + "_" + (++jR)).text() == currentMove && $("#" + whatGame + " #" + (++iB) + "_" + (++jR)).text() == currentMove) {
          if (field == 15) {
            if ($("#" + whatGame + " #" + (++iB) + "_" + (++jR)).text() == currentMove && $("#" + whatGame + " #" + (++iB) + "_" + (++jR)).text() == currentMove && $("#" + whatGame + " #" + (++iB) + "_" + (++jR)).text() == currentMove) win(currentMove, field, whatGame, i, j, iB, jR);
          } else if (field > 3) {
            if ($("#" + whatGame + " #" + (++iB) + "_" + (++jR)).text() == currentMove) win(currentMove, field, whatGame, i, j, iB, jR);
          } else win(currentMove, field, whatGame, i, j, iB, jR);
        }
        //Проверка наличия фигурок с ходом в левый нижний угол
        var iB = i, jR = j;
        if ($("#" + whatGame + " #" + (++iB) + "_" + (--jR)).text() == currentMove && $("#" + whatGame + " #" + (++iB) + "_" + (--jR)).text() == currentMove) {
          if (field == 15) {
            if ($("#" + whatGame + " #" + (++iB) + "_" + (--jR)).text() == currentMove && $("#" + whatGame + " #" + (++iB) + "_" + (--jR)).text() == currentMove && $("#" + whatGame + " #" + (++iB) + "_" + (--jR)).text() == currentMove) win(currentMove, field, whatGame, i, j, iB, jR);
          } else if (field > 3) {
            if ($("#" + whatGame + " #" + (++iB) + "_" + (--jR)).text() == currentMove) win(currentMove, field, whatGame, i, j, iB, jR);
          } else win(currentMove, field, whatGame, i, j, iB, jR);
        }
      }
    }
  }
  //Переменная для расчета квадратов поля
  var field1 = field * field;
  //Проверка не закончена ли игра и не законились места для установки фишек
  if (k == field1 && gameOn == false) {
    Draw(field, whatGame);
  }
  return 0;
}

//Игровой бот
function Bot(whatGame, field, botname, fishka) {
  //Переменная которая обозначает установил бот нолик или нет
  var taken = false;
  var taken1 = false;
  var posT = false;
  var sharpNo = false;

  //Функция установки фишки бота
  function setup(iN, jN) {
    if (taken == false) {
      socket.emit('click', iN + "_" + jN, botname, noRoom);
      taken = true;
    }
    return 0;
  }

  //Функция генерации позиции установки фишки бота
  function generate() {
    posT = true;
    if (field == 15) {
      while (taken1 == false) {
        var arr = [];
        var n = 0;
        for (var i = 0; i < field; i++) {
          for (var j = 0; j < field; j++) {
            if ($("#" + whatGame + " #" + i + "_" + j).text() != " ") {
              arr[n] = i + "_" + j;
              n++;
            }
          }
        }
        if (arr.length != 0) {
          var pos = Math.floor(Math.random() * arr.length);
          var elem = arr[pos];
          var arr1 = [];
          n = 0;
          var i = elem.slice(0, elem.indexOf("_"));
          var j = elem.slice(elem.indexOf("_") + 1);
          var iT = i;
          if ((--iT) != -1) {
            arr1[n] = iT + "_" + j;
            n++;
          }
          var iB = i;
          if ((++iB) != field) {
            arr1[n] = iB + "_" + j;
            n++;
          }
          var jR = j;
          if ((++jR) != field) {
            arr1[n] = i + "_" + jR;
            n++;
          }
          var jL = j;
          if ((--jL) != -1) {
            arr1[n] = i + "_" + jL;
            n++;
          }
          var iT = i; var jR = j;
          if ((--iT) != -1 || (++jR) != field) {
            arr1[n] = iT + "_" + jR;
            n++;
          }
          var iB = i; var jR = j;
          if ((++iB) != field || (++jR) != field) {
            arr1[n] = iB + "_" + jR;
            n++;
          }
          var iB = i; var jL = j;
          if ((++iB) != field || (--jL) != -1) {
            arr1[n] = iB + "_" + jL;
            n++;
          }
          var iT = i; var jL = j;
          if ((--iT) != -1 || (--jL) != -1) {
            arr1[n] = iT + "_" + jL;
            n++;
          }
          var pos = Math.floor(Math.random() * arr1.length);
          var elem = arr1[pos];
          var posNull = $("#" + whatGame + " #" + elem).text();
          if (posNull == " ") {
            taken1 = true;
            var i = elem.slice(0, elem.indexOf("_"));
            var j = elem.slice(elem.indexOf("_") + 1);
            setup(i, j);
          }
        } else {
          var i = Math.floor(Math.random() * field);
          var j = Math.floor(Math.random() * field);
          var move = $("#" + whatGame + " #" + i + "_" + j).text();
          if (move === " ") {
            taken1 = true;
            setup(i, j);
          }
        }
      }
    } else {
      var numPass = 0;
      while (taken1 == false) {
        var i = Math.floor(Math.random() * field);
        var j = Math.floor(Math.random() * field);
        var move = $("#" + whatGame + " #" + i + "_" + j).text();
        if (move === " ") {
          taken1 = true;
          setup(i, j);
        } else numPass++;
        if (numPass >= 3) {
          taken1 = true;
          for (var i = 0; i < field; i++) {
            for (var j = 0; j < field; j++) {
              if (taken == false) {
                var move = $("#" + whatGame + " #" + i + "_" + j).text();
                if (move === " ") setup(i, j);
              }
            }
          }
        }
      }
    }
    return 0;
  }

  //Проходим по всему полю и ищем фишки бота/противника(-ов) и устанаиваем туда фишку бота
  function findFishka(elem) {
    var bool;
    for (var i = 0; i < field; i++) {
      for (var j = 0; j < field; j++) {
        if (taken == false) {
          if (elem == " ") bool = ($("#" + whatGame + " #" + i + "_" + j).text() != elem);
          else bool = ($("#" + whatGame + " #" + i + "_" + j).text() == elem);
          if (bool) {
            var figure = $("#" + whatGame + " #" + i + "_" + j).text();
            //Поиск фигурки бота c ходом вправо
            var jR = j;
            if ($("#" + whatGame + " #" + i + "_" + (++jR)).text() == figure) {
              if (elem == " " && field > 3) {
                if ($("#" + whatGame + " #" + i + "_" + (++jR)).text() == figure) {
                  var move = $("#" + whatGame + " #" + i + "_" + (++jR)).text();
                  if (move === " ") { setup(i, jR); }
                  else sharpNo = true;
                } else if ($("#" + whatGame + " #" + i + "_" + (++jR)).text() == figure) {
                  var move = $("#" + whatGame + " #" + i + "_" + (--jR)).text();
                  if (move === " ") { setup(i, jR); }
                  else sharpNo = true;
                } else sharpNo = true;
              } else {
                var move = $("#" + whatGame + " #" + i + "_" + (++jR)).text();
                if (move === " ") { setup(i, jR); }
                else sharpNo = true;
              }
            } else if ($("#" + whatGame + " #" + i + "_" + (++jR)).text() == figure) {
              if (field == 3) {
                var move = $("#" + whatGame + " #" + i + "_" + (--jR)).text();
                if (move === " ") { setup(i, jR); }
                else sharpNo = true;
              }
            } else sharpNo = true;
            //Поиск элемента X или O c ходом влево
            var jL = j;
            if ($("#" + whatGame + " #" + i + "_" + (--jL)).text() == figure) {
              if (elem == " " && field > 3) {
                if ($("#" + whatGame + " #" + i + "_" + (--jL)).text() == figure) {
                  var move = $("#" + whatGame + " #" + i + "_" + (--jL)).text();
                  if (move === " ") { setup(i, jL); }
                  else sharpNo = true;
                } else if ($("#" + whatGame + " #" + i + "_" + (--jL)).text() == figure) {
                  var move = $("#" + whatGame + " #" + i + "_" + (++jL)).text();
                  if (move === " ") { setup(i, jL); }
                  else sharpNo = true;
                } else sharpNo = true;
              } else {
                var move = $("#" + whatGame + " #" + i + "_" + (--jL)).text();
                if (move === " ") { setup(i, jL); }
                else sharpNo = true;
              }
            } else sharpNo = true;
            //Поиск элемента X или O c ходом вниз
            var iB = i;
            if ($("#" + whatGame + " #" + (++iB) + "_" + j).text() == figure) {
              if (elem == " " && field > 3) {
                if ($("#" + whatGame + " #" + (++iB) + "_" + j).text() == figure) {
                  var move = $("#" + whatGame + " #" + (++iB) + "_" + j).text();
                  if (move === " ") { setup(iB, j); }
                  else sharpNo = true;
                } else if ($("#" + whatGame + " #" + (++iB) + "_" + j).text() == figure) {
                  var move = $("#" + whatGame + " #" + (--iB) + "_" + j).text();
                  if (move === " ") { setup(iB, j); }
                  else sharpNo = true;
                } else sharpNo = true;
              } else {
                var move = $("#" + whatGame + " #" + (++iB) + "_" + j).text();
                if (move === " ") { setup(iB, j); }
                else sharpNo = true;
              }
            } else if ($("#" + whatGame + " #" + (++iB) + "_" + j).text() == figure) {
              if (field == 3) {
                var move = $("#" + whatGame + " #" + (--iB) + "_" + j).text();
                if (move === " ") { setup(iB, j); }
                else sharpNo = true;
              }
            } else sharpNo = true;
            //Поиск элемента X или O c ходом вверх
            var iT = i;
            if ($("#" + whatGame + " #" + (--iT) + "_" + j).text() == figure) {
              if (elem == " " && field > 3) {
                if ($("#" + whatGame + " #" + (--iT) + "_" + j).text() == figure) {
                  var move = $("#" + whatGame + " #" + (--iT) + "_" + j).text();
                  if (move === " ") { setup(iT, j); }
                  else sharpNo = true;
                } else if ($("#" + whatGame + " #" + (--iT) + "_" + j).text() == figure) {
                  var move = $("#" + whatGame + " #" + (++iT) + "_" + j).text();
                  if (move === " ") { setup(iT, j); }
                  else sharpNo = true;
                } else sharpNo = true;
              } else {
                var move = $("#" + whatGame + " #" + (--iT) + "_" + j).text();
                if (move === " ") { setup(iT, j); }
                else sharpNo = true;
              }
            } else sharpNo = true;
            //Поиск элемента X или O c ходом в правый нижний угол
            var iB = i, jR = j;
            if ($("#" + whatGame + " #" + (++iB) + "_" + (++jR)).text() == figure) {
              if (elem == " " && field > 3) {
                if ($("#" + whatGame + " #" + (++iB) + "_" + (++jR)).text() == figure) {
                  var move = $("#" + whatGame + " #" + (++iB) + "_" + (++jR)).text();
                  if (move === " ") { setup(iB, jR); }
                  else sharpNo = true;
                } else if ($("#" + whatGame + " #" + (++iB) + "_" + (++jR)).text() == figure) {
                  var move = $("#" + whatGame + " #" + (--iB) + "_" + (--jR)).text();
                  if (move === " ") { setup(iB, jR); }
                  else sharpNo = true;
                } else sharpNo = true;
              } else {
                var move = $("#" + whatGame + " #" + (++iB) + "_" + (++jR)).text();
                if (move === " ") { setup(iB, jR); }
                else sharpNo = true;
              }
            } else if ($("#" + whatGame + " #" + (++iB) + "_" + (++jR)).text() == figure) {
              if (field == 3) {
                var move = $("#" + whatGame + " #" + (--iB) + "_" + (--jR)).text();
                if (move === " ") { setup(iB, jR); }
                else sharpNo = true;
              }
            } else sharpNo = true;
            //Поиск элемента X или O c ходом в левый верхний угол
            var iT = i, jL = j;
            if ($("#" + whatGame + " #" + (--iT) + "_" + (--jL)).text() == figure) {
              if (elem == " " && field > 3) {
                if ($("#" + whatGame + " #" + (--iT) + "_" + (--jL)).text() == figure) {
                  var move = $("#" + whatGame + " #" + (--iT) + "_" + (--jL)).text();
                  if (move === " ") { setup(iT, jL); }
                  else sharpNo = true;
                } else if ($("#" + whatGame + " #" + (--iT) + "_" + (--jL)).text() == figure) {
                  var move = $("#" + whatGame + " #" + (++iT) + "_" + (++jL)).text();
                  if (move === " ") { setup(iT, jL); }
                  else sharpNo = true;
                } else sharpNo = true;
              } else {
                var move = $("#" + whatGame + " #" + (--iT) + "_" + (--jL)).text();
                if (move === " ") { setup(iT, jL); }
                else sharpNo = true;
              }
            } else sharpNo = true;
            //Поиск элемента X или O c ходом в левый нижний угол
            var iB = i, jL = j;
            if ($("#" + whatGame + " #" + (++iB) + "_" + (--jL)).text() == figure) {
              if (elem == " " && field > 3) {
                if ($("#" + whatGame + " #" + (++iB) + "_" + (--jL)).text() == figure) {
                  var move = $("#" + whatGame + " #" + (++iB) + "_" + (--jL)).text();
                  if (move === " ") { setup(iB, jL); }
                  else sharpNo = true;
                } else if ($("#" + whatGame + " #" + (++iB) + "_" + (--jL)).text() == figure) {
                  var move = $("#" + whatGame + " #" + (--iB) + "_" + (++jL)).text();
                  if (move === " ") { setup(iB, jL); }
                  else sharpNo = true;
                } else sharpNo = true;
              } else {
                var move = $("#" + whatGame + " #" + (++iB) + "_" + (--jL)).text();
                if (move === " ") { setup(iB, jL); }
                else sharpNo = true;
              }
            } else if ($("#" + whatGame + " #" + (++iB) + "_" + (--jL)).text() == figure) {
              if (field == 3) {
                var move = $("#" + whatGame + " #" + (--iB) + "_" + (++jL)).text();
                if (move === " ") { setup(iB, jL); }
                else sharpNo = true;
              }
            } else sharpNo = true;
            //Поиск элемента X или O c ходом в правый верхний угол
            var iT = i, jR = j;
            if ($("#" + whatGame + " #" + (--iT) + "_" + (++jR)).text() == figure) {
              if (elem == " " && field > 3) {
                if ($("#" + whatGame + " #" + (--iT) + "_" + (++jR)).text() == figure) {
                  var move = $("#" + whatGame + " #" + (--iT) + "_" + (++jR)).text();
                  if (move === " ") { setup(iT, jR); }
                  else sharpNo = true;
                } else if ($("#" + whatGame + " #" + (--iT) + "_" + (++jR)).text() == figure) {
                  var move = $("#" + whatGame + " #" + (++iT) + "_" + (--jR)).text();
                  if (move === " ") { setup(iT, jR); }
                  else sharpNo = true;
                } else sharpNo = true;
              } else {
                var move = $("#" + whatGame + " #" + (--iT) + "_" + (++jR)).text();
                if (move === " ") { setup(iT, jR); }
                else sharpNo = true;
              }
            } else sharpNo = true;
          }
          if ($("#" + whatGame + " #" + i + "_" + j).text() == fishka) {
            posT = true;
          }
        }
      }
    }
  }

  for (var i = 0; i < 2; i++) {
    if (i == 0) findFishka(fishka);
    else findFishka(" ");
  }

  if (sharpNo == true && taken == false) generate();
  if (posT == false && taken == false) generate();
  return 0;
}

//Функция отвечающая за очередь хода игроков
function turnPL(turnPlayer, whatGame) {
  //Получение первого элемента массива
  var firstElem = turnPlayer[0];

  //Функция установки цвета игроку, который должен походить
  function setColorPL(plBlock) {
    for (var i = 0; i < fishki.length; i++) {
      if ($("#" + whatGame + " #" + plBlock).text().indexOf(fishki[i]) != -1) {
        $("#" + whatGame + " .player").css({ "background-color": "#000" });
        var elemId = $(playerBlock[i]).attr("id");
        $("#" + whatGame + " #" + elemId).css({ "background-color": "blue" });
      }
    }
    return 0;
  }

  var plBlock = $(nickBlock[firstElem]).attr("id");
  setColorPL(plBlock);
  if (Players && Players[firstElem] != undefined) {
    if (Players[firstElem].indexOf("Bot") != -1 && Object.keys(Players).length == +player && gameOn == false) {
      Bot(whatGame, field, Players[firstElem], fishki[firstElem]);
    }
  }
  return 0;
}

//Клик по кнопке отправки сообщения в чат
$("#chat #sendMes").click(() => {
  if ($("#chat #inputText").val() != "") {
    var text = $("#chat #inputText").val();
    //Если в поле для сообщения не пусто, то беру от туда текст и отправляю на сервер
    socket.emit("sendMess", text, nickname, noRoom);
    $("#chat #inputText").val("");
  }
});

//Отслеживание нажатия кнопки Enter
document.addEventListener("keydown", (e) => {
  if ($("#chat #inputText").val() != "") {
    if (e.keyCode == 13) {
      var text = $("#chat #inputText").val();
      //Если в поле для сообщения не пусто, то беру от туда текст и отправляю на сервер
      socket.emit("sendMess", text, nickname, noRoom);
      $("#chat #inputText").val("");
    }
  }
});

//Получение сообщения от сервера на добавление сообщения в чат
socket.on("messPost", (text, nickname) => {
  if ($("#chat").css("display") == "none") {
    numMess++;
    $("#numMess").css({ "display": "block" }).text(numMess);
  }
  //Процедура создания сообщения в чат
  nickname = nickname.slice(2);
  var output = document.querySelector("#outChat");
  var div = document.createElement("div");
  $(div).css({ "width": "70%", "border-radius": "15px", "padding": "1px 15px", "margin": "5px" }).attr("class", "bg-slate-300");
  if (nickname != document.cookie.match(/nickname=(.+?)(;|$)/)[1]) {
    if ($("#chat").css("display") == "none")
      $(div).attr("class", "bg-red-500");
  }
  var bolt = document.createElement("b");
  $(bolt).text(nickname);
  div.appendChild(bolt);
  var hours = new Date().getHours();
  var min = new Date().getMinutes();
  hours = ((hours >= 10) ? hours : "0" + hours);
  min = ((min >= 10) ? min : "0" + min);
  var span = document.createElement("span");
  $(span).text(hours + ":" + min).css({ "margin-left": "10px" });
  div.appendChild(span);
  var br = document.createElement("br");
  div.appendChild(br);
  var span = document.createElement("span");
  $(span).text(text);
  div.appendChild(span);
  output.appendChild(div);
  div.scrollIntoView();
});

//Кнопка открытия чата
$("#buttonChat").click(() => {
  numMess = 0;
  $("#numMess").css({ "display": "none" }).text(numMess);
  setTimeout(() => {
    $("#outChat div").attr("class", "bg-slate-300");
  }, 2000);
});

//Кнопка создания бота
$("#addBot").click(function () {
  if (Object.keys(Players).length < player) {
    socket.emit('connectGame', Math.floor(Math.random() * 90 + 10) + 'Bot', noRoom);
    socket.emit('getPlayers', noRoom);
  }
});

//Кнопка создания бота
$("#delBot").click(function () {
  socket.emit('delBot', noRoom);
  socket.emit('getPlayers', noRoom);
});

//Функция совместной игры между реальными игроками
function PvP() {
  var whatGame = "game1";
  //Установка размера поля по числу и размеру ячеек
  var widthCell = 0;
  widthCell = $("td#0_0").width() * (+field + 1);
  //Скрытие кнопки сброса
  $("#reset").css({ "width": widthCell }).hide().attr("class", "relative left-0 bg-gray-800 border-2 border-white text-white text-center py-4");
  $("#game1 .field").css({ "width": widthCell + 80 });
  $(".Wait").css({ "width": $("#tablegame1").width(), "height": $("#tablegame1").height() - 20 });

  setInterval(() => {
    if ($("td#0_0").length) {
      var leftTD = $("td#0_0").offset().left;
      var topTD = $("td#0_0").offset().top;
      $(".Wait").css({ "left": leftTD, "top": topTD });
    }
    var butPosTop = $("#game1 .field").height() + $("#game1 .field").offset().top + 30;
    $("#buttonChat").css({ "top": butPosTop, "left": "300px" });
    var chatPosTop = $("#buttonChat").offset().top - $("#chat").height();
    $("#chat").css({ "top": chatPosTop });
  });

  //Отображение блока ожидание игроков
  $(".Wait").show();

  //Отображение блоков с именами присутствующих игроков если они есть в данной игре
  for (var i = 1; i < playerBlock.length; i++) {
    var elemId = $(playerBlock[i]).attr("id");
    var elemId1 = $(nickBlock[i]).attr("id");
    $("#" + whatGame + " #" + elemId + ", #" + whatGame + " #" + elemId1).hide();
    if (+player > i)
      $("#" + whatGame + " #" + elemId + ", #" + whatGame + " #" + elemId1).show();
  }

  nickname = Math.floor(Math.random() * 90 + 10) + tempNick;

  //Отправление никнейма на сервер
  socket.emit('connectGame', nickname, noRoom);

  //Проверка на игру с ботом
  if (botYes) socket.emit('connectGame', '00Bot', noRoom);

  //Событие по клику на клетку
  $(".tic").click(function () {
    //Получение id клетки
    var slot = $(this).attr('id');
    //Отправка запроса на сервер на установление значка в клетку
    socket.emit('click', slot, nickname, noRoom);
  });

  var may = false;
  //Получение ответа на клик по клетке
  socket.on('clickON', function (slot, idPlayer) {
    if (idPlayer == turnPlayer[0]) {
      if (field == 15 && Players[idPlayer].slice(2) != "Bot") {
        if (k == 0) {
          var spotTaken = $("#" + whatGame + " #" + slot).text();
          if (spotTaken == " ") {
            k++;
            var whatCol = colFishki[idPlayer];
            $("#" + whatGame + " #" + slot).text(fishki[idPlayer]).css({ "color": whatCol });
            proverka(whatGame, fishki[idPlayer], field);
            if (gameOn == false) {
              var a = turnPlayer.shift();
              turnPlayer.push(a);
            }
            turnPL(turnPlayer, whatGame);
          }
        } else {
          var i = $("#" + slot).attr("id").slice(0, $("#" + slot).attr("id").indexOf("_"));
          var j = $("#" + slot).attr("id").slice($("#" + slot).attr("id").indexOf("_") + 1);
          i = +i;
          j = +j;
          var jR = j;
          ++jR;
          if ($("#" + i + "_" + jR).text() != " " && $("#" + i + "_" + jR).text() != "") may = true;
          var jL = j;
          --jL;
          if ($("#" + i + "_" + jL).text() != " " && $("#" + i + "_" + jL).text() != "") may = true;
          var iB = i;
          ++iB;
          if ($("#" + iB + "_" + j).text() != " " && $("#" + iB + "_" + j).text() != "") may = true;
          var iT = i;
          --iT;
          if ($("#" + iT + "_" + j).text() != " " && $("#" + iT + "_" + j).text() != "") may = true;
          var jR = j, iB = i;
          ++iB; ++jR;
          if ($("#" + iB + "_" + jR).text() != " " && $("#" + iB + "_" + jR).text() != "") may = true;
          var jL = j, iT = i;
          --iT; --jL;
          if ($("#" + iT + "_" + jL).text() != " " && $("#" + iT + "_" + jL).text() != "") may = true;
          var jL = j, iB = i;
          ++iB; --jL;
          if ($("#" + iB + "_" + jL).text() != " " && $("#" + iB + "_" + jL).text() != "") may = true;
          var jR = j, iT = i;
          --iT; ++jR;
          if ($("#" + iT + "_" + jR).text() != " " && $("#" + iT + "_" + jR).text() != "") may = true;
          if (may) {
            var spotTaken = $("#" + whatGame + " #" + slot).text();
            if (spotTaken == " ") {
              k++;
              var whatCol = colFishki[idPlayer];
              $("#" + whatGame + " #" + slot).text(fishki[idPlayer]).css({ "color": whatCol });
              proverka(whatGame, fishki[idPlayer], field);
              if (gameOn == false) {
                var a = turnPlayer.shift();
                turnPlayer.push(a);
              }
              may = false;
              turnPL(turnPlayer, whatGame);
            }
          }
        }
      } else {
        //Получение id клетки
        var spotTaken = $("#" + whatGame + " #" + slot).text();
        //Проверка что клетка не занята
        if (spotTaken === " ") {
          k++;
          var whatCol = colFishki[idPlayer];
          $("#" + whatGame + " #" + slot).text(fishki[idPlayer]).css({ "color": whatCol });
          proverka(whatGame, fishki[idPlayer], field);
          if (gameOn == false) {
            var a = turnPlayer.shift();
            turnPlayer.push(a);
          }
          turnPL(turnPlayer, whatGame);
        }
      }
    }
  });

  socket.emit('getPlayers', noRoom);

  //Получение ответа от сервера
  socket.on('players', function (players) {
    //Заполнение массива числами ходов
    for (var i = 0; i < player; i++) turnPlayer[i] = i;
    //Дублирование игроков в комнате
    Players = players;
    //Отображение окна ожидания 
    if (players != null) {
      if (Object.keys(players).length == +player && $("#game1").css("display") == "block") $(".Wait").hide();
      else if ($("#game1").css("display") == "block") {
        $(".Wait").show();
        $("#waitPlayer").html(Object.keys(players).length + "/" + +player);
        socket.emit('clickReset');
      } else $(".Wait").hide();
    }
    //Стирание имени пользователя когда он выходит
    for (var i = 0; i < nickBlock.length; i++) $(nickBlock[i]).html("NaN");

    var k = 0;
    var nickBlock1 = $(".nickBlock");
    nickBlock1 = Object.values(nickBlock1);
    nickBlock1.splice(-2);
    var a = nickBlock1.splice(-1)[0];
    nickBlock1.unshift(a);

    if (players) {
      for (var i = 0; i < Object.keys(players).length; i++) {
        if (players[i] == nickname) {
          for (var j = 0; j < Object.keys(players).length; j++) {
            $("#" + whatGame + " #" + $(nickBlock1[j]).attr("id")).html(players[j].slice(2) + " - " + fishki[j]);
          }
        } else {
          if (nickBlock1[k + 1] != undefined) {
            var a = nickBlock1.splice(k + 1, 1)[0];
            nickBlock1.unshift(a);
            k++;
          }
        }
      }
    }
    var ionAll = $("#game1 .player ion-icon");
    for (var i = 0; i < ionAll.length; i++) {
      $(ionAll[i]).attr("name", "person-outline");
    }

    for (var i = 0; i < nickBlock.length; i++) {
      var elemId = $(playerBlock[i]).attr("id");
      if ($(nickBlock[i]).text().indexOf('Bot') != -1) $("#" + whatGame + " #" + elemId + " ion-icon").attr("name", "logo-android");
    }
    turnPL(turnPlayer, whatGame);
  });

  //Событие по клику на сброс отправляет запрос на сервер
  $("#reset").click(function () {
    socket.emit('clickReset', noRoom);
  });

  //Получения ответа от сервера на сброс
  socket.on('reset', () => {
    gameOn = false;
    k = 0;
    $(".tic").html(" ").css("color", "white");
    $("#game1 #input").css({ "color": "white", "display": "none" }).html("");
    $(".hrWin").remove();
    $("#reset").hide();
    $("#game1 #closetic").hide();
    turnPL(turnPlayer, whatGame);
  });
  return 0;
}

//Функция создания карты для игры
function createMaps() {
  //Проверка на количество игроков. От этого будет зависеть какой элемент взять, в которую будут внесены изменения
  var table = document.querySelector("#tablegame1");

  //Циклы, которые создают элементы и вносят их в другие элементы
  for (var i = 0; i < field; i++) {
    var tr = document.createElement("tr");
    for (var j = 0; j < field; j++) {
      var td = document.createElement("td");
      td.innerHTML = " ";
      $(td).attr("id", i + "_" + j);
      $(td).attr("class", "tic");
      if (i == 0) {
        $(td).css({ "margin-top": "10px", "border-top": "none" });
      }
      if (j == 0) {
        $(td).css({ "border-left": "none" });
      }
      if (j + 1 == field) {
        $(td).css({ "border-right": "none" });
      }
      if (i + 1 == field) {
        $(td).css({ "margin-bottom": "10px", "border-bottom": "none" });
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  //Следующие строки создатут место для кнопки сброса игры
  var tr = document.createElement("tr");
  var p = document.createElement("p");
  $(p).attr("data-rVal", "Сброс");
  $(p).attr("data-eVal", "Reset");
  $(p).attr("class", "relative left-0 bg-gray-800 border-2 border-white text-white text-center py-4 rounded-lg").attr('id', 'reset');
  tr.appendChild(p);
  table.appendChild(tr);
  setLang();
  return 0;
}

//Эта функция срабатывает когда будет нажата кнопка Create/Создать
function creategame() {
  if (player != null && field != null) {
    //Запрос на создание комнаты    
    socket.emit('createRoom');
    //Получение сообщения от сервера с номером комнаты
    socket.on('POSTnoRoom', (roomno) => {
      noRoom = roomno;
    });
    setTimeout(() => {
      //Следующие три строки показывают/скрывают элементы интерфейса
      $("#game1").show();
      $("footer").hide();
      $(".creategame").hide();
      //Проверка на игру с ботом
      if (player == 1) player = 2, botYes = true;
      //Запрос на создание ссылки
      socket.emit('createLink', field, player, noRoom);
      createMaps();
      //Создание ссылки в истории
      window.history.pushState("","",window.location.href);
      //Вызов функции для нескольких игроков
      PvP();
    }, 250);
  }
  return 0;
}