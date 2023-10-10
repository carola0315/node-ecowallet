const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');
const { v4: uuid_v4 } = require('uuid');

const Usuarios = db.define('usuarios', {
    id_usuario: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    perfil: {
        type: Sequelize.STRING(20),
        defaultValue : null
    },
    nombres: {
        type: Sequelize.STRING(80),
        defaultValue : null,
        validate: {
            notEmpty: {
                msg: 'El nombre no puede ser vacio'
            }
        }
    },
    idFuncionario: {
        type: Sequelize.STRING(70),
        defaultValue : null
    },
    parentezco: {
        type: Sequelize.STRING(70),
        defaultValue : null
    },
    saldo: {
        type: Sequelize.DECIMAL(20, 0),
        defaultValue : 0.00
    },
    email: {
        type: Sequelize.STRING(100),
        defaultValue : null,
        unique: {
            args: true,
            msg: 'El email ya está en uso'
        },
        validate: {
            isEmail: { msg: 'Por favor ingrese un correo valido' }
        }
    },
    password: {
        type: Sequelize.STRING(70),
        defaultValue : null,
        validate: {
            notEmpty: {
                msg: 'El password no puede ser vacio'
            }
        }
    },
    telefono: {
        type: Sequelize.STRING(20),
        defaultValue : null
    },
    qr: {
        type: Sequelize.STRING(4000),
        defaultValue : null
    },
    pin: {
        type: Sequelize.STRING(10),
        defaultValue : null
    },
    fecha: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    ip: {
        type: Sequelize.STRING(16),
        defaultValue : null
    },
    fauna: {
        type: Sequelize.JSON,
        defaultValue : null
    },

    
},{ 
    // tableName: 'usuarios',
    hooks: {
        beforeCreate(usuario) {
            usuario.password = bcrypt.hashSync(usuario.password,
                bcrypt.genSaltSync(10), null);
        }
    }
});

// Metodo para comparar los passwords
Usuarios.prototype.validarPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}

module.exports = Usuarios;
