
class Renderizador{
    constructor(salida, divRespuestas, gm, ws){
        this.salida = salida;
        this.divRespuestas = divRespuestas;
        this.infoJuego = gm.infoJuego;
        this.ws = ws;
        this.gm = gm;
    }

    mostrarResultados(json){
        var divResultados = document.createElement('div');
        divResultados.classList.add("container");
        divResultados.style.marginTop = "10px";
        divResultados.style.marginBottom = "10px";
        divResultados.style.border = "1px solid black";
        divResultados.style.padding = "10px";
        divResultados.style.backgroundColor = "white";
        divResultados.style.borderRadius = "10px";
        divResultados.style.width = "50%";

        if(this.gm.soyLider){
            let botonVolverAJugar = document.createElement('button');
            botonVolverAJugar.classList.add("btn", "btn-primary");
            botonVolverAJugar.textContent = "Volver a jugar";
            botonVolverAJugar.onclick = () => {
                this.ws.send(JSON.stringify({"tipo": "volver_a_jugar", "id_sesion" : this.infoJuego.id_sesion}));
            }
    
            this.salida.appendChild(botonVolverAJugar);
        }

        var h1Resultados = document.createElement('h1');
        h1Resultados.textContent = "Resultados";
        h1Resultados.classList.add("text-primary");
        divResultados.appendChild(h1Resultados);
        var olPuntajes = document.createElement('ol');
        olPuntajes.classList.add("list-group", "list-group-numbered");
        json.puntajes.forEach(puntajeObj =>{
            var puntaje = document.createElement('li');
            puntaje.classList.add("list-group-item");
            puntaje.textContent = `${puntajeObj.nick}: ${puntajeObj.puntaje} puntos`;
            olPuntajes.appendChild(puntaje);
        });
    
        divResultados.appendChild(olPuntajes);

        this.salida.appendChild(divResultados);
        
    }

    mostrarRespuestas(respuestas){
        this.divRespuestas.innerHTML = '';
        this.divRespuestas.innerHTML = '<p>Respuestas:</p>';
        this.salida.appendChild(this.divRespuestas);
        respuestas.forEach((respuesta, i) => {            
            var divPregunta = TriviaManager.preguntaToElement(respuesta.pregunta, false);
            this.divRespuestas.appendChild(divPregunta);
            divPregunta.classList.add("border", "border-primary", "p-2");
            var pTiempo = document.createElement("p");
            pTiempo.classList.add("text-primary");
            pTiempo.textContent = "Tiempo: " + respuesta.tiempo + " s";
            divPregunta.firstChild.before(pTiempo);
            var respuestaNumero = respuesta.respuesta;
            var divOpcion = divPregunta.querySelector('div[id="'+respuestaNumero+'"]');
    
           // var divOpcion = inputRespuesta.parentElement;
            var esCorrecta = respuestaNumero == respuesta.pregunta.respuesta;
    
            var pPuntos = document.createElement("p");
            pPuntos.classList.add("text-danger");
            var puntos;
            if(esCorrecta){
                divOpcion.style.backgroundColor = "aquamarine";
                puntos = this.infoJuego.tiempo_pregunta - respuesta.tiempo + 1; 
            }
            else{
                divOpcion.style.backgroundColor = "rgb(255, 74, 71)";
                puntos = 0;
            }
    
            
            pPuntos.textContent = "Puntos: " + puntos;
            divPregunta.appendChild(pPuntos);
            
        })
    
    }
}

class TriviaManager{

    static preguntaToElement(pregunta, puedeSeleccionar = true){
        var divPregunta = document.createElement('div');
        var h1 = document.createElement('h1');
        h1.textContent = pregunta.pregunta;
        divPregunta.appendChild(h1);
        divPregunta.style.marginBottom = "10px";
        
        pregunta.opciones.forEach((opcion, i) =>{
            var divOpcion = document.createElement('div');
            divOpcion.classList.add("my-2", "mx-auto", "text-right", "border", "w-50");
            divOpcion.style.height = "50px";
            divOpcion.style.borderRadius = "10px";
            divOpcion.id = i;
            divOpcion.style.padding = "0px";
            if(puedeSeleccionar){
                divOpcion.classList.add("div-button");
                divOpcion.style.cursor = "pointer";
                divOpcion.onclick = () => {
                    divOpcion.parentElement.querySelectorAll('div[selected="true"]').forEach(div => {
                        div.classList.remove("bg-warning");
                    } );
                    divOpcion.classList.add("bg-warning");
                    divOpcion.setAttribute("selected", "true");
                    this.opcionSeleccionada = i;
                }
            }
            
            var label = document.createElement('label');
            label.classList.add("form-check-label", "float-right");
            label.textContent = opcion;
            divOpcion.appendChild(label);
            divPregunta.appendChild(divOpcion);    
        });
    
        return divPregunta;
    }    
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

function mostrarListaSesiones(sesiones, campoPwd){
    var selectActual = document.getElementById("id_sesion");
    if(selectActual != null){
        selectActual.remove();
    }
    
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

function mostrarInfoLider(salida, iniciarJuego, configurarJuego){
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

function addLinkJuego(divInfoJuego, codigo){
    var h2 = document.createElement('h2');
    h2.textContent = "Comparte este link con tus amigos";
    h2.classList.add("text-info", "mb-3");
    divInfoJuego.appendChild(h2);

    let link = window.location.origin + "/?cod=" +codigo;
    let divInputGroup = document.createElement('div');
    divInputGroup.classList.add("input-group");
    divInputGroup.classList.add("mb-3");
    let input = document.createElement('input');
    input.classList.add("form-control");
    input.type = "text";
    input.value = link;
    input.readOnly = true;
    input.style.width = "600px";
    
    let divInputGroupAppend = document.createElement('div');
    divInputGroupAppend.classList.add("input-group-append");
    let button = document.createElement('button');
    button.classList.add("btn", "btn-primary");
    button.type = "button";
    button.textContent = "Copiar";
    button.onclick = () =>{
        input.select();
        navigator.clipboard.writeText(input.value);
    }

    divInputGroup.appendChild(input);
    divInputGroupAppend.appendChild(button);
    divInputGroup.appendChild(divInputGroupAppend);

    divInfoJuego.appendChild(divInputGroup);
}

export {Renderizador, TriviaManager, addLinkJuego, mostrarListaSesiones, mostrarInfoLider, crearSelectNick, crearSelectTipoDeSala, jugadoresToTable};