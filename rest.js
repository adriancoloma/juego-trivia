"use strict";
exports.__esModule = true;
var express = require('express');
var router = express.Router();
var Datos_1 = require("./Datos");
var datos = Datos_1.getManejadorDatos();
var seguridad = require('./Seguridad');
var s = new seguridad.Seguridad();


function validarUsuario(usuario, password){
    return usuario == "admin" && password == "admin";
}

router.post('/login', function (req, res) {
    var usuario = req.body.usuario;
    var password = req.body.password;
    console.log("Usuario: " + usuario + " Password: " + password);
    if (validarUsuario(usuario, password)) {
        let token = s.generarToken(usuario, password);
        res.status(200);
        res.json({token: token});
    }
    else {
        res.status(401).send("No autorizado");
    }
})

router.get('/preguntas/', function (req, res) {
    //console.log(req.cookies);
    if(!s.validarToken(req.cookies.token)){
        res.status(401).send("No autorizado");
        return;
    }

    datos.getPreguntas().then(function (preguntas) {
        res.json({preguntas: preguntas});
    });
    
});
module.exports = router;

router.get('/preguntas/:id', (req, res) => {
    if(!s.validarToken(req.cookies.token)){
        res.status(401).send("No autorizado");
        return;
    }
    let id = req.params.id;
    datos.getPregunta(id).then(function (pregunta) {
        res.json(pregunta);
    });
    } 
);
router.delete('/preguntas/:id', (req, res) =>{
    if(!s.validarToken(req.cookies.token)){
        res.status(401).send("No autorizado");
        return;
    }
    let id = req.params.id;
    datos.eliminarPregunta(id);
    res.json({
        message: 'Pregunta eliminada'
    });
});

router.put('/preguntas/:id', (req, res) =>{
    if(!s.validarToken(req.cookies.token)){
        res.status(401).send("No autorizado");
        return;
    }
    let id = req.params.id;
    let pregunta = req.body;
    
    datos.setPregunta(pregunta);
    res.json({
        message: 'Pregunta actualizada'
    });
} );