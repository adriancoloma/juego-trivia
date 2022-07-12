
var btnCrear = document.getElementById('btnCrear');
var btnUnirse = document.getElementById('btnUnirse');
var btnOk = document.getElementById('btnOk');
var campo_nick = document.getElementById("campo_nick");
var campoId = document.getElementById("campo_idsesion");
var campoPwd = document.getElementById("campo_pwd");

var soyLider = false;
var salida = document.querySelector('#salida');

let socket = new WebSocket("wss://" + window.location.host);

setInterval(() => {if(socket.readyState == socket.OPEN) {socket.send('{"tipo" : "ping"}'), 1000}});

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
    socket.send(JSON.stringify({"tipo" : "iniciar_juego", "id_sesion" : id_sesion}));
}

function mostrarPregunta(pregunta){
    var h1 = document.createElement('h1');
    h1.textContent = pregunta.pregunta;
    salida.appendChild(h1);
    var tabla = document.createElement('table');
    tabla.classList.add('table');
    pregunta.opciones.forEach((opcion, i) =>{
        var row = document.createElement('tr');
        var tdSpan = document.createElement('td');

        var opcionInput = document.createElement('input');
        tdSpan.textContent = opcion;
        tdSpan.style.width = "50%"
        opcionInput.setAttribute("type", "radio");
        opcionInput.setAttribute("name", "respuesta");
        opcionInput.setAttribute("value", i);
        
        var tdInput = document.createElement('td');
        tdInput.appendChild(opcionInput);
        row.appendChild(tdSpan);
        row.appendChild(tdInput);

        tabla.appendChild(row);
        //salida.appendChild(document.createElement('br'));
    })

    salida.appendChild(tabla);
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

function addPregunta(){
    
    divPregunta.innerHTML = 'Pregunta: <input type="text" name="pregunta"><br>Numero de opciones: ';
    var numPreguntas = document.createElement("input");
    numPreguntas.type = "number";
    numPreguntas.name = "num_preguntas";
    divPregunta.appendChild(numPreguntas);
    var botonOpciones = document.createElement("button");
    
    var botonEnviar = document.createElement("button");
    botonEnviar.classList.add("btn", "btn-primary");
    botonEnviar.textContent = "Enviar pregunta";
    botonEnviar.onclick = () =>{
        var preguntaInput = document.querySelector('input[name="pregunta"]');
        var opcionesInput = document.querySelectorAll(".opcion");  
        var opcionCorrecta = document.querySelector('input[name="opcion_correcta"]:checked');
        if(opcionCorrecta == null){
            alert("Debes seleccionar una respuesta correcta");
            return;
        }
        var opciones = [];
        opcionesInput.forEach(opcionElement => opciones.push(opcionElement.value));

        var preguntaObj = {"pregunta" : preguntaInput.value, "opciones" : opciones, "respuesta" : parseInt(opcionCorrecta.value)};
        var json = {"tipo" : "pregunta", "id_sesion" : id_sesion, "pregunta" : preguntaObj};

        socket.send(JSON.stringify(json));
        divPregunta.innerHTML = '<p class="text-sucess">Pregunta añadida</p>'
    };

    botonOpciones.textContent = "Añadir opciones";

    botonOpciones.onclick = () =>{
        for(var i = 0; i < numPreguntas.valueAsNumber; i++){
            divPregunta.appendChild(document.createElement("br"));
            var inputOpcion = document.createElement("input");
            inputOpcion.classList.add("opcion")
            inputOpcion.type = "text";
            var checkOpcion = document.createElement("input");
            checkOpcion.type = "radio";
            checkOpcion.name = "opcion_correcta";
            checkOpcion.value = i;
        
            divPregunta.appendChild(inputOpcion);
            divPregunta.appendChild(checkOpcion);          
        }

        divPregunta.appendChild(document.createElement("br"));
        botonEnviar.classList.add("m-2");
        divPregunta.appendChild(botonEnviar);
    };

    
    botonOpciones.classList.add("btn", "btn-primary");

    botonOpciones.classList.add("m-2");
    divPregunta.appendChild(botonOpciones);
    

    salida.appendChild(divPregunta);

}


function handleMessage(evento){
    mensaje = evento.data;
    //console.log("mensaje recibido " + mensaje);
    var json = JSON.parse(mensaje);
    switch(json.tipo){
        case "datos_juego":
            var idsesion = document.createElement('h1');
            idsesion.textContent = "Id de sesion: " + json.id_sesion;
            id_sesion = json.id_sesion;
            
            salida.innerHTML = '';
            salida.appendChild(idsesion);
            var tableJugadores = jugadoresToTable(json.jugadores);
            salida.appendChild(tableJugadores);
            if(soyLider){
                var botonIniciar = document.createElement('button');
                botonIniciar.classList.add("btn", "btn-primary");
                botonIniciar.onclick = iniciarJuego;
                botonIniciar.textContent = "Iniciar juego";
                salida.appendChild(botonIniciar);
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
            var contador = 10;
            var h1 = document.createElement('h1');
            h1.textContent = "Tiempo: 10";
            salida.appendChild(h1);
            setInterval(() => {contador--; h1.textContent = "Tiempo: " + contador;}, 1000);
            mostrarPregunta(json);
            var botonEnviar = document.createElement('button');
            botonEnviar.textContent = "Enviar";
            botonEnviar.classList.add("btn", "btn-primary")
            botonEnviar.onclick = () => {
                var respuesta = document.querySelector('input[name="respuesta"]:checked');
                var jsonEnviar = {"tipo" : "respuesta", "numero_pregunta" : json.numero_pregunta, "id_sesion" : id_sesion, "respuesta" : respuesta.value};
                socket.send(JSON.stringify(jsonEnviar));
                botonEnviar.style.display = "none";
            }

            salida.appendChild(botonEnviar);
            break;
        case "finalizar_juego":
            salida.innerHTML = '';
            mostrarResultados(json);
            break;
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

    var json = JSON.stringify(jsonData);
    socket.send(json);
}
