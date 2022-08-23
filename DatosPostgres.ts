import {Datos, Pregunta} from './Datos';
import {Client} from 'pg';
import { env } from 'process';

export class DatosPostgres implements Datos{
    private client;
    
    constructor (){
        if(process.env.DATABASE_URL){
            this.client = new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: true,
            });
        }else{	
            this.client = this.client = new Client({connectionString: "postgres://wjnetxsrsbbdgx:d9a72cad67fb50f1ac6ac4ba9acd87860a465ace39125e601219b7bca084febb@ec2-3-225-110-188.compute-1.amazonaws.com:5432/d3hqt0l1r18v3o",
            ssl: { rejectUnauthorized: false }});

        }
        
        this.client.connect();
        this.init();
    }

    private init(){
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


    async getPreguntas(): Promise<Pregunta[]> {
        let preguntas : Pregunta[] = [];
        const res = await this.client.query('SELECT * FROM pregunta');
        preguntas = res.rows;
        console.log(preguntas);
        preguntas.forEach(async (pregunta) => {
            const opciones = await this.getOpciones(pregunta.id);
            pregunta.opciones = opciones;
        } );
        
        return preguntas;
    }

    private getOpciones(id: number): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.client.query('SELECT * FROM opcion WHERE pregunta_id = $1', [id], (err, res) => {
                if(err){
                    reject(err);
                }
                else{
                    let opciones : string[] = [];
                    res.rows.forEach(opcion => {
                        opciones.push(opcion.opcion);
                    } );
                    resolve(opciones);
                }
            } );
        } );
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
            this.client.query('INSERT INTO opcion (pregunta_id, opcion) VALUES (LASTVAL(), $1)', [opcion], (err, res) => {
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