const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const routes = require('./routes');
const moment = require('moment');
const genuuid = require('uuid');

// crear conexion ala DB
const db = require('./config/db');

// Importar modelo
require('./models/usuariosModelo');
require('./models/transaccionesModelo');
require('./models/albumModelo');
require('./models/encuestaoneModelo');
require('./models/encuestatwoModelo');

db.sync()
    .then(() => console.log('Conectado a la base de datos'))
    .catch(error => console.log(error));

// Variables de entorno
dotenv.config({
    path: path.resolve(__dirname, 'production.env')
});

// crear el servidor
const app = express();

// habilitar EJS
app.set('view engine', 'ejs');

// ubicacion vistas
app.set('views', path.join(__dirname, './views'));

// archivos estaticos
app.use(express.static('public'));

// habilitar cookie parser
app.use(cookieParser());

app.use(session({
    genid: (req) => {
        return genuuid.v4();
    },
    name: 'x-sotken',
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 3600000,
    },
    saveUninitialized: true
}));

// inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// Agregar flash messages
app.use(flash());

// Middleware's (usuario logueado, flash messages, fecha actual)
app.use(async (req, res, next) => {
    res.locals.usuario = { ...req.user } || null;
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    res.locals.fecha = fecha.toLocaleString('es-CO');
    res.locals.moment = moment;
    res.locals.UrlDomain = req.hostname;
    next();
});

// habilitar bodyparser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas de la app
app.use('/', routes());

// Error 404
app.get('*', function (req, res) {
    res.status(404).render('404', {
        nombrePagina: 'Pagina no encontrada'
    })
});

// puerto
const puerto = process.env.PORT || 8080;
const server = app.listen(puerto, () => {
    console.log(`Corriendo correctamente en el puerto - ${puerto}`);
});