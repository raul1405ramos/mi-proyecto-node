//se requiere del módulo express - frameworl node.js
const express = require('express');
const path = require('path');
//Definimos una aplicacion de tipo node.js
const app = express();
// Creamos constante para definir el número del puerto
const port = 3333; 
//MYSQL
// cargamos el módulo mysql
const mysql = require('mysql');
// creamos una conexión contra la bd personas, creada previamente
// password la que cada alumno configure
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'parking_coches'
    });
    

//Controlamos si hay error en la conexión a la bd
con.connect((err) => {
    if(err){
    console.log('Error al conectar a la BBDD');
    return;
    }
    console.log('Conexión establecida correctamente');
    }); 

app.use(express.static('public'));
app.set('view engine', 'ejs');



app.get('/estacionamiento', (req, res) => {
    try {
        con.query('SELECT * FROM estacionamiento', (err, resultados) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error al obtener los datos del estacionamiento');
                return;
            }
            
            // Renderizar la página HTML y pasar los datos como context
            if (req.xhr) {
                res.json(resultados);
            }
            else
            res.render(__dirname + '/views/index.ejs', { estacionamientos: resultados });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los datos del estacionamiento');
    }
});


    app.post('/boton', (req, res)=> {
        const planta = Math.floor(Math.random() * 2) + 1; // Genera un número aleatorio entre 1 y 2
        let numero;
        const id_coche = Math.floor(Math.random()* 20) + 1;
        try {
            if (planta === 1) {
                numero = Math.floor(Math.random()* 10) + 1;
            } else {
                numero = Math.floor(Math.random()* 10) + 11;
            }
            const id_estacionamiento = numero;
            
            const insertcompra = 'INSERT INTO compra (id_coche, id_estacionamiento) VALUES (?, ?)'; 
            const query = 'UPDATE estacionamiento SET estado = "O" WHERE planta = ? AND id = ?';

            
            con.query(insertcompra, [id_coche, id_estacionamiento], (error, results) => {
                if (error) {
                    console.error('Error al insertar compra:', error);
                    res.status(500).json({ message: "Error al insertar la compra" });
                    return;
                }
                
                console.log(`Compra insertada correctamente con id_coche: ${id_coche} y id_estacionamiento: ${id_estacionamiento}`);
                
                con.query(query, [planta, numero], (error, results) => {
                    if (error) {
                        console.error('Error al marcar la plaza de estacionamiento como ocupada:', error);
                        res.status(500).json({ message: "Error al marcar la plaza de estacionamiento como ocupada" });
                        return;
                    }
                    console.log(`Plaza de estacionamiento en la planta ${planta}, id ${numero} marcado como ocupado`);
                    res.status(200).json({ message: "Plaza de estacionamiento marcada como ocupada" });
                });
            });
        } catch(err) {
            console.error('Error al marcar la plaza de estacionamiento como ocupada:', err);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    });


    app.post('/botonfactura', (req, res) =>{
        const total_importe = 'SELECT SUM(factura) AS total_importe FROM compra;';
        con.query(total_importe, (error, results) =>{
            if (error) {
                console.error('Error al insertar compra:', error);
                res.status(500).json({ message: "Error al insertar la compra" });
                return;
            }
             
             // Si la consulta fue exitosa, el resultado estará en results[0].total_importe
            let total_gasto = results[0].total_importe;
            console.log('Total del importe total: ', total_gasto, '€');
            res.status(200).json({total_importe: total_gasto});
        });

        });

        // Configuración de tipo MIME para archivos CSS
        app.use('/css', function(req, res, next) {
        res.header('Content-Type', 'text/css');
        next();
        });

        app.get('/listarcompras', (req, res) => {
            con.query('SELECT * FROM compra', (err, resultados) => {
                if (err) {
                    console.error("Error al obtener los datos de compra:", err);
                    res.status(500).send('Error al obtener los datos de compra: ' + err.message);
                    return;
                }   
                console.log(resultados); // Imprime los resultados en la consola
                res.json(resultados);
            });
        });
        
        

    app.post('/boton1', (req, res)=> {
        const planta = Math.floor(Math.random() * 2) + 1; // Genera un número aleatorio entre 1 y 2
        let numero;
   
        try{
            if(planta === 1){
                numero = Math.floor(Math.random()* 10) + 1;
            } else {
                numero = Math.floor(Math.random()* 10) + 11;
            const id_coche = Math.floor(Math.random() * 20) + 1; 
            const query = 'UPDATE estacionamiento SET estado = "L" WHERE planta = ? AND id = ?';
            const upDateSalida = `UPDATE compra SET horaSalida = CURRENT_TIMESTAMP() WHERE id_coche = ${id_coche}`;
            con.query(query, [planta, numero], (error, results) => {
                if (error) {
                    console.error('Error al marcar la plaza de estacionamiento como ocupada:', error);
                    res.status(500).json({ message: "Error al marcar la plaza de estacionamiento como libre" });
                    return;
                }
                console.log(`Plaza de estacionamiento en la planta ${planta}, id ${numero} marcado como libre`);
            });

            con.query(upDateSalida,  (error, results) => {
                if (error) {
                    console.error('Error al insertar la fecha de salida', error);
                    res.status(500).json({ message: "Error al marcar la plaza de estacionamiento como libre" });
                    return;
                }
            });
            
        }

        } catch(err){
            console.error('Error al marcar la plaza de estacionamiento como ocupada:', err);
            res.status(200).json({ message: "Plaza de estacionamiento marcada como libre" });
            return;
                    
        }

    })

// Puerto escuchará en el valor de nuestra constante port e imprimimos traza
app.listen(port, () => { 
    console.log(`Escuchando en el puerto ${port}`);
})



