"use strict";
exports.__esModule = true;
var express = require('express');
var router = express.Router();
var Datos_1 = require("./Datos");
var datos = Datos_1.getInstance();
router.get('/preguntas/', function (req, res) {
    let preguntas = datos.getPreguntas();
    res.json({preguntas: preguntas});
});
module.exports = router;

router.get('/preguntas/:id', (req, res) => {
    let id = req.params.id;
    let pregunta = datos.getPregunta(id);
    res.json(pregunta);
    } 
);
router.delete('/preguntas/:id', (req, res) =>{
    let id = req.params.id;
    datos.eliminarPregunta(id);
    res.json({
        message: 'Pregunta eliminada'
    });
});

router.put('/preguntas/:id', (req, res) =>{
    let id = req.params.id;
    let pregunta = req.body;
    
    datos.setPregunta(pregunta);
    res.json({
        message: 'Pregunta actualizada'
    });
} );