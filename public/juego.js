
var btnCrear = document.getElementById('btnCrear');
var btnUnirse = document.getElementById('btnUnirse');
var btnOk = document.getElementById('btnOk');
var campo_nick = document.getElementById("campo_nick");
var campoId = document.getElementById("campo_idsesion");
var campoPwd = document.getElementById("campo_pwd");

var soyLider = false;
var salida = document.querySelector('#salida');

if(location.protocol == "http:"){
    var url = "ws://" + location.host + "/ws";
}
else{
    var url = "wss://" + location.host + "/ws";
}

let socket = new WebSocket(url);

if(location.protocol == "https:"){
    setInterval(() => {if(socket.readyState == socket.OPEN) {socket.send('{"tipo" : "ping"}'), 1000}});
}

var sesiones = [];
var infoJuego = {"id_sesion" : "", "tiempo_pregunta" : 10, "maximo_preguntas" : 10, "nick" : "", "usar_preguntas_guardadas" : true};

function cambiarBotones(){
    btnCrear.style.display = 'none';
    btnUnirse.style.display = 'none';
    btnOk.style.display = 'inline';
}

function crearSelectTipoDeSala(){
    var selectTipoSala = document.createElement('select');
    selectTipoSala.classList.add("form-select", "my-2", "border");
    selectTipoSala.name = "tipo_sala";
    var option = document.createElement('option');
    option.value = "publica";
    option.textContent = "Publica";
    selectTipoSala.id = "tipo_sala";
    selectTipoSala.appendChild(option);
    var option = document.createElement('option');
    option.value = "privada";
    option.textContent = "Privada";
    selectTipoSala.appendChild(option);
    return selectTipoSala;
}

function crearJuego(){
    if(campo_nick.lastElementChild.value == ""){
        return;
    }
    campo_nick.style.display = 'none';
    
    var labelTipoSala = document.createElement('label');
    labelTipoSala.textContent = "Tipo de sala: ";
    labelTipoSala.style.marginRight = "10px";
    labelTipoSala.setAttribute("for", "tipo_sala");
    labelTipoSala.style.width = "200px";
    var selectTipoSala = crearSelectTipoDeSala();
    selectTipoSala.style.display = "inline";

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
    cambiarBotones();
}

function mostrarListaSesiones(sesiones){
    var selectSesion = document.createElement('select');
    selectSesion.classList.add("form-select", "my-2", "mx-auto", "w-100", "border");
    selectSesion.name = "id_sesion";
    selectSesion.id = "id_sesion";
    var option = document.createElement('option');
    option.value = "";
    option.textContent = "Seleccione una sesión";
    selectSesion.appendChild(option);

    sesiones.forEach(sesion =>{
        if(sesion.estado == 0){
            var option = document.createElement('option');
            option.value = sesion.id_sesion;
            option.textContent = `Id: ${sesion.id_sesion} - Participantes: ${sesion.jugadores}`;
            selectSesion.appendChild(option);
        }
    }
    )

    selectSesion.onchange = () =>{
        if(selectSesion.value != ""){
            var sesionEscogida = sesiones.find(sesion =>{
                return sesion.id_sesion == selectSesion.value;
            });

            if(sesionEscogida.tiene_password){
                campos.removeChild(campoPwd);
                campos.appendChild(campoPwd);
                campoPwd.style.display = 'block';
            }
            
        }}

    var campos = document.getElementById("campos");
    campos.appendChild(selectSesion);
}

function unirse(){
    if(campo_nick.lastElementChild.value == ""){
        return;
    }

   
    campo_nick.style.display = 'none';
    //campoId.style.display = 'block';
    //campoPwd.style.display = 'block';
    cambiarBotones();
    mostrarListaSesiones(sesiones);
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
        divOpcion.classList.add("form-check", "my-2", "mx-auto", "text-right", "border", "w-50");
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
    divConfiguracion.innerHTML = "";
    if(numPreguntasAdd >= infoJuego.maximo_preguntas){
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
        var json = {"tipo" : "pregunta", "id_sesion" : infoJuego.id_sesion, "pregunta" : preguntaObj};

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
    divConfiguracion.innerHTML = `<p>Maximo de preguntas a añadir: <input type="number" name="maximo_preguntas" value="${infoJuego.maximo_preguntas.toString()}" min="2"></p><p>Tiempo por pregunta: <input type="number" name="tiempo_pregunta" value="${infoJuego.tiempo_pregunta}" min="1"></p>`;
    var inputUsarPreguntasGuardadas = document.createElement("input");
    inputUsarPreguntasGuardadas.type = "checkbox";
    inputUsarPreguntasGuardadas.name = "usar_preguntas_guardadas";
    inputUsarPreguntasGuardadas.checked = infoJuego.usar_preguntas_guardadas;
    var pUsarPreguntas = document.createElement("p");
    pUsarPreguntas.innerHTML = "Usar preguntas guardadas: ";
    pUsarPreguntas.appendChild(inputUsarPreguntasGuardadas);
    divConfiguracion.appendChild(pUsarPreguntas);
    var botonConfigurar = document.createElement("button");
    botonConfigurar.classList.add("btn", "btn-primary");
    botonConfigurar.textContent = "Guardar configuracion";

    botonConfigurar.onclick = () =>{
        var json = {"tipo" : "configurar_juego", "id_sesion" : infoJuego.id_sesion, 
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

function mostrarInfoLider(salida){
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

function getProgreso(conteo, tiempoMaximo){
    return (conteo / tiempoMaximo) * 100;
}

var divDatosJuego = document.getElementById("datos_juego");
function handleMessage(evento){
    mensaje = evento.data;
    //console.log("mensaje recibido " + mensaje);
    var json = JSON.parse(mensaje);
    switch(json.tipo){
        case "datos_juego":
            console.log("Se recibieron los datos del juego");
            divDatosJuego.innerHTML = '';
            var idsesion = document.createElement('h1');
            idsesion.textContent = "Id de sesion: " + json.id_sesion;
            infoJuego.id_sesion = json.id_sesion;
            infoJuego.tiempo_pregunta = json.tiempo_pregunta;
            infoJuego.maximo_preguntas = json.maximo_preguntas;
            
            divDatosJuego.appendChild(idsesion);
            var tableJugadores = jugadoresToTable(json.jugadores);
            divDatosJuego.appendChild(tableJugadores);
            var divBotones = document.createElement('div');

            if(soyLider){
                mostrarInfoLider(divBotones);
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
            break;

        case "pregunta":
            salida.innerHTML = '';
            //var contador = infoJuego.tiempo_pregunta;
            var divProgreso = document.createElement('div');
            divProgreso.classList.add("progress", "my-3");
            divProgreso.style.width = "70%";
            var divBarra = document.createElement('div');
            divBarra.classList.add("progress-bar");
            divBarra.style.width = "0%";
            divBarra.id = "barra";
            divBarra.style.animationDuration = infoJuego.tiempo_pregunta + "s";
            divProgreso.appendChild(divBarra);
            salida.appendChild(divProgreso);
            var preguntaElement = preguntaToElement(json);
            salida.appendChild(preguntaElement);
            var botonEnviar = document.createElement('button');
            botonEnviar.textContent = "Enviar";
            botonEnviar.classList.add("btn", "btn-primary")
            botonEnviar.onclick = () => {
                var respuesta = document.querySelector('input[name="respuesta"]:checked');
                var jsonEnviar = {"tipo" : "respuesta", "numero_pregunta" : json.numero_pregunta, "id_sesion" : infoJuego.id_sesion, "respuesta" : respuesta.value};
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
            salida.innerHTML = '<p class="text-info">El juego ha finalizado</p>';
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
            infoJuego.usar_preguntas_guardadas = json.usar_preguntas_guardadas;
            break;
        case "error":
            alert(json.mensaje);
            break;
        case "error_fatal":
            salida.innerHTML = '<h1 class="text-danger">' + json.mensaje + '</h1>';
            break;
        case "sesiones":
            sesiones = json.sesiones;
            break;
    }
}

function configurarSocket(){
    socket.onopen = () =>{socket.send('{"tipo" : "get_sesiones"}');}
    socket.onmessage = handleMessage;
    socket.onclose = () =>{salida.innerHTML = '<h1 class="text-danger">Error al conectar al servidor</h1>'}
}

configurarSocket();

btnCrear.addEventListener('click', crearJuego, false);
btnUnirse.addEventListener('click', unirse, false);


btnOk.onclick = function(){
    var form = document.getElementById("form_principal");
    var formData = new FormData(form);
    var jsonData = {"tipo" : "datos_inicio"};
    formData.forEach((value, key) => jsonData[key] = value);
    if(jsonData.id_sesion == ''){
        soyLider = true;
    }

    infoJuego.nick = jsonData.nick;
    var json = JSON.stringify(jsonData);
    socket.send(json);
    salida.removeChild(form);
}


