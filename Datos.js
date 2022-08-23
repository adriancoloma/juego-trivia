"use strict";
exports.__esModule = true;
exports.DatosJSON = exports.getManejadorDatos = void 0;
var fs = require("fs");
var DatosPostgres_1 = require("./DatosPostgres");
function getManejadorDatos() {
    return new DatosPostgres_1.DatosPostgres();
}
exports.getManejadorDatos = getManejadorDatos;
var DatosJSON = /** @class */ (function () {
    function DatosJSON(path) {
        if (path === void 0) { path = './preguntas.json'; }
        var _this = this;
        this.path = path;
        this.getPreguntas().then(function (preguntas) {
            _this.preguntas = preguntas;
        });
    }
    DatosJSON.prototype.getMayorId = function () {
        var mayor = 0;
        this.preguntas.forEach(function (pregunta) {
            if (pregunta.id > mayor) {
                mayor = pregunta.id;
            }
        });
        return mayor;
    };
    DatosJSON.prototype.getPreguntas = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fs.readFile(_this.path, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(JSON.parse(data.toString()).preguntas);
                }
            });
        });
    };
    DatosJSON.prototype.getPregunta = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getPreguntas().then(function (preguntas) {
                var pregunta = preguntas.find(function (p) { return p.id == id; });
                if (pregunta == undefined) {
                    reject("No existe la pregunta");
                }
                else {
                    resolve(pregunta);
                }
            });
        });
    };
    DatosJSON.prototype.eliminarPregunta = function (id) {
        this.preguntas = this.preguntas.filter(function (pregunta) { return pregunta.id != id; });
        this.setPreguntas(this.preguntas);
    };
    DatosJSON.prototype.addPregunta = function (pregunta) {
        var idActual = this.getMayorId();
        pregunta.id = idActual + 1;
        this.preguntas.push(pregunta);
        this.setPreguntas(this.preguntas);
    };
    DatosJSON.prototype.setPregunta = function (pregunta) {
        var index = this.preguntas.findIndex(function (p) { return p.id == pregunta.id; });
        this.preguntas[index] = pregunta;
        this.setPreguntas(this.preguntas);
    };
    DatosJSON.prototype.setPreguntas = function (preguntas) {
        //his.addIds();
        fs.writeFileSync(this.path, JSON.stringify({ preguntas: preguntas }));
    };
    DatosJSON.prototype.addIds = function () {
        this.preguntas.forEach(function (pregunta, i) {
            pregunta.id = i;
        });
    };
    return DatosJSON;
}());
exports.DatosJSON = DatosJSON;
