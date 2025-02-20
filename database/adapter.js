const { db } = require("./firebasedb.js");

const getAll = async () => {
    try {
        const ligasCollection = await db.collection('ligas').get();
        const ligas = [];

        for (const doc of ligasCollection.docs) {
            const equipos = await getEquiposByLigaID(doc.id);
            ligas.push({ id: doc.id, ...doc.data(), equipos })
        }
        return ligas;
    } catch (error) {
        throw { status: 500, message: 'Error interno del servidor' };
    }
}

const getEquiposByLigaID = async (ligaId) => {

    const equiposList = []
    const equipos = await db.collection('ligas').doc(ligaId).collection('equipos').get();

    equipos.forEach((doc) => {
        const equipo = { id: doc.id, ...doc.data() }

        equiposList.push(equipo)
    })

    return equiposList;
}

const getAdmin = async (user) => {

    try {
        const admin = await db.collection('usuarios').doc('admin').get();

        if (admin.data().usuario === user) {
            return admin.data();
        }

        return undefined;

    } catch (error) {
        throw { status: 500, message: 'Error interno del servidor' };
    }


}

const postEquipo = async (ligaId, equipo) => {

    try {
        const equiposSubcoleccion = db.collection('ligas').doc(ligaId).collection('equipos');
        const idNuevoEquipo = await equiposSubcoleccion.add(equipo);
        return { id: idNuevoEquipo.id, nombre: equipo.nombre };

    } catch (error) {
        throw { status: 500, message: 'Error interno del servidor' };
    }


}

const patchLiga = async (ligaId, fields) => {

    try {
        const docRef = db.collection('ligas').doc(ligaId)
        await docRef.update(fields)

    } catch (error) {

        throw { status: 500, message: 'Error interno del servidor' };
    }

}

const deleteEquipo = async (equipoId) => {
    try {
        const ligaId = await getLigaIdByTeamId(equipoId)

        if (ligaId) {
            await db.collection('ligas').doc(ligaId).collection('equipos').doc(equipoId).delete()
        }

    } catch (error) {
        throw { status: 500, message: 'Error interno del servidor' };
    }
}

const getLigaIdByTeamId = async (id) => {
    const ligas = await db.collection('ligas').get();

    for (const ligaDoc of ligas.docs) {
        const equiposSnapshot = await ligaDoc.ref.collection('equipos').get();
        for (const equipoDoc of equiposSnapshot.docs) {
            if (equipoDoc.id === id) {
                return ligaDoc.id;
            }

        }
    }

    return undefined;
};

const existeLiga = async (ligaId) => {

    const doc = await db.collection('ligas').doc(ligaId).get();
    if (doc.exists) {
        return true;
    } else {
        return false;
    }

}

const getEquipoById = async (equipoId) => {
    const idsLigas = await getLigasIds();

    const equipos = [];

    for (const id of idsLigas) {

        equipos.push(...await getEquiposByLigaID(id))
    }


    for (const equipo of equipos) {

        if (equipoId == equipo.id) return equipo;
    }

    return undefined;

}

const getLigasIds = async () => {
    const idsLigas = []

    const collection = await db.collection('ligas').get();

    collection.forEach((doc) => {
        idsLigas.push(doc.id)
    })

    return idsLigas;
}

const getEquipos = async () => {
    const idsLigas = await getLigasIds();

    const equipos = [];

    for (const id of idsLigas) {

        equipos.push(...await getEquiposByLigaID(id))
    }

    return equipos;
}


const getJugadores = async () => {
    const jugadores = [];
    const equipos = await getEquipos();

    for (const equipo of equipos) {
        jugadores.push(...equipo.jugadores)
    }

    return jugadores;
}


module.exports = {
    getAll,
    getAdmin,
    postEquipo,
    patchLiga,
    existeLiga,
    getEquipoById,
    deleteEquipo,
    getEquipos,
    getJugadores,
}
