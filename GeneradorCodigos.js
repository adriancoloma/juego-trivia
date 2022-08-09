"use strict";
exports.__esModule = true;
var crypto_1 = require("crypto");
var GeneradorCodigos = /** @class */ (function () {
    function GeneradorCodigos(size) {
        if (size === void 0) { size = 10; }
        this.generatedStrings = [];
        this.size = size;
    }
    GeneradorCodigos.getInstance = function () {
        if (this.instance == null) {
            this.instance = new GeneradorCodigos();
        }
        return this.instance;
    };
    GeneradorCodigos.prototype.generarCodigo = function () {
        var cadenaGenerada = (0, crypto_1.randomBytes)(this.size).toString('hex');
        while (this.generatedStrings.includes(cadenaGenerada)) {
            cadenaGenerada = (0, crypto_1.randomBytes)(this.size).toString('hex');
        }
        return cadenaGenerada;
    };
    GeneradorCodigos.instance = new GeneradorCodigos();
    return GeneradorCodigos;
}());
module.exports = GeneradorCodigos;
