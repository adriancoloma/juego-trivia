const ws = require('ws');
const Trivia = require('./trivia.js');
const express = require('express');
const fs = require('fs');
const Datos = require('./Datos.js');
const rest = require('./rest.js');
const bodyParser = require('body-parser');
const { DatosPostgres } = require('./DatosPostgres.js');
let datos = new DatosPostgres();

var app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/rest', rest);

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
        clearInterval(juego.intervaloActual); 
        //delete juego;  
        console.log('Sesion ' + juego.id + ' eliminada');
        clients.forEach(client => enviarSesiones(client));
      }else{
        juego.eliminarJugador(ws);
        if(juego.estado == Trivia.estados.esperando_jugadores){
          juego.jugadores.forEach((datos, socket) => enviarActualizacionJugadores(juego.getNickJugadores(), socket));
        }
      }

      console.log('Jugador eliminado');
    }else{
      console.log("El jugador no estaba en ningun juego");
    }

    console.log('Un cliente cerro su conexion');
  });
}

function getJuego(idSesion){
  return juegos.find(juego => juego.id == idSesion);
}

function getJuegoPorCodigo(codigo){
  return juegos.find(juego => juego.codigo == codigo);
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

function enviarActualizacionJugadores(jugadores, ws){
  ws.send(JSON.stringify({tipo : "actualizar_jugadores", jugadores : jugadores}));
}

var idSesionActual = 0;

function crearJuego(lider, pwd, ws){
  var nuevoJuego = new Trivia(lider, pwd);
  nuevoJuego.addJugador(lider, ws);
  var idSesion = juegos.push(nuevoJuego) - 1;
  nuevoJuego.id = idSesionActual;
  idSesionActual++;

  enviarInformacionJuego(nuevoJuego, ws);
  clients.forEach(client => enviarSesiones(client));
}


function unirseJuegoConCodigo(jugador, ws, codigo){
  unirseJuego(jugador, null, null, ws, codigo);
}
function unirseJuego(jugador, idSesion, pwd, ws, codigo = null){
  var juego;
  if(codigo == null){
    juego = getJuego(idSesion);
  }else{
    juego = getJuegoPorCodigo(codigo);
  }
  
  if (juego == undefined){
    ws.send(JSON.stringify({tipo : "error", mensaje : "No existe la sesion"}));
    return;
  }
  var esValida = juego.validarPassword(pwd);
  if(codigo != null){
    esValida = true;
  }
  if(esValida){
    juego.addJugador(jugador, ws);
    juego.jugadores.forEach((datos, socket) => {
      if(jugador != datos.nick){ //No se envia los jugadores a quien se acaba de unir
        enviarActualizacionJugadores(juego.getNickJugadores(), socket);
      }else{
        enviarInformacionJuego(juego, socket);
      }
    });
  }else{
    ws.send(JSON.stringify({tipo : "error", mensaje : "Password incorrecta"}));
  }
}

var intervaloActual;
function enviarPregunta(idSesion){
  var juego = getJuego(idSesion);
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

function enviarSesiones(ws){
  var informacionJuegos = [];
  juegos.forEach(juego => informacionJuegos.push(juego.getInformacion()));
  ws.send(JSON.stringify({tipo : "sesiones", sesiones : informacionJuegos}));
}

function iniciarJuego(idSesion){
  enviarPregunta(idSesion);
  var juego = getJuego(idSesion);
  juego.iniciarTimer(() => {enviarPregunta(idSesion)});
  juego.estado = Trivia.estados.jugando;
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
    case "unirse_juego":
      unirseJuegoConCodigo(json.nick, ws, json.codigo);
      break;
    case "iniciar_juego":
      iniciarJuego(json.id_sesion);
      break;

    case "respuesta":
      var juego = getJuego(json.id_sesion);

      juego.responder(ws, json.numero_pregunta, json.respuesta);
      break;
    
    case "pregunta":
      getJuego(json.id_sesion).addPregunta(json.pregunta);
      datos.addPregunta(json.pregunta);
      
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
      enviarSesiones(ws);
      break;
    case "volver_a_jugar":
      var juego = getJuego(json.id_sesion);
      juego.reiniciar();
      juego.jugadores.forEach((datos, socket) => enviarInformacionJuego(juego, socket));
      
  }

}


