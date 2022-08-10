
import { GameManager } from "./game_manager.js";
import {addLinkJuego, preguntaToElement, mostrarListaSesiones, mostrarInfoLider, crearSelectNick, crearSelectTipoDeSala, jugadoresToTable, Renderizador} from "./render.js";
var btnCrear = document.getElementById('btnCrear');
var btnUnirse = document.getElementById('btnUnirse');
var btnOk = document.getElementById('btnOk');
var campo_nick = document.getElementById("campo_nick");
var campoId = document.getElementById("campo_idsesion");
var campoPwd = document.getElementById("campo_pwd");


var salida = document.querySelector('#salida');
var divRespuestas = document.createElement("div");

var socket;
var gm = new GameManager();


function init(){



    if(location.protocol == "http:"){
        var url = "ws://" + location.host + "/ws";
    }
    else{
        var url = "wss://" + location.host + "/ws";
    }
    
    socket = new WebSocket(url);
    
    if(location.protocol == "https:"){
        setInterval(() => {if(socket.readyState == socket.OPEN) {socket.send('{"tipo" : "ping"}'), 1000}});
    }

    window.onbeforeunload = evt =>{
        var mensaje = "Estas seguro de que quieres salir? Abandonaras la partida actual.";
        evt.returnValue = mensaje;
        return mensaje;
    }

    configurarSocket();

    btnCrear.addEventListener('click', crearJuego, false);
    btnUnirse.onclick = unirse;


    btnOk.onclick = function () {
        var form = document.getElementById("form_principal");
        var formData = new FormData(form);
        var jsonData = { "tipo": "datos_inicio" };
        formData.forEach((value, key) => jsonData[key] = value);
        if (jsonData.id_sesion == '') {
            gm.soyLider = true;
        }

        gm.infoJuego.nick = jsonData.nick;
        var json = JSON.stringify(jsonData);
        socket.send(json);
        salida.removeChild(form);
    }

    if(window.location.search != ''){
        var params = new URLSearchParams(window.location.search);
        var codigo = params.get('cod');
        btnCrear.style.display = 'none';
        btnUnirse.onclick = () =>{
            let nick = campo_nick.lastElementChild.value;
            if(nick == ''){
                alert("Introduce un nick");
                return;
            }

            gm.infoJuego.nick = nick;
            socket.send(JSON.stringify({
                "tipo" : "unirse_juego",
                "codigo" : codigo,
                "nick" : nick
            }));
        };
    }

}

init();

var render = new Renderizador(salida, divRespuestas, gm,socket);

function cambiarBotones(){
    btnCrear.style.display = 'none';
    btnUnirse.style.display = 'none';
    btnOk.style.display = 'inline';
}



function crearJuego(){
    if(campo_nick.lastElementChild.value == ""){
        return;
    }
    campo_nick.style.display = 'none';
    
    var divCampoTipoSala = document.createElement("div");
    divCampoTipoSala.id = "campo_tiposala";

    var labelTipoSala = document.createElement('label');
    labelTipoSala.textContent = "Tipo de sala: ";
    labelTipoSala.style.marginRight = "10px";
    labelTipoSala.setAttribute("for", "tipo_sala");
    labelTipoSala.style.width = "200px";
    var selectTipoSala = crearSelectTipoDeSala();
    selectTipoSala.style.display = "inline";
    divCampoTipoSala.appendChild(labelTipoSala);
    divCampoTipoSala.appendChild(selectTipoSala);

    selectTipoSala.onchange = () =>{
        if(selectTipoSala.value == "privada"){
            campos.removeChild(campoPwd);
            campos.appendChild(campoPwd);
            campoPwd.style.display = 'block';
        }else{
            campoPwd.style.display = 'none';
        }
    }
            
    var campos = document.getElementById("campos");
    campos.appendChild(labelTipoSala);
    campos.appendChild(selectTipoSala);
    //campos.appendChild(divCampoTipoSala);
    cambiarBotones();
}

function solicitarSesiones(){
    socket.send('{"tipo" : "get_sesiones"}');
}

function unirse(){
    if(campo_nick.lastElementChild.value == ""){
        return;
    }

   
    campo_nick.style.display = 'none';
    //campoId.style.display = 'block';
    //campoPwd.style.display = 'block';
    cambiarBotones();
    gm.infoJuego.estado = "seleccion_sesion";
    solicitarSesiones();
}

var id_sesion;

function iniciarJuego(){
    socket.send(JSON.stringify({"tipo" : "iniciar_juego", "id_sesion" : gm.infoJuego.id_sesion}));
}



var divPregunta = document.createElement("div");
var numPreguntasAdd = 0;

function addPregunta(){
    divConfiguracion.innerHTML = "";
    if(numPreguntasAdd >= gm.infoJuego.maximo_preguntas){
        alert("Ya no puedes agregar más preguntas");
        return;
    }
    divPregunta.innerHTML = '<div class="m-2 row"><span class=col> Pregunta:</span><input class=col type="text" name="pregunta"></div>';
    var divNumeroOpciones = document.createElement('div');
    var maxOpciones = 5, minOpciones = 2;
    divNumeroOpciones.innerHTML = '<span class=col> Número de opciones:</span> <input class=col type="number" name="numero_opciones" min="2" max="4">';
    divNumeroOpciones.classList.add("m-2", "row");
    divPregunta.appendChild(divNumeroOpciones);
    var botonOpciones = document.createElement("button");
    var numOpciones = divNumeroOpciones.getElementsByTagName("input")[0];
    var botonEnviar = document.createElement("button");
    botonEnviar.classList.add("btn", "btn-primary");
    botonEnviar.textContent = "Enviar pregunta";
    botonEnviar.onclick = () =>{

        var preguntaInput = document.querySelector('input[name="pregunta"]');
        if(preguntaInput.value == ""){
            alert("Debes escribir una pregunta");
            return;
        }

        var opcionesInput = document.querySelectorAll(".opcion");  
        var opcionCorrecta = document.querySelector('input[name="opcion_correcta"]:checked');
        if(opcionCorrecta == null){
            alert("Debes seleccionar una respuesta correcta");
            return;
        }
        var opciones = [];
        opcionesInput.forEach(opcionElement => opciones.push(opcionElement.value));
        for(const opcion of opciones){
            if(opcion == ""){
                alert("Debes llenar todas las opciones");
                return;
            }else{
                if(opciones.indexOf(opcion) != opciones.lastIndexOf(opcion)){
                    alert("No puedes repetir opciones");
                    return;
                }
            }
        }

        var preguntaObj = {"pregunta" : preguntaInput.value, "opciones" : opciones, "respuesta" : parseInt(opcionCorrecta.value)};
        var json = {"tipo" : "pregunta", "id_sesion" : gm.infoJuego.id_sesion, "pregunta" : preguntaObj};

        socket.send(JSON.stringify(json));
        divPregunta.innerHTML = '<p class="text-sucess">Pregunta añadida</p>'
        numPreguntasAdd++;
    };

    botonOpciones.textContent = "Añadir opciones";
    var divOpciones = document.createElement("div");

    botonOpciones.onclick = () =>{
        if(numOpciones.value == "" || numOpciones.valueAsNumber < minOpciones || numOpciones.valueAsNumber> maxOpciones){
            alert("Numero de opciones invalido");
            return;
        }

        divOpciones.innerHTML = "";

        for(var i = 0; i < numOpciones.valueAsNumber; i++){
            
            divOpciones.appendChild(document.createElement("br"));
            var inputOpcion = document.createElement("input");
            inputOpcion.classList.add("opcion")
            inputOpcion.type = "text";
            inputOpcion.classList.add("m-2");

            var checkOpcion = document.createElement("input");
            checkOpcion.type = "radio";
            checkOpcion.name = "opcion_correcta";
            checkOpcion.value = i;
        
            divOpciones.appendChild(inputOpcion);
            divOpciones.appendChild(checkOpcion);          
        }

        divOpciones.appendChild(document.createElement("br"));
        botonEnviar.classList.add("m-2");
        divOpciones.appendChild(botonEnviar);

        divPregunta.appendChild(divOpciones);
    };

    
    botonOpciones.classList.add("btn", "btn-primary");

    botonOpciones.classList.add("m-2");
    divPregunta.appendChild(botonOpciones);
    

    salida.appendChild(divPregunta);

}
var divConfiguracion = document.createElement("div");

function configurarJuego(){
    divPregunta.innerHTML = "";

    divConfiguracion.innerHTML = '';
    divConfiguracion.innerHTML = `<p>Maximo de preguntas a añadir: <input type="number" name="maximo_preguntas" value="${gm.infoJuego.maximo_preguntas.toString()}" min="2"></p><p>Tiempo por pregunta: <input type="number" name="tiempo_pregunta" value="${gm.infoJuego.tiempo_pregunta}" min="1"></p>`;
    var inputUsarPreguntasGuardadas = document.createElement("input");
    inputUsarPreguntasGuardadas.type = "checkbox";
    inputUsarPreguntasGuardadas.name = "usar_preguntas_guardadas";
    inputUsarPreguntasGuardadas.checked = gm.infoJuego.usar_preguntas_guardadas;
    var pUsarPreguntas = document.createElement("p");
    pUsarPreguntas.innerHTML = "Usar preguntas guardadas: ";
    pUsarPreguntas.appendChild(inputUsarPreguntasGuardadas);
    divConfiguracion.appendChild(pUsarPreguntas);
    var botonConfigurar = document.createElement("button");
    botonConfigurar.classList.add("btn", "btn-primary");
    botonConfigurar.textContent = "Guardar configuracion";

    botonConfigurar.onclick = () =>{
        var json = {"tipo" : "configurar_juego", "id_sesion" : gm.infoJuego.id_sesion, 
        "tiempo_pregunta" : document.querySelector('input[name="tiempo_pregunta"]').valueAsNumber, 
        "maximo_preguntas" : document.querySelector('input[name="maximo_preguntas"]').value,
        "usar_preguntas_guardadas" : inputUsarPreguntasGuardadas.checked};
        socket.send(JSON.stringify(json));

        divConfiguracion.innerHTML = '<p class="text-sucess">Configuracion guardada</p>';
    }
    botonConfigurar.classList.add("m-2");
    divConfiguracion.appendChild(botonConfigurar);
    salida.appendChild(divConfiguracion);
}
function getProgreso(conteo, tiempoMaximo){
    return (conteo / tiempoMaximo) * 100;
}

function handleMessage(evento){
    let mensaje = evento.data;
    //console.log("mensaje recibido " + mensaje);
    var json = JSON.parse(mensaje);
    switch(json.tipo){
        case "datos_juego":
            console.log("Se recibieron los datos del juego");
            salida.innerHTML = "";
            let divDatosJuego = document.createElement("div");
            salida.appendChild(divDatosJuego);
            let form = document.forms[0];
            if(form != undefined){
                form.remove();
            }
            var idsesion = document.createElement('h1');
            idsesion.textContent = "Id de sesion: " + json.id_sesion;
            gm.infoJuego.id_sesion = json.id_sesion;
            gm.infoJuego.tiempo_pregunta = json.tiempo_pregunta;
            gm.infoJuego.maximo_preguntas = json.maximo_preguntas;
            if(gm.soyLider)
                addLinkJuego(divDatosJuego, json.codigo);
            divDatosJuego.appendChild(idsesion);
            var tableJugadores = jugadoresToTable(json.jugadores);
            divDatosJuego.appendChild(tableJugadores);
            var divBotones = document.createElement('div');

            if(gm.soyLider){
                mostrarInfoLider(divBotones, iniciarJuego, configurarJuego);
            }else{
                var esperando = document.createElement('p');
                esperando.textContent = 'Esperando al lider...';
                esperando.classList.add("text-info");
                divDatosJuego.appendChild(esperando);
            }

            var buttonAddPregunta = document.createElement("button");
            buttonAddPregunta.classList.add("btn", "btn-primary");
            buttonAddPregunta.onclick = () =>{
                divPregunta.innerHTML = '';
                addPregunta();
            };

            buttonAddPregunta.textContent = "Añadir pregunta";
            buttonAddPregunta.classList.add("m-2");
            divBotones.appendChild(buttonAddPregunta);
            divDatosJuego.appendChild(divBotones);

            gm.infoJuego.estado = "en_espera";
            break;

        case "pregunta":
            salida.innerHTML = '';
            //var contador = gm.infoJuego.tiempo_pregunta;
            var divProgreso = document.createElement('div');
            divProgreso.classList.add("progress", "my-3");
            divProgreso.style.width = "70%";
            var divBarra = document.createElement('div');
            divBarra.classList.add("progress-bar");
            divBarra.style.width = "0%";
            divBarra.id = "barra";
            divBarra.style.animationDuration = gm.infoJuego.tiempo_pregunta + "s";
            divProgreso.appendChild(divBarra);
            salida.appendChild(divProgreso);
            var preguntaElement = preguntaToElement(json, "respuesta");
            salida.appendChild(preguntaElement);
            var botonEnviar = document.createElement('button');
            botonEnviar.textContent = "Enviar";
            botonEnviar.classList.add("btn", "btn-primary")
            botonEnviar.onclick = () => {
                var respuesta = document.querySelector('input[name="respuesta"]:checked');
                var jsonEnviar = {"tipo" : "respuesta", "numero_pregunta" : json.numero_pregunta, "id_sesion" : gm.infoJuego.id_sesion, "respuesta" : respuesta.value};
                socket.send(JSON.stringify(jsonEnviar));
                botonEnviar.style.display = "none";

                var radios = preguntaElement.querySelectorAll('input[type="radio"]');
                radios.forEach(radio => {
                    radio.disabled = true;
                }
                );

                var respuestaEnviada = document.createElement('p');
                respuestaEnviada.textContent = "Respuesta enviada";
                respuestaEnviada.classList.add("text-info");
                salida.appendChild(respuestaEnviada);
            }

            salida.appendChild(botonEnviar);
            break;
        case "finalizar_juego":
            salida.innerHTML = '<p class="text-info my-2">El juego ha finalizado</p>';
            render.mostrarResultados(json);
            var nicks = [];
            json.respuestas.forEach(respuesta => {
                nicks.push(respuesta.nick);
            });
            var select = crearSelectNick(nicks);
            select.value = gm.infoJuego.nick;
            select.onchange = () => {render.mostrarRespuestas(json.respuestas.find(respuesta => respuesta.nick == select.value).respuestas);};
            salida.appendChild(select);
            render.mostrarRespuestas(json.respuestas.find(respuesta => respuesta.nick == gm.infoJuego.nick).respuestas);
            break;
        case "configurar_juego":
            gm.infoJuego.tiempo_pregunta = json.tiempo_pregunta;
            gm.infoJuego.maximo_preguntas = json.maximo_preguntas;
            gm.infoJuego.usar_preguntas_guardadas = json.usar_preguntas_guardadas;
            break;
        case "error":
            alert(json.mensaje);
            break;
        case "error_fatal":
            salida.innerHTML = '<h1 class="text-danger">' + json.mensaje + '</h1>';
            break;
        case "sesiones":
            gm.sesiones = json.sesiones;
            if(gm.infoJuego.estado == "seleccion_sesion"){
                mostrarListaSesiones(gm.sesiones, campoPwd);
            }
            break;
        

    }
}

function configurarSocket(){
    socket.onmessage = handleMessage;
    socket.onclose = () =>{salida.innerHTML = '<h1 class="text-danger">Error al conectar al servidor</h1>'}
}


