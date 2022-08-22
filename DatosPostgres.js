"use strict";
exports.__esModule = true;
exports.DatosPostgres = void 0;
var pg_1 = require("pg");
var DatosPostgres = /** @class */ (function () {
    function DatosPostgres() {
        this.client = new pg_1.Client({ connectionString: process.env.DATABASE_URL });
        this.client.connect();
        this.init();
    }
    DatosPostgres.prototype.init = function () {
        this.client.query("CREATE DATABASE trivia", function (err, res) {
            if (err) {
                console.log(err);
            }
        });
        this.client.query("CREATE TABLE IF NOT EXISTS pregunta (id SERIAL PRIMARY KEY, pregunta VARCHAR(255) NOT NULL, respuesta INTEGER NOT NULL)", function (err, res) {
            if (err) {
                console.log(err);
            }
        });
        this.client.query("CREATE TABLE IF NOT EXISTS opcion (id SERIAL PRIMARY KEY, pregunta_id INTEGER NOT NULL, opcion VARCHAR(255) NOT NULL)", function (err, res) {
            if (err) {
                console.log(err);
            }
        });
    };
    DatosPostgres.prototype.getPreguntas = function () {
        this.client.query('SELECT * FROM pregunta', function (err, res) {
            if (err) {
                console.log(err);
                return [];
            }
            else {
                return res.rows;
            }
        });
        return [];
    };
    DatosPostgres.prototype.eliminarPregunta = function (id) {
        throw new Error('Method not implemented.');
    };
    DatosPostgres.prototype.addPregunta = function (pregunta) {
        var _this = this;
        this.client.query('INSERT INTO pregunta (pregunta, respuesta) VALUES ($1, $2)', [pregunta.pregunta, pregunta.respuesta], function (err, res) {
            if (err) {
                console.log(err);
            }
        });
        pregunta.opciones.forEach(function (opcion) {
            _this.client.query('INSERT INTO opcion (pregunta_id, opcion) VALUES ($1, $2)', [pregunta.id, opcion], function (err, res) {
                if (err) {
                    console.log(err);
                }
            });
        });
    };
    DatosPostgres.prototype.setPreguntas = function (preguntas) {
        throw new Error('Method not implemented.');
    };
    return DatosPostgres;
}());
exports.DatosPostgres = DatosPostgres;
