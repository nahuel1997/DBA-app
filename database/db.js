//2 - Invocamos a MySQL y realizamos la conexion
let cuenta=1
//function handleDisconnect() {
  const mysql = require('mysql');
  const connection = mysql.createConnection({
    //Con variables de entorno
    host     : "35.212.118.170",
    user     : "uwbdqcveof6ks",
    password : "1*ozm1*d5+>)",
    database : "dbugwvnur97dg6",

    connectTimeout: 100000

})


connection.connect((error)=>{
    if (error) {
      console.error('El error de conexión es: ' + error);
      return;
    }
    console.log('¡Conectado a la Base de Datos!'+cuenta);
    cuenta++;
    var today = new Date();
    var now = today.toLocaleString();
    console.log(now);
  });
//   connection.on('error', function(err) {
//     console.log('db error 2', err);
//     if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
//       handleDisconnect();                         // lost due to either server restart, or a
//     } else {                                      // connnection idle timeout (the wait_timeout
//       throw err;                                  // server variable configures this)
//     }
//   });

module.exports = connection;
// }
 
// handleDisconnect();