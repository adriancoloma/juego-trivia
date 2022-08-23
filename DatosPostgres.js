"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.DatosPostgres = void 0;
var pg_1 = require("pg");
var DatosPostgres = /** @class */ (function () {
    function DatosPostgres() {
        if (process.env.DATABASE_URL) {
            this.client = new pg_1.Client({
                connectionString: process.env.DATABASE_URL,
                ssl: true
            });
        }
        else {
            this.client = this.client = new pg_1.Client({ connectionString: "postgres://wjnetxsrsbbdgx:d9a72cad67fb50f1ac6ac4ba9acd87860a465ace39125e601219b7bca084febb@ec2-3-225-110-188.compute-1.amazonaws.com:5432/d3hqt0l1r18v3o",
                ssl: { rejectUnauthorized: false } });
        }
        this.client.connect();
        this.init();
    }
    DatosPostgres.prototype.init = function () {
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
        return __awaiter(this, void 0, void 0, function () {
            var preguntas, res;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        preguntas = [];
                        return [4 /*yield*/, this.client.query('SELECT * FROM pregunta')];
                    case 1:
                        res = _a.sent();
                        preguntas = res.rows;
                        console.log(preguntas);
                        preguntas.forEach(function (pregunta) { return __awaiter(_this, void 0, void 0, function () {
                            var opciones;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.getOpciones(pregunta.id)];
                                    case 1:
                                        opciones = _a.sent();
                                        pregunta.opciones = opciones;
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/, preguntas];
                }
            });
        });
    };
    DatosPostgres.prototype.getOpciones = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.query('SELECT * FROM opcion WHERE pregunta_id = $1', [id], function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    var opciones_1 = [];
                    res.rows.forEach(function (opcion) {
                        opciones_1.push(opcion.opcion);
                    });
                    resolve(opciones_1);
                }
            });
        });
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
            _this.client.query('INSERT INTO opcion (pregunta_id, opcion) VALUES (LASTVAL(), $1)', [opcion], function (err, res) {
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
