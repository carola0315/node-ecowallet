const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');
const { v4: uuid_v4 } = require('uuid');

const EncuestaTwo = db.define('encuestatwos', {
    id_pregunta: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    pregunta: {
        type: Sequelize.STRING(1000),
        defaultValue : null
    },
    a: {
        type: Sequelize.STRING(500),
        defaultValue : null
    },
    b: {
        type: Sequelize.STRING(500),
        defaultValue : null
    },
    c: {
        type: Sequelize.STRING(500),
        defaultValue : null
    },
    d: {
        type: Sequelize.STRING(500),
        defaultValue : null
    },
    e: {
        type: Sequelize.STRING(500),
        defaultValue : null
    },
    respuesta: {
        type: Sequelize.STRING(2),
        defaultValue : null
    }
});

module.exports = EncuestaTwo;
