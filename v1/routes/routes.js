const express = require('express')
const controller = require('../../controllers/controller');
const { validarJWT } = require('../../middlewares/validarJWT');
const { validarCampos } = require('../../middlewares/validarCampos');
const { check } = require('express-validator');

const routes = express.Router();



routes.get('/all', controller.getAll);



routes.get('/equipos', controller.getEquipos)


routes.get('/jugadores', controller.getJugadores)



routes.post('/', [
    check('email', 'El email es un campo obligatorio!').isEmail(),
    check('password', 'La contraseña es obligatoria!').isLength({ min: 4 }),
    validarCampos
], controller.login)


routes.post('/:ligaId', validarJWT, controller.postEquipo);



routes.patch('/:ligaId', validarJWT, controller.patchLiga);


routes.delete('/:equipoId', validarJWT, controller.deleteEquipo);

module.exports = routes;