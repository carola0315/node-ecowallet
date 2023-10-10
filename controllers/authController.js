const Usuarios = require('../models/usuariosModelo');
const passport = require('passport');
const jwt = require('jsonwebtoken');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/dashboard/inicio',
    failureRedirect: '/ingreso',
    failureFlash: true,
    badRequestMessage: 'Usuario ó Password invalidos'
});

// revisar si el ususario esta utenticado
exports.usuarioAutenticado = async (req, res, next) => {
    
    // si el usuario esta autenticado, adelante
    if(req.isAuthenticated()) {
        const token = await jwt.sign({user: req.user}, process.env.SECRETKEYTOKEN, {
            expiresIn: '1h'
        });
        res.locals.autenticacionTokenUsuario = token;
        return next();
    }

    // sino esta autenticado
    return res.redirect('/session-close');
}

// Authorization: Bearer <token>
exports.verifyToken = async (req, res, next) => {

    const usuario = await Usuarios.findOne({ where: { id_usuario: req.user.id_usuario }});

    const bearerToken = res.locals.autenticacionTokenUsuario;

    if (typeof bearerToken !== 'undefined'){
        
        jwt.verify(bearerToken, process.env.SECRETKEYTOKEN, (error) => {

            if(error){
                return res.sendStatus(403);
            } else {
                return next();
            }
        })

    } else {

        return res.sendStatus(403);

    }

}