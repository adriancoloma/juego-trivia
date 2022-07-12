class Trivia{
    
    constructor(lider, pwd){
        this.password = pwd;
        this.lider = lider;
        this.jugadores = new Map();
        this.preguntaActual = 0;
    }

    addPreguntas(preguntas){
        this.preguntas = preguntas;
    }

    addPregunta(pregunta){
        this.preguntas.push(pregunta);
    }

    addJugador(jugador, ws){
        this.jugadores.set(ws, {"nick" : jugador, "puntaje" : 0});
    }

    esLaRespuestaCorrecta(pregunta, respuesta){
       
        return this.preguntas[pregunta].respuesta == respuesta;
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

    esLider(jugador){
        return this.lider == jugador;
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

            socket.send(JSON.stringify(json));


        })
    }

    esLider(ws){
        return this.jugadores.get(ws).nick == this.lider;
        
    }


}

module.exports = Trivia;