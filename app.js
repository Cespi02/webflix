const express = require('express');
const path = require("path");
const bcryptjs = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const blacklist = require('express-jwt-blacklist');
const mysql = require("mysql")

dotenv.config();

const app = express();
const port = 3000;
const secretKey = process.env.JWT_SECRET;

let conexion = mysql.createConnection({
    host: 'localhost',
    database: "Webflix",
    user: "root",
    password: ""
});

app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/pages'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

function authenticateToken(req, res, next) {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: 'Token requerido' });
    }

    jwt.verify(token, secretKey, (err, decodedToken) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }
        
        req.user = decodedToken.user; // Asigna el usuario decodificado a req.user
        console.log("El mail es: " + req.user); // Asegúrate de que req.user contenga el email

        next();
    });
}

// Rutas

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/registrarse", (req, res) => {
    res.sendFile(path.join(__dirname + "/pages/registrarse.html"));
});

app.get("/gestion", authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname + "/pages/gestion.html"));
});

app.get("/api/clientes", authenticateToken, function(req, res) {
    conexion.query('select nombre_plan,cant_dispositivos,valor from planes', function(error, filas) {
        if (error) {
            throw error;
        } else {
            console.log("Datos enviados correctamente");
            console.log(filas);
            res.send(filas);
        }
    });
});

app.post("/suscribirPlan2500", authenticateToken, (req, res) => {
    const mail =  req.user
    console.log(mail);
    const suscribir = "INSERT INTO SUSCRIPCIONES(id_plan, id_cliente, fecha_vencimiento) values ('1', (select id_cliente from clientes where email = '"+ mail +"'), '2024-08-14')";
    conexion.query(suscribir, (error) => {
        if (error) {
            throw error;
        } else {
            console.log("Suscripción realizada");
            res.json({ message: 'Suscripción realizada' });
        }
    });
});
app.post("/suscribirPlan5000", authenticateToken, (req, res) => {
    const mail =  req.user
    console.log(mail);
    const suscribir = "INSERT INTO SUSCRIPCIONES(id_plan, id_cliente, fecha_vencimiento) values ('2', (select id_cliente from clientes where email = '"+ mail +"'), '2024-08-14')";
    conexion.query(suscribir, (error) => {
        if (error) {
            throw error;
        } else {
            console.log("Suscripción realizada");
            res.json({ message: 'Suscripción realizada' });
        }
    });
});
app.post("/suscribirPlan7000", authenticateToken, (req, res) => {
    const mail =  req.user
    console.log(mail);
    const suscribir = "INSERT INTO SUSCRIPCIONES(id_plan, id_cliente, fecha_vencimiento) values ('3', (select id_cliente from clientes where email = '"+ mail +"'), '2024-08-14')";
    conexion.query(suscribir, (error) => {
        if (error) {
            throw error;
        } else {
            console.log("Suscripción realizada");
            res.json({ message: 'Suscripción realizada' });
        }
    });
});

app.post("/cerrarSesion", authenticateToken, (req, res) => {
    res.clearCookie("jwt", { path: '/' });
    res.json({ message: 'Sesión cerrada correctamente' });
});

app.post("/validarRegistro", async function(req, res) {
    const datos = req.body;
    console.log(datos);
    let { nombre, apellido, dni, email, fechaNacimiento, contrasenia, pais } = datos;
    const salt = await bcryptjs.genSalt(1);
    const hashContra = await bcryptjs.hash(contrasenia, salt);

    const existeMail = await validarMail(email);
    const existeDni = await validarDni(dni);
    if (existeMail || existeDni) {
        res.status(400).send({ status: "Error", message: "El mail o el dni están repetidos" });
        console.log('Mail o dni repetidos');
    } else {
        let registrar = "INSERT INTO CLIENTES(nombre, apellido, dni, email, contrasenia, fechanac, pais) values (?, ?, ?, ?, ?, ?, ?)";
        conexion.query(registrar, [nombre, apellido, dni, email, hashContra, fechaNacimiento, pais], function(error) {
            if (error) {
                throw error;
            } else {
                console.log("Datos almacenados correctamente");
            }
        });
        res.redirect('/iniciosesion.html');
    }
});

app.post("/validarInicio", async function(req, res) {
    const { email, contrasenia } = req.body;
    const existeMail = await validarMail(email);
    const cuentaCorrecta = await inicioSesion(email, contrasenia);

    if (!existeMail) {
        res.status(400).send({ status: "Error", message: "El mail es incorrecto" });
        console.log('El mail es incorrecto');
    } else if (!cuentaCorrecta) {
        res.status(400).send({ status: "Error", message: "Los datos son incorrectos" });
    } else {
        const token = jwt.sign({ user: email }, secretKey, { expiresIn: process.env.JWT_EXPIRATION });
        const cookieOption = {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            path: '/'
        };
        console.log("El token es este " + token);
        res.cookie("jwt", token, cookieOption);
        res.redirect('/gestion');
        console.log("Sesión iniciada correctamente");
    }
});

app.put("/cambiarContrasenia", authenticateToken, async function(req, res) {
    const { currentPassword, newPassword } = req.body;
    const email = req.user.email;  // Asumiendo que el payload del token contiene el email del usuario
    try {
        const listaParseada = await obtenerContrasenia(email);
        
        if (!listaParseada.length) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        
        const contraseniaValida = await bcryptjs.compare(currentPassword, listaParseada[0].contrasenia);
        
        if (!contraseniaValida) {
            return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta' });
        }

        const salt = await bcryptjs.genSalt(1);
        const hashContra = await bcryptjs.hash(newPassword, salt);
        
        let actualizar = `UPDATE CLIENTES SET contrasenia='${hashContra}' WHERE email='${email}'`;
        
        conexion.query(actualizar, function(error) {
            if (error) {
                return res.status(500).json({ success: false, message: 'Error al actualizar la contraseña' });
            }
            res.json({ success: true, message: 'Contraseña actualizada correctamente' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

app.listen(port, () => {
    console.log(`Server corriendo en el puerto ${port}`);
});

// Functions

async function obtenerContrasenia(mail) {
    let query = "SELECT email, contrasenia FROM clientes WHERE email = ?";
    return new Promise((resolve, reject) => {
        conexion.query(query, [mail], function(error, lista) {
            if (error) {
                reject(error);
            } else {
                resolve(lista);
            }
        });
    });
}

async function inicioSesion(mail, contra) {
    const listaParseada = await obtenerContrasenia(mail);
    const contraseniaValida = await bcryptjs.compare(contra, listaParseada[0].contrasenia);
    return contraseniaValida;
}

async function validarMail(mailForm) {
    let query = "SELECT email FROM clientes WHERE email = ?";
    return new Promise((resolve, reject) => {
        conexion.query(query, [mailForm], function(error, lista) {
            if (error) {
                reject(error);
            } else {
                resolve(lista.length > 0);
            }
        });
    });
}

async function validarDni(dniForm) {
    let query = "SELECT dni FROM clientes WHERE dni = ?";
    return new Promise((resolve, reject) => {
        conexion.query(query, [dniForm], function(error, lista) {
            if (error) {
                reject(error);
            } else {
                console.log("Cantidad de DNIs repetidos: " + lista.length);
                resolve(lista.length > 0);
            }
        });
    });
}