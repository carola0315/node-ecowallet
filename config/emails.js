const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
    path: path.resolve(__dirname, '../production.env')
});

module.exports = {
    user: process.env.USER_EMAIL,
    pass: process.env.PASSWORD_EMAIL,
    host: process.env.HOST_EMAIL,
    port: Number(process.env.PORT_EMAIL),
    // secure: process.env.SECURE_EMAIL
}