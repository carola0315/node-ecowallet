const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');
const { v4: uuid_v4 } = require('uuid');
const Usuarios = require('./usuariosModelo');

const Transacciones = db.define('transacciones', {
    id_transaccion: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    valor: {
        type: Sequelize.DECIMAL(20, 0),
        defaultValue : 0.00
    },
    evento: {
        type: Sequelize.STRING(500),
        defaultValue : null
    },
    concepto: {
        type: Sequelize.STRING(20),
        defaultValue : null
    },
    emisor: {
        type: Sequelize.UUID,
        defaultValue : null
    },
    receptor: {
        type: Sequelize.UUID,
        defaultValue : null
    },
    fecha: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
    
});

Transacciones.belongsTo(Usuarios, {
    as: 'userEmisor',
    foreignKey: {
        name: 'emisor',
    }
});

Transacciones.belongsTo(Usuarios, {
    as: 'userReceptor',
    foreignKey: {
        name: 'receptor',
    }
});

module.exports = Transacciones;
