 

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
       this.estado = Trivia.estados.finalizado;
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

    tienePassword(){
        return this.password != "";
    }

    getInformacion(){
        var json = {"tipo" : "datos_juego", "id_sesion" : this.id, "jugadores" : this.getNickJugadores()
        , "tiempo_pregunta" : this.tiempoPregunta, "maximo_preguntas" : this.maximoPreguntas, "tiene_password" : this.tienePassword()};
  
        return json;
    }

}

module.exports = Trivia;

