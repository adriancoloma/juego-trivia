"use strict";
exports.__esModule = true;
exports.DatosJSON = void 0;
var fs = require("fs");
var DatosJSON = /** @class */ (function () {
    function DatosJSON(path) {
        if (path === void 0) { path = './preguntas.json'; }
        this.path = path;
        this.preguntas = this.getPreguntas();
    }
    DatosJSON.getInstance = function () {
        if (this.instance == null) {
            this.instance = new DatosJSON();
        }
        return this.instance;
    };
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
        return JSON.parse(fs.readFileSync(this.path, 'utf8')).preguntas;
    };
    DatosJSON.prototype.getPregunta = function (id) {
        return this.preguntas.find(function (pregunta) { return pregunta.id == id; });
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
module.exports = DatosJSON;
