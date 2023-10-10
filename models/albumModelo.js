const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');
const { v4: uuid_v4 } = require('uuid');
const Usuarios = require('./usuariosModelo');

const Album = db.define('albumFaunas', {
    id_album: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING(30),
        defaultValue : null
    },
    descripcion: {
        type: Sequelize.STRING(3000),
        defaultValue : null
    },
    animal_bn: {
        type: Sequelize.STRING(150),
        defaultValue : null
    },
    animal_color: {
        type: Sequelize.STRING(150),
        defaultValue : null
    },
    render: {
        type: Sequelize.STRING(150),
        defaultValue : null
    },
    patt: {
        type: Sequelize.STRING(150),
        defaultValue : null
    }
});

module.exports = Album;
