const adaptador = require('../database/adapter')
const { generateJWT } = require('../helpers/generarJWT')
const bcrypt = require('bcrypt');

const getAll = async (req, res) => {
    try {
        let page = req.query.page;

        let ligas = await adaptador.getAll()

        if (page) {
            if (isNaN(page) || page <= 0) {
                page = 1;
            }
            page = Number(page)
            const limite = page;
            const inicio = page - 1;

            ligas = ligas.slice(inicio, limite)
        }

        if (page) {
            res.status(200).send({ status: 'OK', page: page, data: ligas });
        } else {
            res.status(200).send({ status: 'OK', data: ligas });
        }

    } catch (error) {
        res.status(error.status || 500).send({ status: 'FAILED', message: error.message })
    }
}

const getEquipos = async (req, res) => {
    try {
        let equipos = await adaptador.getEquipos()
        let jugadores = false;

        if (req.query.jugadores) {
            try {
                jugadores = JSON.parse(req.query.jugadores);
            } catch (e) {
                jugadores = false;
            }
        }

        const nombre = req.query.nombre;
        const capacidadEstadioGt = req.query.capacidadgt;
        const capacidadEstadioLt = req.query.capacidadlt;
        const anioFundacion = req.query.aniofundacion;
        let page = req.query.page;


        if (!jugadores) {
            for (const equipo of equipos) {
                delete equipo.jugadores
            }
        }

        if (nombre) {
            const constainsList = []
            for (const equipo of equipos) {

                if (equipo.nombre.toLowerCase().includes(nombre.toLowerCase())) {
                    constainsList.push(equipo);
                }
            }

            equipos = constainsList;
        }

        if (capacidadEstadioGt) {
            const temporalList = []
            for (const equipo of equipos) {
                if (equipo.capacida_estadio > capacidadEstadioGt) {
                    temporalList.push(equipo)
                }
            }

            equipos = temporalList;
        }

        if (capacidadEstadioLt) {
            const temporalList = []
            for (const equipo of equipos) {
                if (equipo.capacida_estadio < capacidadEstadioLt) {
                    temporalList.push(equipo)
                }
            }

            equipos = temporalList;
        }

        if (anioFundacion) {
            if (anioFundacion === '-1') {

                equipos.sort((a, b) => b.anio_fundacion - a.anio_fundacion)
            }
            if (anioFundacion === '1') {

                equipos.sort((a, b) => a.anio_fundacion - b.anio_fundacion)
            }

        }

        if (page) {
            if (isNaN(page) || page <= 0) {
                page = 1;
            }
            page = Number(page)
            const limite = page * 5;
            const inicio = (page - 1) * 5;

            equipos = equipos.slice(inicio, limite)
        }

        if (page) {
            res.status(200).send({ status: 'OK', page: page, data: equipos })
        } else {
            res.status(200).send({ status: 'OK', data: equipos })
        }


    } catch (error) {
        res.status(error.status || 500).send({ status: 'FAILED', message: error.message })
    }
}

const getJugadores = async (req, res) => {
    try {
        let jugadores = await adaptador.getJugadores();

        const nombre = req.query.nombre;
        const nacionalidad = req.query.nacionalidad;
        const posicion = req.query.posicion;
        const anioNacimiento = req.query.anionacimiento;
        let page = req.query.page;

        if (nombre) {
            jugadores = jugadores.filter(jugador =>
                jugador.nombre.toLowerCase().includes(nombre.toLowerCase())
            );
        }

        if (nacionalidad) {
            jugadores = jugadores.filter(jugador =>
                jugador.nacionalidad.toLowerCase().includes(nacionalidad.toLowerCase())
            );
        }

        if (posicion) {
            jugadores = jugadores.filter(jugador =>
                jugador.posicion.toLowerCase().includes(posicion.toLowerCase())
            );
        }


        if (anioNacimiento) {
            if (anioNacimiento === '1') {
                jugadores.sort((a, b) => a.anio_nacimiento - b.anio_nacimiento);
            } else if (anioNacimiento === '-1') {
                jugadores.sort((a, b) => b.anio_nacimiento - a.anio_nacimiento);
            }
        }

        if (page) {
            if (isNaN(page) || page <= 0) {
                page = 1;
            }
            page = Number(page)
            const limite = page * 15;
            const inicio = (page - 1) * 15;

            jugadores = jugadores.slice(inicio, limite)
        }

        if (page) {
            res.status(200).send({ status: 'OK', page: page, data: jugadores });
        } else {
            res.status(200).send({ status: 'OK', data: jugadores });
        }
    } catch (error) {
        res.status(error.status || 500).send({ status: 'FAILED', message: error.message });
    }
}


const postEquipo = async (req, res) => {

    const { ligaId } = req.params;
    const equipoBody = req.body;

    if (!equipoBody || !ligaId) res.status(400).send({ status: 'FAILED', message: 'NO DATA' });

    try {
        const equipo = await adaptador.postEquipo(ligaId, equipoBody)
        res.status(200).send({ status: 'OK', data: equipo })
    } catch (error) {
        res.status(error.status || 500).send({ status: 'FAILED', message: error.message })
    }
}

const patchLiga = async (req, res) => {
    const { ligaId } = req.params
    const fields = req.body

    if (!await adaptador.existeLiga(ligaId)) {
        res.status(400).send({ status: 'FAILED', message: 'La liga no existe' })
        return;
    }

    if (!fields || Object.keys(fields).length === 0) {

        res.status(400).send({ status: 'FAILED', message: 'No hay campos para actualizar' })
        return;
    }
    try {

        await adaptador.patchLiga(ligaId, fields)
        res.status(200).send({ status: 'OK', data: fields })

    } catch (error) {


        res.status(error.status || 500).send({ status: 'FAILED', message: error.message })
    }


}

const deleteEquipo = async (req, res) => {
    const { equipoId } = req.params

    const equipo = await adaptador.getEquipoById(equipoId);

    if (!equipo) {
        res.status(400).send({ status: 'FAILED', message: 'El equipo no existe' })
        return;
    }

    try {

        await adaptador.deleteEquipo(equipoId)
        res.status(200).send({ status: 'OK', data: equipo })

    } catch (error) {

        res.status(error.status || 500).send({ status: 'FAILED', message: error.message })
    }

}


const login = async (req, res) => {

    const { email, password } = req.body;

    try {
        const admin = await adaptador.getAdmin(email, password);

        if (!admin) {
            return res.status(400).json({
                status: 'FAILED',
                msg: 'Usuario o contraseña incorrectos'
            })
        }

        //Comprobación de contraseña
        const validPassword = bcrypt.compareSync(password.toString(), admin.password)
        if (!validPassword) {

            return res.status(400).json({
                status: 'FAILED',
                msg: 'Usuario o contraseña incorrectos'
            })
        }

        //Generación del JWT
        const token = await generateJWT(admin.usuario)

        return res.json({
            status: 'OK',
            user: admin.usuario,
            token
        })

    } catch (error) {

        return res.status(500).json({
            status: 'FAILED',
            msg: 'Error interno del servidor'
        });
    }
}



module.exports = {
    getAll,
    getEquipos,
    getJugadores,
    postEquipo,
    patchLiga,
    deleteEquipo,
    login,
}