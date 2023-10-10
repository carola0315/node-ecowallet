const Usuarios = require("../models/usuariosModelo");
const Transacciones = require("../models/transaccionesModelo");
const { Op } = require("sequelize");
const { body, validationResult } = require("express-validator");
const enviarEmails = require("../handlers/emails");
const axios = require("axios");
const { v4: uuid_v4 } = require("uuid");
const generator = require("generate-password");
const bcrypt = require("bcrypt-nodejs");
var QRCode = require('qrcode')

exports.formRegistro = async (req, res) => {

  res.render("registro", {
    nombrePagina: "Registro"
  });
};

exports.validarRegistro = async (req, res, next) => {
  // leer datos
  const usuario = req.body;

  // Nueva validacion express validator

  const rules = [
    body("nombres")
      .not()
      .isEmpty()
      .withMessage("Debe ingresar nombres y apellidos")
      .escape(),
    // body('perfil').not().isEmpty().withMessage('Debe seleccionar un perfil').escape(),
    body("idFuncionario")
      .not()
      .isEmpty()
      .withMessage("Debe ingresar un ID de funcionario")
      .escape(),
    body("parentezco")
      .not()
      .isEmpty()
      .withMessage("Debe seleccionar un parentezco")
      .escape(),
    body("telefono")
      .not()
      .isEmpty()
      .isLength({ min: 8 })
      .withMessage("El teléfono es obligatorio y debe ser correcto")
      .escape(),
    body("email")
      .isEmail()
      .withMessage("El email es obligatorio")
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password")
      .not()
      .isEmpty()
      .withMessage("El password es obligatorio")
      .escape(),
    body("password")
      .not()
      .isEmpty()
      .isLength({ min: 2 })
      .withMessage("El password debe ser mayor a 2 caracteres")
      .escape()
  ];

  await Promise.all(rules.map((validation) => validation.run(req)));

  const errores = validationResult(req);
  //si hay errores
  if (!errores.isEmpty()) {
    req.flash(
      "danger",
      errores.array().map((error) => error.msg)
    );
    res.render("registro", {
      nombrePagina: "Registro",
      mensajes: req.flash(),
    });
    // console.log(enlPat);
    return;
  }

  
  const email = req.body.email;
  const userExist = await Usuarios.findOne({
    where: {
      email: email,
    },
  });

  if (userExist) {
    req.flash(
      "danger",
      "El usuario ya se encuentra registrado en nuestra plataforma"
    );
    return res.render("registro", {
      nombrePagina: "Registro",
      mensajes: req.flash(),
    });
  }

  //si toda la validacion es correcta
  next();
};

exports.crearRegistro = async (req, res) => {

  const usuario = req.body;

  const response = await axios.get("https://api.ipify.org?format=json");
  const ip = response.data.ip;
  
  const num = Math.round(Math.random() * (9999 - 0) + 0);
  const pin = usuario.nombres.charAt(0)+'-'+num;

  const opts = {
    errorCorrectionLevel: 'H',
    type: 'terminal',
    quality: 0.95,
    margin: 2,
    color: {
      dark: '#401c7b',
      light: '#FFF',
    },
  }

  const qr2 = await QRCode.toDataURL(`/bolsa/${pin}`, opts).then(qrImage => {
    return qrImage;
  })
  
    try {

      await Usuarios.create({
        nombres: usuario.nombres,
        email: usuario.email,
        password: usuario.password,
        idFuncionario: usuario.idFuncionario,
        parentezco: usuario.parentezco,
        direccion: usuario.direccion,
        telefono: usuario.telefono,
        ip: ip,
        saldo: 1000,
        perfil: 'usuario',
        qr: qr2,
        pin: pin
      });
  
      // URL confirmacion
      const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;
  
      // Enviar email
      await enviarEmails.enviarEmail({
        usuario,
        url,
        subject: "Bienvenido a Ecowallet",
        archivo: "confirmar-cuenta",
      });
  
      // Todo: flash message y redireccionar
      req.flash("success", "Te hemos enviado un E-mail con las credenciales de tú cuenta");
      res.redirect("/ingreso");
      console.log('creando usuario');
    } catch (error) {
      console.log('El error es:', error);
      // const erroresSequelize = error.errors.map((err) => err.message);
      req.flash("danger", "Error en base de datos!");
      res.redirect("/registro");
    }
  
};

exports.recuperarPasswords = async (req, res) => {
  const email = req.body.emailRecuperar.trim();

  const usuario = await Usuarios.findOne({ where: { email: email } });

  if (!usuario) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "El email ingresado no existe en nuestra base de datos.",
    });
    return;
  }

  // NewPassword
  const newPassword = generator.generate({
    length: 12,
    numbers: true,
  });

  const hashPassword = bcrypt.hashSync(
    newPassword,
    bcrypt.genSaltSync(10),
    null
  );

  usuario.password = hashPassword;
  await usuario.save();

  // Enviar email
  await enviarEmails.enviarEmailPassword({
    usuario: email,
    newPassword,
    subject: "Recuperar contraseña Ecowallet",
    archivo: "recuperar-password",
  });

  res.json({
    titulo: "¡Que bien!",
    resp: "success",
    descripcion: "Te hemos enviado un E-mail para restablecer tu contraseña.",
  });
  return;
};

exports.formIngreso = (req, res) => {
  res.render("ingreso", {
    nombrePagina: "Ingreso",
  });
};

exports.sessionClose = (req, res) => {
  res.render('session-close', {
      nombrePagina: 'Session expired',
      validate: false
  })
}
