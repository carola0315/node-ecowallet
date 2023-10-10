const express = require('express');
const router = express.Router();

// importar controladores
const generalController = require('../controllers/generalController');
const authController = require('../controllers/authController');
const rolController = require('../controllers/rolController');

// Controladores Usuarios por Rol
const dashboardController = require('../controllers/dashboardController');
const usuariosController = require('../controllers/usuariosController');

module.exports = function () {

    // Crear y confirmar cuenta usuario
    router.get('/registro',
        generalController.formRegistro,
    );

    router.post('/registro', generalController.validarRegistro);
    router.post('/registro', generalController.crearRegistro);

    // Ingreso
    router.get('/', generalController.formIngreso);
    router.post('/', authController.autenticarUsuario);
    router.get('/ingreso', generalController.formIngreso);
    router.post('/ingreso', authController.autenticarUsuario);
    router.post('/recuperarPassword', generalController.recuperarPasswords);

    //Murales
    router.post('/validarUsuario', dashboardController.validarUsuario);
    
    router.get('/muralone', dashboardController.muralone);
    router.post('/validarEncuestaOne', dashboardController.validarEncuestaOne);
    router.get('/muraloneEncuesta/:pin', dashboardController.muraloneEncuesta);
    
    router.get('/muraltwo', dashboardController.muraltwo);
    router.post('/validarEncuestaTwo', dashboardController.validarEncuestaTwo);
    router.get('/muraltwoEncuesta/:pin', dashboardController.muraltwoEncuesta);

    //aplicacion
    router.get('/session-close', generalController.sessionClose);

    // =====================
    //     Dashboard
    // =====================

    // Inicio
    router.get('/dashboard/inicio',
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.inicio
    );
    
    router.get('/dashboard/qr',
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.qr
    );
    
    router.get('/dashboard/bolsa/:pin',
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.bolsa
    );
    
    router.post('/dashboard/bolsa/transferir',
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.bolsaTransferencias
    );

    router.get('/dashboard/ecobits',
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.ecobits
    );
    
    router.get('/dashboard/album',
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.album
    );
    
    router.get('/dashboard/album/:id',
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.fauna
    );
    
    // Perfil
    router.get('/dashboard/mi-perfil',
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.perfil
    );
    router.post('/dashboard/mi-perfil/cambiarPassword',
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.cambiarPassword
    );

    router.post('/notificaciones/notificacionesUsuario',
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.notificacionesUsuario
    );

    // Cerrar Sesion
    router.get('/cerrar-sesion', (req, res) => {
        req.logout();
        res.redirect('/ingreso');
    });

    return router;
}
