import {Datos, Pregunta} from './Datos';
import {Client} from 'pg';

export class DatosPostgres implements Datos{
    private client;
    
    constructor (){
        this.client = new Client({connectionString: process.env.DATABASE_URL});
        this.client.connect();
        this.init();
    }

    private init(){
        this.client.query("CREATE DATABASE trivia", (err, res) => {
            if(err){
                console.log(err);
            }
        }
        );

        this.client.query("CREATE TABLE IF NOT EXISTS pregunta (id SERIAL PRIMARY KEY, pregunta VARCHAR(255) NOT NULL, respuesta INTEGER NOT NULL)", (err, res) => {
            if(err){
                console.log(err);
            }
        });

        this.client.query("CREATE TABLE IF NOT EXISTS opcion (id SERIAL PRIMARY KEY, pregunta_id INTEGER NOT NULL, opcion VARCHAR(255) NOT NULL)", (err, res) => {
            if(err){
                console.log(err);
            }
        });
    }


    getPreguntas(): Pregunta[] {
        this.client.query('SELECT * FROM pregunta', (err, res) => {
            if(err){
                console.log(err);
                return [];
            }else{
                return res.rows;
            }
        } );

        return [];

    }
    eliminarPregunta(id: number): void {
        throw new Error('Method not implemented.');
    }

    addPregunta(pregunta: Pregunta): void {
        this.client.query('INSERT INTO pregunta (pregunta, respuesta) VALUES ($1, $2)', [pregunta.pregunta, pregunta.respuesta], (err, res) => {
            if(err){
                console.log(err);
            }
        } );
        pregunta.opciones.forEach(opcion => {
            this.client.query('INSERT INTO opcion (pregunta_id, opcion) VALUES ($1, $2)', [pregunta.id, opcion], (err, res) => {
                if(err){
                    console.log(err);
                }
            } );
        } );
    }
    setPreguntas(preguntas: Pregunta[]): void {
        throw new Error('Method not implemented.');
    }
   
    
}