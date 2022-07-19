
var btnCrear = document.getElementById('btnCrear');
var btnUnirse = document.getElementById('btnUnirse');
var btnOk = document.getElementById('btnOk');
var campo_nick = document.getElementById("campo_nick");
var campoId = document.getElementById("campo_idsesion");
var campoPwd = document.getElementById("campo_pwd");

var soyLider = false;
var salida = document.querySelector('#salida');

let socket = new WebSocket("ws://" + window.location.host);

setInterval(() => {if(socket.readyState == socket.OPEN) {socket.send('{"tipo" : "ping"}'), 1000}});

var infoJuego = {"id_sesion" : "", "tiempo_pregunta" : 10, "maximo_preguntas" : 10, "nick" : ""};

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
    campoPwd.style.display = 'block';
    cambiarBotones();
}

function unirse(){
    if(campo_nick.lastElementChild.value == ""){
        return;
    }
    campo_nick.style.display = 'none';
    campoId.style.display = 'block';
    campoPwd.style.display = 'block';
    cambiarBotones();
}

function jugadoresToTable(jugadores){
    var table = document.createElement('table');
    table.classList.add('table');
    var tr = document.createElement('tr');
    var th = document.createElement('th');
    th.textContent = "Jugadores"
    tr.appendChild(th);
    table.appendChild(tr);

    jugadores.forEach(jugador =>{
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.textContent = jugador;
        tr.appendChild(td);

        table.appendChild(tr);
    })

    return table;
}

var id_sesion;

function iniciarJuego(){
    socket.send(JSON.stringify({"tipo" : "iniciar_juego", "id_sesion" : infoJuego.id_sesion}));
}

function preguntaToElement(pregunta){
    var divPregunta = document.createElement('div');
    var h1 = document.createElement('h1');
    h1.textContent = pregunta.pregunta;
    divPregunta.appendChild(h1);
    divPregunta.style.marginBottom = "10px";
    
    pregunta.opciones.forEach((opcion, i) =>{
        var divOpcion = document.createElement('div');
        divOpcion.classList.add("form-check", "my-2", "mx-auto", "text-right", "border");
        divOpcion.style.width = "500px"
        divOpcion.style.padding = "0px";
        var input = document.createElement('input');
        input.classList.add("form-check-input");
        input.type = "radio";
        input.name = "respuesta";
        input.value = i;
        input.style.marginLeft = "10px";
        var label = document.createElement('label');
        label.classList.add("form-check-label", "float-right");
        label.textContent = opcion;
        
        divOpcion.appendChild(input);
        divOpcion.appendChild(label);
        divPregunta.appendChild(divOpcion);    
    });

    return divPregunta;
}

function mostrarResultados(json){
    var miPuntaje = document.createElement('h1');
    miPuntaje.textContent = "Mi puntaje: " + json.mi_puntaje;
    salida.appendChild(miPuntaje);
    json.puntajes.forEach(puntajeObj =>{
        var h2 = document.createElement('h2');
        h2.textContent = puntajeObj.nick + ": " + puntajeObj.puntaje;
        salida.appendChild(h2);
    });
    
}
var divPregunta = document.createElement("div");
var numPreguntasAdd = 0;

function addPregunta(){
    if(numPreguntasAdd >= infoJuego.maximo_preguntas){
        alert("Ya no puedes agregar más preguntas");
        return;
    }
    divPregunta.innerHTML = 'Pregunta: <input type="text" name="pregunta"><br>Numero de opciones: ';
    var numPreguntas = document.createElement("input");
    numPreguntas.type = "number";
    numPreguntas.name = "num_preguntas";

    var maxOpciones = 5, minOpciones = 2;

    numPreguntas.min = maxOpciones;
    numPreguntas.max = minOpciones;

    divPregunta.appendChild(numPreguntas);
    var botonOpciones = document.createElement("button");
    
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
        var json = {"tipo" : "pregunta", "id_sesion" : infoJuego.id_sesion, "pregunta" : preguntaObj};

        socket.send(JSON.stringify(json));
        divPregunta.innerHTML = '<p class="text-sucess">Pregunta añadida</p>'
        numPreguntasAdd++;
    };

    botonOpciones.textContent = "Añadir opciones";
    var divOpciones = document.createElement("div");

    botonOpciones.onclick = () =>{
        if(numPreguntas.value == "" || numPreguntas.valueAsNumber < minOpciones || numPreguntas.valueAsNumber> maxOpciones){
            alert("Numero de opciones invalido");
            return;
        }

        divOpciones.innerHTML = "";

        for(var i = 0; i < numPreguntas.valueAsNumber; i++){
            
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
    divConfiguracion.innerHTML = '';
    divConfiguracion.innerHTML = '<p>Maximo de preguntas a añadir: <input type="number" name="maximo_preguntas" min="2"></p><p>Tiempo por pregunta: <input type="number" name="tiempo_pregunta" min="1"></p>';
    var botonConfigurar = document.createElement("button");
    botonConfigurar.classList.add("btn", "btn-primary");
    botonConfigurar.textContent = "Guardar configuracion";

    botonConfigurar.onclick = () =>{
        var json = {"tipo" : "configurar_juego", "id_sesion" : infoJuego.id_sesion, 
        "tiempo_pregunta" : document.querySelector('input[name="tiempo_pregunta"]').valueAsNumber, 
        "maximo_preguntas" : document.querySelector('input[name="maximo_preguntas"]').value};
        socket.send(JSON.stringify(json));

        divConfiguracion.innerHTML = '<p class="text-sucess">Configuracion guardada</p>';
    }
    botonConfigurar.classList.add("m-2");
    divConfiguracion.appendChild(botonConfigurar);
    salida.appendChild(divConfiguracion);
}

function mostrarInfoLider(){
    var botonIniciar = document.createElement('button');
    botonIniciar.classList.add("btn", "btn-primary");
    botonIniciar.onclick = iniciarJuego;
    botonIniciar.textContent = "Iniciar juego";
    botonIniciar.classList.add("m-2");
    salida.appendChild(botonIniciar);

    var botonConfigurar = document.createElement('button');
    botonConfigurar.classList.add("btn", "btn-primary");
    botonConfigurar.textContent = "Configurar juego";
    botonConfigurar.onclick = configurarJuego;
    botonConfigurar.classList.add("m-2");
    salida.appendChild(botonConfigurar);
}

var divRespuestas = document.createElement("div");

function crearSelectNick(nicks){
    var select = document.createElement("select");
    select.classList.add("m-2");
    select.name = "nick";
    nicks.forEach(nick => {
        var option = document.createElement("option");
        option.value = nick;
        option.textContent = nick;
        select.appendChild(option);
    }
    );
    
    return select;
}


function mostrarRespuestas(respuestas){
    divRespuestas.innerHTML = '';
    divRespuestas.innerHTML = '<p>Respuestas:</p>';
    salida.appendChild(divRespuestas);
    respuestas.forEach(respuesta => {
        var divPregunta = preguntaToElement(respuesta.pregunta);
        divPregunta.classList.add("border", "border-primary", "p-2");
        divRespuestas.appendChild(divPregunta);
        var respuestaNumero = respuesta.respuesta;
        var inputRespuesta = divPregunta.querySelector('input[value="'+respuestaNumero+'"]');
        inputRespuesta.checked = true; //Marcamos la opcion correcta
        var inputsRespuesta = divPregunta.querySelectorAll('input[type="radio"]');
        inputsRespuesta.forEach(input => {
            input.disabled = true;
        }
        );
        
        var divOpcion = inputRespuesta.parentElement;
        if(respuestaNumero == respuesta.pregunta.respuesta){
            divOpcion.style.backgroundColor = "aquamarine";
        }
        else{
            divOpcion.style.backgroundColor = "rgb(255, 74, 71)";
        }

        divRespuestas.appendChild(divPregunta);
    })


    

}
function handleMessage(evento){
    mensaje = evento.data;
    //console.log("mensaje recibido " + mensaje);
    var json = JSON.parse(mensaje);
    switch(json.tipo){
        case "datos_juego":
            var idsesion = document.createElement('h1');
            idsesion.textContent = "Id de sesion: " + json.id_sesion;
            infoJuego.id_sesion = json.id_sesion;
            infoJuego.tiempo_pregunta = json.tiempo_pregunta;
            infoJuego.maximo_preguntas = json.maximo_preguntas;
            
            salida.innerHTML = '';
            salida.appendChild(idsesion);
            var tableJugadores = jugadoresToTable(json.jugadores);
            salida.appendChild(tableJugadores);
            if(soyLider){
                mostrarInfoLider();
            }else{
                var esperando = document.createElement('p');
                esperando.textContent = 'Esperando al lider...';
                esperando.classList.add("text-info");
                salida.appendChild(esperando);
            }

            var buttonAddPregunta = document.createElement("button");
            buttonAddPregunta.classList.add("btn", "btn-primary");
            buttonAddPregunta.onclick = () =>{
                divPregunta.innerHTML = '';
                addPregunta();
            };

            buttonAddPregunta.textContent = "Añadir pregunta";
            buttonAddPregunta.classList.add("m-2");
            salida.appendChild(buttonAddPregunta);
            break;

        case "pregunta":
            salida.innerHTML = '';
            var contador = infoJuego.tiempo_pregunta;
            var h1 = document.createElement('h1');
            h1.textContent = "Tiempo: " + contador;
            salida.appendChild(h1);
            setInterval(() => {contador--; h1.textContent = "Tiempo: " + contador;}, 1000);
            console.log("Se establecio el contador");
            salida.appendChild(preguntaToElement(json));
            var botonEnviar = document.createElement('button');
            botonEnviar.textContent = "Enviar";
            botonEnviar.classList.add("btn", "btn-primary")
            botonEnviar.onclick = () => {
                var respuesta = document.querySelector('input[name="respuesta"]:checked');
                var jsonEnviar = {"tipo" : "respuesta", "numero_pregunta" : json.numero_pregunta, "id_sesion" : infoJuego.id_sesion, "respuesta" : respuesta.value};
                socket.send(JSON.stringify(jsonEnviar));
                botonEnviar.style.display = "none";
            }

            salida.appendChild(botonEnviar);
            break;
        case "finalizar_juego":
            salida.innerHTML = '';
            mostrarResultados(json);
            var nicks = [];
            json.respuestas.forEach(respuesta => {
                nicks.push(respuesta.nick);
            });
            var select = crearSelectNick(nicks);
            select.value = infoJuego.nick;
            select.onchange = () => {mostrarRespuestas(json.respuestas.find(respuesta => respuesta.nick == select.value).respuestas);};
            salida.appendChild(select);
            mostrarRespuestas(json.respuestas.find(respuesta => respuesta.nick == infoJuego.nick).respuestas);

            break;
        case "configurar_juego":
            infoJuego.tiempo_pregunta = json.tiempo_pregunta;
            infoJuego.maximo_preguntas = json.maximo_preguntas;
            break;
        case "error":
            alert(json.mensaje);
        case "error_fatal":
            salida.innerHTML = '<h1 class="text-danger">' + json.mensaje + '</h1>';
    }
}


socket.onmessage = handleMessage;
socket.onclose = () =>{salida.innerHTML = '<h1 class="text-danger">Error al conectar al servidor</h1>'}

btnCrear.addEventListener('click', crearJuego, false);
btnUnirse.addEventListener('click', unirse, false);

var form = document.getElementById("btnOk");



form.onclick = function(){
    var formData = new FormData(document.getElementById("form_principal"));
    var jsonData = {"tipo" : "datos_inicio"};
    formData.forEach((value, key) => jsonData[key] = value);
    if(jsonData.id_sesion == ''){
        soyLider = true;
    }

    infoJuego.nick = jsonData.nick;
    var json = JSON.stringify(jsonData);
    socket.send(json);
}
