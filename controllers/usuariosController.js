const Usuarios = require('../models/usuariosModelo');
const { Op } = require("sequelize");
const { v4: uuid_v4 } = require('uuid');
require('util').inspect.defaultOptions.depth = null;