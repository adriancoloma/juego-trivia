import * as fs from 'fs';
export interface Pregunta{
    id: number;
    pregunta: string;
    opciones: string[];
    respuesta: number;
}

export interface Datos{
    getPreguntas(): Pregunta[];
    eliminarPregunta(id: number): void;
    addPregunta(pregunta: Pregunta): void;
    setPreguntas(preguntas : Pregunta[]): void;
}

export class DatosJSON implements Datos{
    private preguntas : Pregunta[];
    private path : string;
    private static instance : DatosJSON;

    private constructor(path : string = './preguntas.json'){
        this.path = path;
        this.preguntas = this.getPreguntas();
    }

    private getMayorId() : number{
        let mayor = 0;
        this.preguntas.forEach(pregunta => {
            if(pregunta.id > mayor){
                mayor = pregunta.id;
            }
        } );
        return mayor;
    }

    getPreguntas(): Pregunta[]{
        return JSON.parse(fs.readFileSync(this.path, 'utf8')).preguntas;
    }

    getPregunta(id: number) : Pregunta | undefined{
        return this.preguntas.find(pregunta => pregunta.id == id);
    }

    eliminarPregunta(id: number){
        this.preguntas = this.preguntas.filter(pregunta => pregunta.id != id);
        this.setPreguntas(this.preguntas);
    }
    addPregunta(pregunta: Pregunta){
        var idActual = this.getMayorId();
        pregunta.id = idActual + 1;
        this.preguntas.push(pregunta);
        this.setPreguntas(this.preguntas);
    }

    setPregunta(pregunta:Pregunta){
        let index = this.preguntas.findIndex(p => p.id == pregunta.id);
        this.preguntas[index] = pregunta;
        this.setPreguntas(this.preguntas);
    }
    setPreguntas(preguntas : Pregunta[]){
        //his.addIds();
        fs.writeFileSync(this.path, JSON.stringify({preguntas: preguntas}));
    }

    private addIds(){
        this.preguntas.forEach((pregunta, i) => {
            pregunta.id = i;
        } );
    }
}

module.exports = DatosJSON;


