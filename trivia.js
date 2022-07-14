class Trivia{
    
    constructor(lider, pwd){
        this.password = pwd;
        this.lider = lider;
        this.jugadores = new Map();
        this.preguntaActual = 0;
        this.tiempoPregunta = 10;
        this.maximoPreguntas = 10;
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

        this.jugadores.get(ws).respuestas.push({"pregunta" : this.preguntas[numeroPregunta], "respuesta" : respuesta});
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
        this.jugadores.get(ws).puntaje++;
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
       
        this.jugadores.forEach((_, socket) =>{
            var json = {"tipo" : "finalizar_juego", "puntajes" : []};
            this.jugadores.forEach((datos, socket2) =>{
                if(socket == socket2){
                    json["mi_puntaje"]= datos.puntaje;
                }else{
                    json.puntajes.push({"nick" : datos.nick, "puntaje" : datos.puntaje});
                }
            })

            json.respuestas = this.getRespuestas();
            socket.send(JSON.stringify(json));

        })
    }

    esLider(ws){
        return this.jugadores.get(ws).nick == this.lider;
        
    }

    eliminarJugador(ws){
        this.jugadores.delete(ws);
    }


}

module.exports = Trivia;