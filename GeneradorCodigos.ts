import { randomBytes } from "crypto";

class GeneradorCodigos{
    static instance = new GeneradorCodigos();
    private size : number;
    private generatedStrings : string[] = [];
    private constructor(size : number = 10){
        this.size = size;
    }

    static getInstance():GeneradorCodigos{
        if(this.instance == null){
            this.instance = new GeneradorCodigos();
        }

        return this.instance;
    }

    generarCodigo():string{
        let cadenaGenerada : string = randomBytes(this.size).toString('hex');
        while(this.generatedStrings.includes(cadenaGenerada)){
            cadenaGenerada = randomBytes(this.size).toString('hex');
        }
        return cadenaGenerada;
    }
}

module.exports = GeneradorCodigos;