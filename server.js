const ws = require('ws');
const Trivia = require('./trivia.js');
const express = require('express');
const fs = require('fs');

var app = express();

app.use(express.static('public'));

const PORT = process.env.PORT
var httpServer = app.listen(PORT || 80, () => console.log("Server iniciado"));

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
    if((juego = getJuegoDelJugador(ws)) != undefined){
      if(juego.esLider(ws)){
        juego.eliminarJugador(ws);
        juego.jugadores.forEach((datos, socket) => socket.send(JSON.stringify({tipo : "error_fatal", mensaje : "El lider abandonó la sesion"})));
        juegos = juegos.filter(juegoActual => juegoActual.id != juego.id);  
        clearInterval(intervaloActual); 
        delete juego;  
        console.log('Sesion ' + juego.id + ' eliminada');
      }else{
        juego.eliminarJugador(ws);
        if(juego.estado == Trivia.estados.esperando_jugadores){
          juego.jugadores.forEach((datos, socket) => enviarInformacionJuego(juego, socket));
        }
      }

      console.log('Jugador eliminado');
    }else{
      console.log("El jugador no estaba en ningun juego");
    }

    console.log('Un cliente cerro su conexion');
  });
}

function getJuegoDelJugador(ws){
  return juegos.find(juego => {
    if(juego == undefined){
      console.log("Juego indefinido")
      return false;
    } 
    return juego.jugadores.has(ws)});
}

function enviarInformacionJuego(juego, ws){
  var json = juego.getInformacion();
  jsonParsed = JSON.stringify(json);
  ws.send(jsonParsed);
  console.log("se envio el mensaje " + jsonParsed);
}

function crearJuego(lider, pwd, ws){
  var nuevoJuego = new Trivia(lider, pwd);
  nuevoJuego.addJugador(lider, ws);
  var idSesion = juegos.push(nuevoJuego) - 1;
  nuevoJuego.id = idSesion;
  //cargarPreguntasArchivo(nuevoJuego);

  enviarInformacionJuego(nuevoJuego, ws);
}

function cargarPreguntasArchivo(juego){
  var raw = fs.readFileSync('preguntas.json');
  var json = JSON.parse(raw);
  juego.addPreguntas(json.preguntas);
}

function getJuego(idSesion){
  return juegos[idSesion];
}

function unirseJuego(jugador, idSesion, pwd, ws){
  var juego = juegos[idSesion];
  if (juego == undefined){
    ws.send(JSON.stringify({tipo : "error", mensaje : "No existe la sesion"}));
    return;
  }

  var esValida = juego.validarPassword(pwd);
  if(esValida){
    juego.addJugador(jugador, ws);
    juego.jugadores.forEach((datos, socket) => enviarInformacionJuego(juego, socket));
  }else{
    ws.send(JSON.stringify({tipo : "error", mensaje : "Password incorrecta"}));
  }
}

var intervaloActual;
function enviarPregunta(idSesion){
  var juego = juegos[idSesion];
  var nPregunta = juego.preguntaActual;
  var preguntaActual = juego.getSigPregunta();
  
  if(preguntaActual == null){
    console.log("La pregunta fue null");
    clearInterval(intervaloActual);
    juego.finalizarJuego();
    return;
  }

  var json = Object.assign({}, preguntaActual);
  delete json.respuesta;
  json.tipo = "pregunta";
  json.numero_pregunta = nPregunta;
  console.log("Pregunta enviada :" + JSON.stringify(json));
  juego.jugadores.forEach((datos, socket) => socket.send(JSON.stringify(json))); 
}

function manejarMensaje(mensaje, ws){
  const json = JSON.parse(mensaje);
  console.log("Mensaje recibido " + mensaje);

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
      var juego = getJuego(json.id_sesion);
      intervaloActual = setInterval(frame, juego.tiempoPregunta * 1000);
      function frame(){
          enviarPregunta(json.id_sesion)
      }

      juego.estado = Trivia.estados.jugando;
      break;

    case "respuesta":
      var juego = juegos[json.id_sesion];

      juego.responder(ws, json.numero_pregunta, json.respuesta);
      break;
    
    case "pregunta":
      getJuego(json.id_sesion).addPregunta(json.pregunta);
      var preguntasGuardadas = JSON.parse(fs.readFileSync('preguntas.json'));
      preguntasGuardadas.preguntas.push(json.pregunta);
      fs.writeFileSync('preguntas.json', JSON.stringify(preguntasGuardadas));
      
      console.log("Se añadio la pregunta " + json.pregunta);
      break;
    case "configurar_juego":
      var juego = getJuego(json.id_sesion);
      juego.tiempoPregunta = json.tiempo_pregunta;
      juego.maximoPreguntas = json.maximo_preguntas;
      juego.usarPreguntasGuardadas = json.usar_preguntas_guardadas;

      juego.jugadores.forEach((datos, socket) => socket.send(JSON.stringify(json)));
      break;
    case "get_sesiones":
      var informacionJuegos = [];
      juegos.forEach(juego => informacionJuegos.push(juego.getInformacion()));
      ws.send(JSON.stringify({tipo : "sesiones", sesiones : informacionJuegos}));
      break;
  }

}


