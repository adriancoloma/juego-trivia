var express = require('express');
var router = express.Router();
import {DatosJSON} from './Datos';
var datos = DatosJSON.getInstance();
router.get('/', (req, res) => {   
    res.json(datos.getPreguntas());
})

module.exports = router;
