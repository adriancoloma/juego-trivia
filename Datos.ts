import * as fs from 'fs';
import { DatosPostgres } from './DatosPostgres';

export function getManejadorDatos() : Datos{
    return new DatosPostgres();
}

export interface Pregunta{
    id: number;
    pregunta: string;
    opciones: string[];
    respuesta: number;
}

export interface Datos{
    getPreguntas(): Promise<Pregunta[]>;
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
        this.getPreguntas().then(preguntas => {
            this.preguntas = preguntas;
        } );
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

    getPreguntas(): Promise<Pregunta[]>{
        return new Promise((resolve, reject) => {
            fs.readFile(this.path, (err, data) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(JSON.parse(data.toString()).preguntas);
                }
            } );
        } );
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




