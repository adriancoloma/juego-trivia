import * as jwt from 'jsonwebtoken' ;

export class Seguridad{
    private tiempoExpiracion = 100;
    public generarToken(usuario: string, password: string): string{
        return jwt.sign({usuario: usuario, password: password}, 'secret', {expiresIn: `${this.tiempoExpiracion}s`});
    }

    public validarToken(token: string) : boolean{
        let esValido = false;
        jwt.verify(token, 'secret', (err, decoded) => {
            if(err){
                esValido = false;
            }
            else{
                esValido = true;
            }
        } );

        return esValido;
    }
}