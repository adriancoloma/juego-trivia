 
let GeneradorCodigos = require('./GeneradorCodigos.js');
class Trivia{
    static estados ={
        "esperando_jugadores" : 0,
        "jugando" : 1,
        "finalizado" : 2
    };

    constructor(lider, pwd){

        this.password = pwd;
        this.lider = lider;
        this.jugadores = new Map();
        this.preguntaActual = 0;
        this.tiempoPregunta = 10;
        this.maximoPreguntas = 10;
        this.estado = Trivia.estados.esperando_jugadores;
        this.usarArchivo = true;
        this.preguntas = this.cargarPreguntas("preguntas.json");
        this.preguntasCargadas = this.preguntas;
        this.numeroPreguntasCargadas = this.preguntas.length;
        this.conteoActual = 0;
        this.codigo = GeneradorCodigos.getInstance().generarCodigo();
        console.log("codigo " + this.codigo);
    }

    set usarPreguntasGuardadas(usar){
        if(usar && !this.usarArchivo){
            this.preguntas.push(this.preguntasCargadas);
        }else if(!usar){
            this.preguntas = this.preguntas.filter(pregunta => !this.preguntasCargadas.includes(pregunta));
        }

        this.usarArchivo = usar;   
    }

    cargarPreguntas(archivo){
        let fs = require('fs');
        var todasPreguntas = JSON.parse(fs.readFileSync(archivo)).preguntas;
        if(this.usarPreguntasGuardadas){
            return todasPreguntas;
        }
        var preguntas = [];
        var numeroPreguntas = Math.floor(Math.random() * (todasPreguntas.length + 1));
        if(numeroPreguntas == 0){
            numeroPreguntas = 2;
        }
        for(var i = 0; i < numeroPreguntas; i++){
            var indice = Math.floor(Math.random() * todasPreguntas.length);
            preguntas.push(todasPreguntas[indice]);
            todasPreguntas.splice(indice, 1);
        }

        return preguntas;
    }

    addPreguntas(preguntas){
        this.preguntas = preguntas;
    }

    addPregunta(pregunta){
        this.preguntas.push(pregunta);
    }

    addJugador(jugador, ws){
        this.jugadores.set(ws, {"nick" : jugador, "puntaje" : 0, "respuestas" : []});
    }

    esLaRespuestaCorrecta(pregunta, respuesta){
       
        return this.preguntas[pregunta].respuesta == respuesta;
    }

    responder(ws, numeroPregunta, respuesta){
        var respondioBien = this.esLaRespuestaCorrecta(numeroPregunta, respuesta);
        if(respondioBien){
            this.addPunto(ws);
        }

        this.jugadores.get(ws).respuestas.push({"pregunta" : this.preguntas[numeroPregunta], "respuesta" : respuesta, "tiempo" : this.conteoActual});
    }

    getRespuestas(){
        var respuestas = [];
        this.jugadores.forEach((datos, socket) =>{
            respuestas.push({"nick" : datos.nick, "respuestas" : datos.respuestas});
        }
        )

        return respuestas;
    }

    getSigPregunta(){
        var index = this.preguntaActual;
        if(index == this.preguntas.length){
            return null;
        }

        this.preguntaActual++;
        return this.preguntas[index];
    }

    addPunto(ws){
        this.jugadores.get(ws).puntaje += this.tiempoPregunta - this.conteoActual + 1;
    }

    validarPassword(pwd){
        return pwd == this.password;
    }



    set id(id){
        this.idSesion = id;
    }

    get id(){
        return this.idSesion;
    }

    getNickJugadores(){
        var nicks = [];
        this.jugadores.forEach((datos, socket) => nicks.push(datos.nick));
        return nicks;
    }

    finalizarJuego(){
        clearInterval(this.intervaloActual);
        this.estado = Trivia.estados.finalizado;
        var json = {"tipo" : "finalizar_juego", "puntajes" : []};
        this.jugadores.forEach((datos, _) => {
            json.puntajes.push({ "nick": datos.nick, "puntaje": datos.puntaje });
        })

        json.puntajes.sort((a, b) => b.puntaje - a.puntaje);
        this.jugadores.forEach((datos, socket) => {
            json.respuestas = this.getRespuestas();
            socket.send(JSON.stringify(json));
        }
        )
    }

    esLider(ws){
        return this.jugadores.get(ws).nick == this.lider;
        
    }

    eliminarJugador(ws){
        this.jugadores.delete(ws);
    }

    tienePassword(){
        return this.password != "";
    }

    getInformacion(){
        var json = {"tipo" : "datos_juego", "id_sesion" : this.id, "jugadores" : this.getNickJugadores()
        , "tiempo_pregunta" : this.tiempoPregunta, "maximo_preguntas" : this.maximoPreguntas, "tiene_password" : this.tienePassword(),
        "estado" : this.estado, "codigo" : this.codigo};
  
        return json;
    }

    iniciarTimer(accion){
        this.intervaloActual = setInterval(
            () =>{
                console.log("conteo " + this.conteoActual);
                this.conteoActual++;
                if(this.conteoActual == this.tiempoPregunta){
                    this.conteoActual = 0;
                    accion();
                    console.log("se ejecuto accion");
                }
            }, 1000);
    }

    reiniciar(){
        this.conteoActual = 0;
        this.jugadores.forEach((datos,socket) => {
            datos.respuestas = [];
            datos.puntaje = 0;
            //console.log("Se reinicio respuestas de " + datos.nick);
        }
        )

        this.preguntaActual = 0;

    }

}

module.exports = Trivia;



