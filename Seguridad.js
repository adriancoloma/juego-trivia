"use strict";
exports.__esModule = true;
exports.Seguridad = void 0;
var jwt = require("jsonwebtoken");
var Seguridad = /** @class */ (function () {
    function Seguridad() {
        this.tiempoExpiracion = 100;
    }
    Seguridad.prototype.generarToken = function (usuario, password) {
        return jwt.sign({ usuario: usuario, password: password }, 'secret', { expiresIn: "".concat(this.tiempoExpiracion, "s") });
    };
    Seguridad.prototype.validarToken = function (token) {
        var esValido = false;
        jwt.verify(token, 'secret', function (err, decoded) {
            if (err) {
                esValido = false;
            }
            else {
                esValido = true;
            }
        });
        return esValido;
    };
    return Seguridad;
}());
exports.Seguridad = Seguridad;
