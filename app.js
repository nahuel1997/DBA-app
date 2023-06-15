let recorredor="";
// 1 - Invocamos a Express
const express = require('express');
const app = express();
const cors = require("cors");
app.use(cors());
var whitelist = ['http://localhost:3333']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}



//2 - Para poder capturar los datos del formulario (sin urlencoded nos devuelve "undefined")
app.use(express.urlencoded({extended:false}));
app.use(express.json());//además le decimos a express que vamos a usar json

//3- Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env'});

//4 -seteamos el directorio de assets
app.use('/resources',express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//5 - Establecemos el motor de plantillas
app.set('view engine','ejs');

//6 -Invocamos a bcrypt
const bcrypt = require('bcryptjs');

//7- variables de session
const session = require('express-session');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));


// 8 - Invocamos a la conexion de la DB
const connection = require('./database/db');

//9 - establecemos las rutas
	app.get('/login',(req, res)=>{
		res.render('login');
	})

	app.get('/register',(req, res)=>{
		res.render('register');
	})
	app.get('/test',(req, res)=>{
		res.render('test');
	})


//10 - Método para el registro
app.post('/consultor', async (req, res)=>{
	const user = req.body.user;
	const name = req.body.name;
    const rol = req.body.rol;
	const pass = req.body.pass;
	let passwordHash = await bcrypt.hash(pass, 8);
    connection.query('INSERT INTO users SET ?',{user:user, name:name, rol:rol, pass:passwordHash}, async (error, results)=>{
        if(error){
            console.log(error);
        }else{            
			res.render('register', {
				alert: true,
				alertTitle: "Registration",
				alertMessage: "¡Successful Registration!",
				alertIcon:'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: ''
			});
            //res.redirect('/');         
        }
	});
})
app.post('/borrar', async (req, res)=>{
	let id_tabla=req.body.idTabla;
	console.log(id_tabla);
	connection.query('DELETE FROM `tbl.hora.consultores` WHERE `id_horas`=?', [ id_tabla ], async (error1, resultado1, fields)=> {
		if(error1){
			throw error1;}
		else{
		console.log(id_tabla);
		res.render('consultor', {
			ruta: '/consultor'
		});
		}
	});
})
app.post('/editar', async (req, res)=>{
	let id_tabla=req.body.idTabla2;
	let fechaTabla= req.body.fechaTabla2;
	let horaTabla1= req.body.horaTabla1;
	let horaTabla2= req.body.horaTabla2;
	let horastabla= req.body.horastabla;
	let detalletabla= req.body.detalletabla;
	let consultorTabla= req.body.consultorTabla;
	console.log(id_tabla+" "+fechaTabla+" "+horaTabla1+" "+horaTabla2+" "+horastabla+" "+detalletabla+" "+consultorTabla);
	connection.query('UPDATE `tbl.hora.consultores` SET ? WHERE `id_horas`= '+id_tabla, {fecha:req.body.fechaTabla2 , hora_inicio:req.body.horaTabla1, hora_fin:req.body.horaTabla2, horas:req.body.horastabla, detalle:req.body.detalletabla}, async (error1, resultado1, fields)=> {
	 	if(error1){
	 		throw error1;}
	 	else{
	 	res.render('consultor2', {
	 		ruta: '/consultor2'
	 	});
	 	}
	 });
})
app.post('/guardar', async (req, res)=>{
	const seleccionado1=req.body.seleccionado; 
	recorredor =seleccionado1;
	
	connection.query('SELECT `id_usuario` FROM `tbl.usuarios`where `usuario`=?', [ req.session.name ], async (error1, resultado1, fields)=> {
		if(error1){
			throw error1;}
			connection.query('SELECT `id_empresas` FROM `tbl.empresas` WHERE `nombre_empresa`=?', [ seleccionado1], async (error2, resultado3, fields)=> {
				if(error2){
					throw error2;}
		connection.query('SELECT `id_consultor` FROM `tbl.consultores` WHERE `id_usuario`=?', [ resultado1[0].id_usuario ], async (error3, resultado2, fields)=> {
			if(error3){
				throw error3;}
						connection.query('INSERT INTO `tbl.hora.consultores`set ?',{id_consultor:resultado2[0].id_consultor,id_empresas:resultado3[0].id_empresas,fecha:req.body.caja06, hora_inicio:req.body.caja04, hora_fin:req.body.caja03, horas:req.body.caja02, detalle:req.body.caja01}, async (error, results)=>{
							if(error){
									console.log(error);
								}else{ 
									console.log("carga excitosa!!");
								}
						});					
				res.render('consultor', {
					ruta: '/consultor'
				});
			});		
			});
		});

});
app.post('/redirigir', async (req, res)=>{
	const seleccionado2=req.body.seleccionado2;
	req.session.text =seleccionado2;
	res.render('consultor2', {
		ruta: '/consultor2',
		text: seleccionado2
	});
});
app.post('/redirigir2', async (req, res)=>{
	res.render('consultor', {
		ruta: '/consultor'
	});
});
//query
let empresa=""; 
let query='SELECT  id_horas,(date_format(fecha, "%d-%m-%Y")) as fecha ,`hora_inicio`,`hora_fin`,`horas`,`detalle`,concat(`tbl.consultores`.`nombre_consultor`," ", `tbl.consultores`.`apellido_consultor`)as consultor FROM `tbl.hora.consultores` join `tbl.consultores` on `tbl.hora.consultores`.`id_consultor`=`tbl.consultores`.`id_consultor` where id_empresas= ? and year(`fecha`)>2000 ORDER BY year(`fecha`) DESC, month(`fecha`) DESC ,day(`fecha`) DESC';
let query2='SELECT id_horas,(date_format(fecha, "%d-%m-%Y")) as fecha ,`hora_inicio`,`hora_fin`,`horas`,`detalle`,concat(`tbl.consultores`.`nombre_consultor`," ",`tbl.consultores`.`apellido_consultor`)as consultor FROM `tbl.hora.consultores` join `tbl.consultores` on `tbl.hora.consultores`.`id_consultor`=`tbl.consultores`.`id_consultor` where `tbl.consultores`.id_consultor= ? and id_empresas= ? and year(`fecha`)>2000  ORDER BY year(`fecha`) DESC, month(`fecha`) DESC ,day(`fecha`) DESC';
let query3="SELECT sum(horas) as horas FROM `tbl.hora.consultores` join `tbl.empresas` on `tbl.hora.consultores`.`id_empresas`=`tbl.empresas`.`id_empresas` where  `nombre_empresa` = ? and id_consultor= ? and year(`fecha`)>2000 order BY fecha desc";

//11 - Metodo para la autenticacion
app.post('/auth', async (req, res)=> {
	const user = req.body.user;
	const pass = req.body.pass; 
	let dato1=1; 
	if (user && pass) {
		connection.query('SELECT id_usuario,usuario,contraseña,nivel , COUNT(usuario) as cantidad  FROM `tbl.usuarios` WHERE `usuario`= ? and `contraseña`=?', [user,pass ], async (error1, results, fields)=> {
			if(error1){
				throw error1;}
			if( results[0].cantidad== 0 ) {    
				res.render('', {
				                alert: true,
				                alertTitle: "Error",
				                alertMessage: "USUARIO y/o PASSWORD incorrectas",
				                alertIcon:'error',
				                showConfirmButton: true,
				                timer: false,
				                ruta: '/'    
				                });
	 		} else {
				var id_empresa1  ;
				if(results[0].nivel==1 ){
					req.session.loggedin = true;
					req.session.name = results[0].usuario;
					res.render('admin',{
						login: true,
						name: req.session.name	,
						text:"hola"		
					});
				}
				if(results[0].nivel==2 ){
					req.session.loggedin = true;
					req.session.name = results[0].usuario;
					res.render('consultor',{
						login: true,
						name: req.session.name			
					});
				}
				if(results[0].nivel==3 ){
					req.session.loggedin = true;
					req.session.name = results[0].usuario;
					res.render('cliente',{
						login: true,
						name: req.session.name,		
					});
				}
		}
	});
	}else {	
		res.send('Please enter user and Password!');
		res.end();
	}
	});			
	
	app.post('/auth2', async (req, res)=> {
		empresa = req.body.seleccionado;
		let fecha1 = req.body.fecha1;
		let fecha2 = req.body.fecha2; 
		let fecha3 = req.body.fecha3;
		let fecha4 = req.body.fecha4; 
		let fecha5 = req.body.fecha5;
		let fecha6 = req.body.fecha6; 
        let validar=0 ,mesv1=0 ,mesv2=0 ,añov1=0,añov2=0,diav1=0,diav2=0,ruta; 
		if(fecha1===""){
			fecha1="1"
			diav1=1;
            validar++;
		}if(fecha2===""){
			fecha2="1"
			mesv1=1;
			validar++;
		}if(fecha3===""){
			fecha3="1999"
			añov1=1;
            validar++;
		}if(fecha4===""){
			fecha4="31"
			diav2=1;
            validar++;
		}if(fecha5===""){
			fecha5="12"
			mesv2=1;  
            validar++;
		}if(fecha6===""){
			fecha6="2050"
			añov2=1;
            validar++;
		}
		let diaq="and day(fecha)<='"+fecha4+"' and day(fecha)>='"+fecha1+"'";
        let mesq="and month(fecha)<='"+fecha5+"' and month(fecha)>='"+fecha2+"'";
        let añoq="and year(fecha)<='"+fecha6+"' and year(fecha)>='"+fecha3+"'"; 
		if(diav1==1){
            if(diav2==1){
              diaq="and day(fecha)<='"+31+"' and day(fecha)>='"+1+"'";
              
            }if(diav2==0){
                diaq="and day(fecha)<='"+fecha4+"' and day(fecha)>='"+1+"'";
                
            }
        }
        if(diav1==0){
            if(diav2==1){
              diaq="and day(fecha)<='"+31+"' and day(fecha)>='"+fecha1+"'"; 
              
            }if(diav2==0){
                
                if(fecha1==fecha4){
                    diaq="and day(fecha)='"+fecha1+"'";
                    
                }else{
                    diaq="and day(fecha)<='"+fecha4+"' and day(fecha)>='"+fecha1+"'";
                    
                }
            }
        }
        if(mesv1==1){
            if(mesv2==1){
              mesq="and month(fecha)<='"+12+"' and month(fecha)>='"+1+"'";

            }if(mesv2==0){
                mesq="and month(fecha)<='"+fecha5+"' and month(fecha)>='"+1+"'";
  
            }
        }
        if(mesv1==0){
            if(mesv2==1){
              mesq="and month(fecha)<='"+12+"' and month(fecha)>='"+fecha2+"'"; 

            }if(mesv2==0){
                if(fecha2==fecha4){
                    mesq="and month(fecha)='"+fecha2+"'";
      
                }else{
                    mesq="and month(fecha)<='"+fecha4+"' and month(fecha)>='"+fecha2+"'";
      
                }
            }
        }
        if(añov1==1){
            if(añov2==1){
              añoq="and year(fecha)<='"+2500+"' and year(fecha)>='"+1999+"'";
              ruta=1;
            }if(añov2==0){
                añoq="and year(fecha)<='"+fecha6+"' and year(fecha)>='"+1999+"'";
                ruta=2;
            }
        }
        if(añov1==0){
            if(añov2==1){
              añoq="and year(fecha)<='"+2500+"' and year(fecha)>='"+fecha3+"'"; 
              
            }if(añov2==0){
                if(fecha3==fecha6){
                    añoq="and year(fecha)='"+fecha3+"'";
                    
                }else{
                    añoq="and year(fecha)<='"+fecha6+"' and year(fecha)>='"+fecha3+"'";
                    
                }
            }
        }
        query ="SELECT (date_format(fecha, '%d-%m-%Y')) as fecha,`hora_inicio`,`hora_fin`,`horas`,`detalle`,concat(`tbl.consultores`.`nombre_consultor`,' ',`tbl.consultores`.`apellido_consultor`)as consultor FROM `tbl.hora.consultores` join `tbl.consultores` on `tbl.hora.consultores`.`id_consultor`=`tbl.consultores`.`id_consultor` where id_empresas= ? "+añoq+" "+mesq+" "+diaq+" ORDER BY year(`fecha`) DESC, month(`fecha`) DESC ,day(`fecha`) DESC"                   
		console.log(query);
		res.render('cliente');
		});	

		app.post('/auth3', async (req, res)=> {
			empresa = req.body.seleccionado;
			let fecha1 = req.body.fecha1;
			let fecha2 = req.body.fecha2; 
			let fecha3 = req.body.fecha3;
			let fecha4 = req.body.fecha4; 
			let fecha5 = req.body.fecha5;
			let fecha6 = req.body.fecha6; 
			let validar2=0 ,mesv1=0 ,mesv2=0 ,añov1=0,añov2=0,diav1=0,diav2=0; 
			if(fecha1===""){
				fecha1="1"
				diav1=1;
				validar2++;
			}if(fecha2===""){
				fecha2="1"
				mesv1=1;
				validar2++;
			}if(fecha3===""){
				fecha3="1999"
				añov1=1;
				validar2++;
			}if(fecha4===""){
				fecha4="31"
				diav2=1;
				validar2++;
			}if(fecha5===""){
				fecha5="12"
				mesv2=1;  
				validar2++;
			}if(fecha6===""){
				fecha6="2050"
				añov2=1;
				validar2++;
			}
			let diaq="and day(fecha)<='"+fecha4+"' and day(fecha)>='"+fecha1+"'";
			let mesq="and month(fecha)<='"+fecha5+"' and month(fecha)>='"+fecha2+"'";
			let añoq="and year(fecha)<='"+fecha6+"' and year(fecha)>='"+fecha3+"'"; 
			if(diav1==1){
				if(diav2==1){
				  diaq="and day(fecha)<='"+31+"' and day(fecha)>='"+1+"'";
				  
				}if(diav2==0){
					diaq="and day(fecha)<='"+fecha4+"' and day(fecha)>='"+1+"'";
					
				}
			}
			if(diav1==0){
				if(diav2==1){
				  diaq="and day(fecha)<='"+31+"' and day(fecha)>='"+fecha1+"'"; 
				  
				}if(diav2==0){
					
					if(fecha1==fecha4){
						diaq="and day(fecha)='"+fecha1+"'";
						
					}else{
						diaq="and day(fecha)<='"+fecha4+"' and day(fecha)>='"+fecha1+"'";
						
					}
				}
			}
			if(mesv1==1){
				if(mesv2==1){
				  mesq="and month(fecha)<='"+12+"' and month(fecha)>='"+1+"'";
	
				}if(mesv2==0){
					mesq="and month(fecha)<='"+fecha5+"' and month(fecha)>='"+1+"'";
	  
				}
			}
			if(mesv1==0){
				if(mesv2==1){
				  mesq="and month(fecha)<='"+12+"' and month(fecha)>='"+fecha2+"'"; 
	
				}if(mesv2==0){
					if(fecha2==fecha4){
						mesq="and month(fecha)='"+fecha2+"'";
		  
					}else{
						mesq="and month(fecha)<='"+fecha4+"' and month(fecha)>='"+fecha2+"'";
		  
					}
				}
			}
			if(añov1==1){
				if(añov2==1){
				  añoq="and year(fecha)<='"+2500+"' and year(fecha)>='"+1999+"'";
				}if(añov2==0){
					añoq="and year(fecha)<='"+fecha6+"' and year(fecha)>='"+1999+"'";
				}
			}
			if(añov1==0){
				if(añov2==1){
				  añoq="and year(fecha)<='"+2500+"' and year(fecha)>='"+fecha3+"'"; 
				  
				}if(añov2==0){
					if(fecha3==fecha6){
						añoq="and year(fecha)='"+fecha3+"'";
						
					}if(fecha3!=fecha6){
						añoq="and year(fecha)<='"+fecha6+"' and year(fecha)>='"+fecha3+"'";
						
					}
				}
			}
			query2 ="SELECT id_horas, (date_format(fecha, '%d-%m-%Y')) as fecha,`hora_inicio`,`hora_fin`,`horas`,`detalle`,concat(`tbl.consultores`.`nombre_consultor`,' ', `tbl.consultores`.`apellido_consultor`)as consultor FROM `tbl.hora.consultores` join `tbl.consultores` on `tbl.hora.consultores`.`id_consultor`=`tbl.consultores`.`id_consultor` where `tbl.consultores`.id_consultor= ? and id_empresas= ? "+añoq+" "+mesq+" "+diaq+" ORDER BY year(`fecha`) DESC, month(`fecha`) DESC ,day(`fecha`) DESC";                
			query3="SELECT sum(horas) as horas FROM `tbl.hora.consultores` join `tbl.empresas` on `tbl.hora.consultores`.`id_empresas`=`tbl.empresas`.`id_empresas` where  `nombre_empresa` = ? and id_consultor= ? "+añoq+" "+mesq+" "+diaq+" order BY fecha desc";
			res.render('consultor2');
			});				

//12 - Método para controlar que está auth en todas las páginas
app.get('/', (req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('index',{
			login:false,
			name:'Por favor inicie sesion',			
		});				
	}
	res.end();
});

app.get('/tablaClientes',(req,res)=>{
	connection.query('SELECT `id_usuario` FROM `tbl.usuarios`where `usuario`=?', [ req.session.name ], async (error2, resultado1, fields)=> {
		if(error2){
			throw error2;}
		connection.query('SELECT `id_empresas` FROM `tbl.empresas` WHERE `id_usuario`=?', [ resultado1[0].id_usuario ], async (error3, resultado2, fields)=> {
			if(error3){
				throw error3;}
			connection.query(query,[resultado2[0].id_empresas], async (error4, results7)=> {
				if(error4){
					throw error4;
				}else{
					console.log(query);
					res.send(results7);
					res.end();
				}
		
			})	
			});
		});		
});
app.get('/tablaHoras',(req,res)=>{
	connection.query('SELECT `id_usuario` FROM `tbl.usuarios`where `usuario`=?', [ req.session.name ], async (error2, resultado1, fields)=> {
		if(error2){
			throw error2;}
		connection.query('SELECT `id_empresas` FROM `tbl.empresas` WHERE `id_usuario`=?', [ resultado1[0].id_usuario ], async (error3, resultado2, fields)=> {
			if(error3){
				throw error3;}
			connection.query("SELECT `id_contrato`,`horas_contratadas`,cast(`fecha_inicio` as char) as fecha_inicio,cast(`fecha_fin` as char) as fecha_fin FROM `tbl.contratos` where id_empresa= ? ORDER BY `id_contrato` desc LIMIT 1 OFFSET 0",[resultado2[0].id_empresas], async (error4, results9)=> {
			  	if(error4){
			  		throw error4;
			  	}else{
					res.send(results9);
					res.end();
					
			  	}		
			 	})
			});
		});		
});
app.get('/tablaHoras2',(req,res)=>{
	let seleccionado5=req.session.text;
	console.log(req.session.text);
	const prueba=req.body.seleccionado;
	connection.query('SELECT `id_usuario` FROM `tbl.usuarios`where `usuario`=?', [ req.session.name ], async (error2, resultado1, fields)=> {
		if(error2){
			throw error2;}
			connection.query('SELECT `id_empresas` FROM `tbl.empresas` WHERE `nombre_empresa`=?', [seleccionado5], async (error2, resultado3, fields)=> {
				if(error2){
					throw error2;}
		connection.query('SELECT `id_consultor` FROM `tbl.consultores` WHERE `id_usuario`=?', [ resultado1[0].id_usuario ], async (error3, resultado2, fields)=> {
			if(error3){
				throw error3;}
			connection.query(query2,[resultado2[0].id_consultor,resultado3[0].id_empresas], async (error4, results7)=> {
				if(error4){
					throw error4;
				}else{				
					res.send(results7);
					res.end();
				}
		
			})	
			});
			});
		});		
});
app.get('/horasusadas',(req,res)=>{
	connection.query('SELECT `id_usuario` FROM `tbl.usuarios`where `usuario`=?', [ req.session.name ], async (error2, resultado1, fields)=> {
		if(error2){
			throw error2;}
		connection.query('SELECT `id_empresas` FROM `tbl.empresas` WHERE `id_usuario`=?', [ resultado1[0].id_usuario ], async (error3, resultado2, fields)=> {
			if(error3){
				throw error3;}
			connection.query("SELECT `id_contrato`,`horas_contratadas`,cast(`fecha_inicio` as char) as fecha_inicio,cast(`fecha_fin` as char) as fecha_fin FROM `tbl.contratos` where id_empresa= ? ORDER BY `id_contrato` desc LIMIT 1 OFFSET 0",[resultado2[0].id_empresas], async (error4, results9)=> {
			  	if(error4){
			  		throw error4;
			  	}	
				connection.query("SELECT sum(`horas`)as horas FROM `tbl.hora.consultores` WHERE `id_empresas`= ? and `tbl.hora.consultores`.`fecha`>= ? and `tbl.hora.consultores`.`fecha`<= ?",[resultado2[0].id_empresas,results9[0].fecha_inicio,results9[0].fecha_fin], async (error4, results40)=> {
					if(error4){
						throw error4;
						}else{
						res.send(results40);
						res.end();
						
						}
					});	
			 	});
			});
		});	
});

app.get('/Total',(req,res)=>{
	let seleccionado5="Yaguar";
	connection.query('SELECT `id_usuario` FROM `tbl.usuarios`where `usuario`=?', [ req.session.name ], async (error2, resultado1, fields)=> {
		if(error2){
			throw error2;}
			connection.query('SELECT `id_consultor` FROM `tbl.consultores` WHERE `id_usuario`=?', [ resultado1[0].id_usuario ], async (error3, resultado2, fields)=> {
				if(error3){
					throw error3;}
			connection.query(query3,[seleccionado5,resultado2[0].id_consultor], async (error4, results)=> {
				if(error4){
					throw error4;
				}else{
					res.send(results);
					res.end();
				}
			});	
		});	
	});			
});


//función para limpiar la caché luego del logout
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

 //Logout
//Destruye la sesión.
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') // siempre se ejecutará después de que se destruya la sesión
	})
});


app.listen(3333, (error,req, res)=>{
	if(error){
		throw error;}
    console.log('SERVER RUNNING IN http://localhost:3333');
});
