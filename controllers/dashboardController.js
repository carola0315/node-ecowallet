const Usuarios = require('../models/usuariosModelo');
const Transacciones = require('../models/transaccionesModelo');
const Album = require('../models/albumModelo');
const EncuestaOne = require('../models/encuestaoneModelo');
const EncuestaTwo = require('../models/encuestatwoModelo');
const { Op, and, Sequelize } = require("sequelize");
const {body, validationResult} = require('express-validator');
const shortid = require('shortid');
const { v4: uuid_v4 } = require('uuid');
const bcrypt = require('bcrypt-nodejs');
const { succes, errors } = require('../network');

// Inicio
exports.inicio = async (req, res) => {

    const usuario = await Usuarios.findOne({ where: { email: req.user.email }});

    const transacciones = await Transacciones.findAll({
        where: {
            [Op.or]:[
                {emisor: req.user.id_usuario},
                {receptor: req.user.id_usuario}
            ]
        },
        include: [
            { 
                model: Usuarios, 
                foreignKey: 'emisor',
                as: 'userEmisor'
            },
            { 
                model: Usuarios, 
                foreignKey: 'receptor',
                as: 'userReceptor'
            }
        ],
        order: [['fecha', 'ASC']],
        limit: 10
    });

    res.render('dashboard/inicio', {
        nombrePagina : 'Inicio',
        titulo: 'Inicio',
        breadcrumb: 'Inicio',
        classActive: req.path.split('/')[2],
        usuario,
        transacciones
    })
}

exports.qr = async (req, res) => {

    const usuario = await Usuarios.findOne({ where: { id_usuario: req.user.id_usuario }});

    res.render('dashboard/qr', {
        nombrePagina : 'qr',
        titulo: 'Código QR',
        breadcrumb: 'Código QR',
        classActive: req.path.split('/')[2],
        usuario
    })
}

exports.bolsa = async (req, res) => {

    const usuario = await Usuarios.findOne({ where: { id_usuario: req.user.id_usuario }});
    const receptor = await Usuarios.findOne({ where: { pin: req.params.pin }});

    res.render('dashboard/bolsa', {
        nombrePagina : 'Transacciones Ecobits',
        titulo: 'Transacciones',
        breadcrumb: 'Transacciones',
        classActive: req.path.split('/')[2],
        usuario,
        receptor
    })
}

exports.bolsaTransferencias = async (req, res) => {

    const usuario = await Usuarios.findOne({ where: { id_usuario: req.user.id_usuario }});
    const receptor = await Usuarios.findOne({ where: { pin: req.body.pin }});
    const valor = req.body.valor;

    if (Number(usuario.saldo) < Number(valor)) return res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No puedes transferir más Ecobits de los que tienes en tú bolsa.' });

    if (!receptor) return res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Lo sentimos, no podemos encontrar a la persona a la que deseas transferir Ecobits.' });

    usuario.saldo = Number(usuario.saldo) - Number(valor);
    await usuario.save(); 
    
    receptor.saldo = Number(receptor.saldo) + Number(valor);
    await receptor.save();
    
    const concepto = usuario.perfil == 'usuario' ? 'Transferencia' : 'Ganancia Juego';

    await Transacciones.create({
        valor: Number(valor),
        evento: concepto,
        concepto: 'Carga',
        emisor: usuario.id_usuario,
        receptor: receptor.id_usuario
    })

    return res.json({ titulo: '¡Super...!', resp: 'success', descripcion: `Se transfirieron $ ${valor} Ecobits a ${receptor.nombres} con éxito.` });

}

exports.ecobits = async (req, res) => {

    const usuario = await Usuarios.findOne({ where: { id_usuario: req.user.id_usuario }});

    const transacciones = await Transacciones.findAll({
        where: {
            [Op.or]:[
                {emisor: req.user.id_usuario},
                {receptor: req.user.id_usuario}
            ]
        },
        include: [
            { 
                model: Usuarios, 
                foreignKey: 'emisor',
                as: 'userEmisor'
            },
            { 
                model: Usuarios, 
                foreignKey: 'receptor',
                as: 'userReceptor'
            }
        ],
        order: [['fecha', 'DESC']]
    });

    res.render('dashboard/ecobits', {
        nombrePagina : 'Mis Ecobits',
        titulo: 'Mis Ecobits',
        breadcrumb: 'Mis Ecobits',
        classActive: req.path.split('/')[2],
        usuario,
        transacciones
    })
}

exports.album = async (req, res) => {

    const usuario = await Usuarios.findOne({ where: { id_usuario: req.user.id_usuario }});

    const album = await Album.findAll({
        order: [['nombre', 'ASC']]
    });

    res.render('dashboard/album', {
        nombrePagina : 'Album Fauna AR',
        titulo: 'Album Fauna AR',
        breadcrumb: 'Album Fauna AR',
        classActive: req.path.split('/')[2],
        usuario,
        album
    })
}

exports.fauna = async (req, res) => {

    const usuario = await Usuarios.findOne({ where: { id_usuario: req.user.id_usuario }});
    const id_fauna = req.params.id;

    const album = await Album.findOne({
        where: {
            id_album: id_fauna
        }
    });

    if(usuario.fauna != null) {
        
        var filtro = usuario.fauna.includes(Number(id_fauna));

        if(filtro === false) {

            var animals = usuario.fauna === null ? [] : usuario.fauna;
            var count = animals.push(Number(id_fauna));
            var nuevoSaldo = Number(id_fauna) === 16 ? 5000 : 1000;
            usuario.fauna = animals;
            usuario.saldo = Number(usuario.saldo) + Number(nuevoSaldo);
            await usuario.save();
    
            await Transacciones.create({
                valor: Number(nuevoSaldo),
                evento: 'Colección albúm - '+album.nombre,
                concepto: 'Carga',
                emisor: usuario.id_usuario,
                receptor: usuario.id_usuario
            });

            var mensaje = 'Excelente hemos cargado a tu Ecowallet '+nuevoSaldo+' Ecobits por haber econtrado este animal '+album.nombre;
            var type = 'success';
            var titulo = '¡Que bien!';
            
        } else {

            var mensaje = 'Lo sentimos ya coleccionaste este animal '+album.nombre;
            var type = 'warning';
            var titulo = '¡Ooops...!';

        }

    } else {
        
        var animals = usuario.fauna === null ? [] : usuario.fauna;
        var count = animals.push(Number(id_fauna));
        var nuevoSaldo = Number(id_fauna) === 16 ? 5000 : 1000;
        usuario.fauna = animals;
        usuario.saldo = Number(usuario.saldo) + Number(nuevoSaldo);
        await usuario.save();

        await Transacciones.create({
            valor: Number(nuevoSaldo),
            evento: 'Colección albúm - '+album.nombre,
            concepto: 'Carga',
            emisor: usuario.id_usuario,
            receptor: usuario.id_usuario
        });

        var mensaje = 'Excelente hemos cargado a tu Ecowallet '+nuevoSaldo+' Ecobits por haber econtrado este animal '+album.nombre;
        var type = 'success';
        var titulo = '¡Que bien!';

    }

    res.render('dashboard/ar', {
        nombrePagina : 'Visor AR',
        titulo: 'Visor AR',
        breadcrumb: 'Visor AR',
        classActive: req.path.split('/')[2],
        usuario,
        album,
        mensaje,
        type,
        titulo
    })

}

exports.muralone = async (req, res) => {

    res.render("muralone", {
        nombrePagina: "Encuesta Mural Trasnformación Energética"
    });
}

exports.muraloneEncuesta = async (req, res) => {

    const pin = req.params.pin;

    const usuario = await Usuarios.findOne({ where: { pin: pin }});

    const encuesta = await EncuestaOne.findAll({
        order: [
            Sequelize.fn( 'RAND' ),
          ],
        limit: 5
    })

    res.render("muraloneEncuesta", {
        nombrePagina : 'Encuesta Mural Trasnformación Energética',
        titulo: 'Encuesta Mural Trasnformación Energética',
        breadcrumb: 'Encuesta Mural Trasnformación Energética',
        usuario,
        encuesta
    })
}

exports.validarEncuestaOne = async (req, res) => {

    const pregunta1 = req.body.pregunta1.respuesta;
    const idPregunta1 = req.body.pregunta1.id;

    const pregunta2 = req.body.pregunta2.respuesta;
    const idPregunta2 = req.body.pregunta2.id;

    const pregunta3 = req.body.pregunta3.respuesta;
    const idPregunta3 = req.body.pregunta3.id;

    const pregunta4 = req.body.pregunta4.respuesta;
    const idPregunta4 = req.body.pregunta4.id;

    const pregunta5 = req.body.pregunta5.respuesta;
    const idPregunta5 = req.body.pregunta5.id;

    const pin = req.body.pin;

    var ecobits = 0;

    const p1 = await EncuestaOne.findOne({ where: { id_pregunta: idPregunta1 } });
    if (p1.respuesta === pregunta1) { ecobits++; }

    const p2 = await EncuestaOne.findOne({ where: { id_pregunta: idPregunta2 } });
    if (p2.respuesta === pregunta2) { ecobits++; }

    const p3 = await EncuestaOne.findOne({ where: { id_pregunta: idPregunta3 } });
    if (p3.respuesta === pregunta3) { ecobits++; }

    const p4 = await EncuestaOne.findOne({ where: { id_pregunta: idPregunta4 } });
    if (p4.respuesta === pregunta4) { ecobits++; }

    const p5 = await EncuestaOne.findOne({ where: { id_pregunta: idPregunta5 } });
    if (p5.respuesta === pregunta5) { ecobits++; }

    const ecobitsMiles = ecobits*1000;

    const usuario = await Usuarios.findOne({ where: { pin: pin }});
    usuario.saldo = Number(usuario.saldo) + Number(ecobitsMiles);
    await usuario.save();

    await Transacciones.create({
        valor: Number(ecobitsMiles),
        evento: 'Mural Transformación energética',
        concepto: 'Carga',
        emisor: usuario.id_usuario,
        receptor: usuario.id_usuario
    });

    return res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: `Has respondido ${ecobits}/5 preguntas de forma correcta, por lo tanto hemos cargado en tu Ecowallet ${ecobitsMiles}.` });

}

exports.muraltwo = async (req, res) => {

    res.render("muraltwo", {
        nombrePagina: "Encuesta Mural ¿Como hacer una huerta casera? - Proceso del café"
    });
}

exports.muraltwoEncuesta = async (req, res) => {

    const pin = req.params.pin;

    const usuario = await Usuarios.findOne({ where: { pin: pin }});

    const encuesta = await EncuestaTwo.findAll({
        order: [
            Sequelize.fn( 'RAND' ),
          ],
        limit: 5
    })

    res.render("muraltwoEncuesta", {
        nombrePagina : 'Encuesta Mural ¿Como hacer una huerta casera? - Proceso del café',
        titulo: 'Encuesta Mural ¿Como hacer una huerta casera? - Proceso del café',
        breadcrumb: 'Encuesta Mural ¿Como hacer una huerta casera? - Proceso del café',
        usuario,
        encuesta
    })
}

exports.validarEncuestaTwo = async (req, res) => {

    const pregunta1 = req.body.pregunta1.respuesta;
    const idPregunta1 = req.body.pregunta1.id;

    const pregunta2 = req.body.pregunta2.respuesta;
    const idPregunta2 = req.body.pregunta2.id;

    const pregunta3 = req.body.pregunta3.respuesta;
    const idPregunta3 = req.body.pregunta3.id;

    const pregunta4 = req.body.pregunta4.respuesta;
    const idPregunta4 = req.body.pregunta4.id;

    const pregunta5 = req.body.pregunta5.respuesta;
    const idPregunta5 = req.body.pregunta5.id;

    const pin = req.body.pin;

    var ecobits = 0;

    const p1 = await EncuestaTwo.findOne({ where: { id_pregunta: idPregunta1 } });
    if (p1.respuesta === pregunta1) { ecobits++; }

    const p2 = await EncuestaTwo.findOne({ where: { id_pregunta: idPregunta2 } });
    if (p2.respuesta === pregunta2) { ecobits++; }

    const p3 = await EncuestaTwo.findOne({ where: { id_pregunta: idPregunta3 } });
    if (p3.respuesta === pregunta3) { ecobits++; }

    const p4 = await EncuestaTwo.findOne({ where: { id_pregunta: idPregunta4 } });
    if (p4.respuesta === pregunta4) { ecobits++; }

    const p5 = await EncuestaTwo.findOne({ where: { id_pregunta: idPregunta5 } });
    if (p5.respuesta === pregunta5) { ecobits++; }

    const ecobitsMiles = ecobits*1000;

    const usuario = await Usuarios.findOne({ where: { pin: pin }});
    usuario.saldo = Number(usuario.saldo) + Number(ecobitsMiles);
    await usuario.save();

    await Transacciones.create({
        valor: Number(ecobitsMiles),
        evento: 'Mural ¿Como hacer una huerta casera? - Proceso del café',
        concepto: 'Carga',
        emisor: usuario.id_usuario,
        receptor: usuario.id_usuario
    });

    return res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: `Has respondido ${ecobits}/5 preguntas de forma correcta, por lo tanto hemos cargado en tu Ecowallet ${ecobitsMiles}.` });

}

exports.validarUsuario = async (req, res) => {

    const pin = req.body.pin;
    const usuario = await Usuarios.findOne({ where: { pin: pin }});

    if(!usuario) {
        return res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'El PIN no es valido' });
    }

    return res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Pin Validado con Exito.' });
}

// Mi Perfil
exports.perfil =  async (req, res) => {
    const usuario = await Usuarios.findOne({ where: { email: req.user.email }});
    let telegramUsuario = usuario.telegram_link

    res.render('dashboard/mi-perfil', {
        nombrePagina : 'Mi Perfil',
        titulo: 'Mi Perfil',
        breadcrumb: 'Mi Perfil',
        classActive: req.path.split('/')[2],
        usuario,
    })
}

exports.cambiarPassword = async (req, res, next) => {

    const password = req.body.password;

    if(password === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No puede enviar un campo vacio como nueva contraseña.' });
        return;
    }
    // verificar usuario existe
    const usuario = await Usuarios.findOne({ where: { email: req.user.email }});

    // si no existe redireccionar
    if(!usuario) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible cambiar la contraseña a este usuario.' });
        return;
    }

    const newPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);

    // si existe editar perfil y redireccionar
    usuario.password = newPassword;

    await usuario.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'La contraseña ha sido actualizada con éxito.' });
    return;
}

exports.validarEditarPerfil = async (req, res, next) => {

    // Nueva validacion express validator

    const rules = [
        body('nombre').not().isEmpty().withMessage('El nombre no puede estar vacio').trim().escape(),
        body('direccion').not().isEmpty().withMessage('La dirección no puede estar vacio').trim().escape(),
        body('telefono').not().isEmpty().withMessage('El teléfono no puede estar vacio').trim().escape(),
    ];
 
    await Promise.all(rules.map(validation => validation.run(req)));

    const errores = validationResult(req);
    //si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('/dashboard/mi-perfil', {
            nombrePagina : 'Mi Perfil',
            titulo: 'Mi Perfil',
            breadcrumb: 'Mi Perfil',
            classActive: req.path.split('/')[2],
            countDist: res.locals.countDist,
            countRes: res.locals.countRes,
            countSuperdist: res.locals.countSuperdist,
            patrocinador: res.locals.patrocinadorNombre,
            telefonoPatrocinador: res.locals.patrocinadorTelefono,
            mensajes: req.flash()
        })
        return;
    }
 
    //si toda la validacion es correcta
    next();
    
}

exports.editarPerfil = async (req, res, next) => {
    // verificar usuario existe
    const usuario = await Usuarios.findOne({ where: { email: req.params.correo }});

    // si no existe redireccionar
    if(!usuario) {
        req.flash('error', 'Hubo un error al actualizar los datos de tu perfil');
        res.redirect('/dashboard/mi-perfil');
        return next();
    }

    const datos = req.body;

    // si existe editar perfil y redireccionar
    usuario.nombre = datos.nombre;
    usuario.direccion = datos.direccion;
    usuario.telefono_movil = datos.telefono;
    await usuario.save();

    req.flash('success', 'Perfil editado con éxito');
    res.render('dashboard/mi-perfil', {
        nombrePagina : 'Mi Perfil',
        titulo: 'Mi Perfil',
        breadcrumb: 'Mi Perfil',
        classActive: req.path.split('/')[2],
        usuario,
        mensajes: req.flash()
    })
    return;
}

exports.notificacionesUsuario = async (req, res) => {

    const usuario = await Usuarios.findOne({ where: { id_usuario: req.user.id_usuario }});
    
    const ecobits = await Transacciones.findAll({
        where: {
            [Op.or]:[
                {emisor: req.user.id_usuario},
                {receptor: req.user.id_usuario}
            ]
        },
        include: [
            { 
                model: Usuarios, 
                foreignKey: 'emisor',
                as: 'userEmisor'
            },
            { 
                model: Usuarios, 
                foreignKey: 'receptor',
                as: 'userReceptor'
            }
        ],
        order: [['fecha', 'DESC']],
        limit: 15
    });

    // Counts

    const countEcobits = await Transacciones.count({
        where: {
            [Op.or]:[
                {emisor: req.user.id_usuario},
                {receptor: req.user.id_usuario}
            ]
        },
    });

    res.json({
        ecobits: ecobits,
        countEcobits: countEcobits,
        usuario
    });
    return;

};
