const ws = require('ws');
const Trivia = require('./trivia.js');
const express = require('express');
const fs = require('fs');

var app = express();

app.use(express.static('public'));

var httpServer = app.listen(80, () => console.log("Server iniciado"));

const wss = new ws.Server({server : httpServer});

wss.on('connection', onSocketConnect);

const clients = new Set();


var juegos = []

function onSocketConnect(ws) {
  clients.add(ws);

  ws.on('message', mensaje => manejarMensaje(mensaje, ws));

  ws.on('close', function() {
    clients.delete(ws);
    var juego;
    if((juego = getJuego(ws)) != undefined){
      delete juegos[juegos.indexOf[juego]];
      console.log('Sesion ' + juego.id + ' eliminada');
    }

    console.log('Un cliente cerro su conexion');
  });
}

function getJuego(ws){
  return juegos.find(juego => {return juego.jugadores.has(ws)});
}

function enviarInformacionJuego(juego, ws){
  console.log("id sesion: " + juego.id);
  var json = {"tipo" : "datos_juego", "id_sesion" : juego.id, "jugadores" : juego.getNickJugadores()};
  var jsonParsed = JSON.stringify(json);
  ws.send(jsonParsed);
  console.log("se envio el mensaje " + jsonParsed);
}

function crearJuego(lider, pwd, ws){
  var nuevoJuego = new Trivia(lider, pwd);
  nuevoJuego.addJugador(lider, ws);
  var idSesion = juegos.push(nuevoJuego) - 1;
  nuevoJuego.id = idSesion;
  cargarPreguntasArchivo(nuevoJuego);

  enviarInformacionJuego(nuevoJuego, ws);
}

function cargarPreguntasArchivo(juego){
  var raw = fs.readFileSync('preguntas.json');
  var json = JSON.parse(raw);
  juego.addPreguntas(json.preguntas);
}

function unirseJuego(jugador, idSesion, pwd, ws){
  var juego = juegos[idSesion];
  var esValida = juego.validarPassword(pwd);
  if(esValida){
    juego.addJugador(jugador, ws);
    juego.jugadores.forEach((datos, socket) => enviarInformacionJuego(juego, socket));
  }else{
    console.log("Contraseña invalida");
  }
}

var intervaloActual;
function enviarPregunta(idSesion){
  var juego = juegos[idSesion];
  var nPregunta = juego.preguntaActual;
  var json = juego.getSigPregunta();
  if(json == null){
    console.log("La pregunta fue null");
    clearInterval(intervaloActual);
    juego.finalizarJuego();
    return;
  }

  json.tipo = "pregunta";
  json.numero_pregunta = nPregunta;
  juego.jugadores.forEach((datos, socket) => socket.send(JSON.stringify(json))); 
}

function manejarMensaje(mensaje, ws){
  const json = JSON.parse(mensaje);

  switch(json.tipo){
    case "datos_inicio":
      if(json.id_sesion == ''){
        crearJuego(json.nick, json.pwd_sesion, ws);
      }else{
        unirseJuego(json.nick, json.id_sesion, json.pwd_sesion, ws);
      }
      break;
    case "iniciar_juego":
      enviarPregunta(json.id_sesion);
      intervaloActual = setInterval(() => enviarPregunta(json.id_sesion), 10000)
      break;

    case "respuesta":
      var juego = juegos[json.id_sesion];
      var esCorrecto = juego.esLaRespuestaCorrecta(json.numero_pregunta, json.respuesta);
      if(esCorrecto){
        juego.addPunto(ws);
      }

      break;
  }

}
