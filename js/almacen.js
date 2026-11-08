/* almacen.js - Guarda y lee las citas en localStorage */
(function () {
    'use strict';

    const CLAVE = 'vetcita.citas';
    let respaldo = []; // se usa solo si el navegador bloquea localStorage

    function cargar() {
        try {
            const texto = window.localStorage.getItem(CLAVE);
            return texto ? JSON.parse(texto) : [];
        } catch (error) {
            return respaldo;
        }
    }

    function guardar(citas) {
        respaldo = citas;
        try {
            window.localStorage.setItem(CLAVE, JSON.stringify(citas));
        } catch (error) {
            // Sin almacenamiento: las citas quedan solo en memoria
        }
    }

    function nuevoId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function agregar(datos) {
        const citas = cargar();
        const cita = {
            id: nuevoId(),
            dueno: datos.dueno,
            telefono: datos.telefono,
            correo: datos.correo,
            mascota: datos.mascota,
            especie: datos.especie,
            servicio: datos.servicio,
            fecha: datos.fecha,
            hora: datos.hora,
            duracion: datos.duracion,
            notas: datos.notas,
            estado: 'programada'
        };
        citas.push(cita);
        guardar(citas);
        return cita;
    }

    function cancelar(id) {
        const citas = cargar();
        citas.forEach(function (cita) {
            if (cita.id === id) {
                cita.estado = 'cancelada';
            }
        });
        guardar(citas);
    }

    window.Almacen = { cargar: cargar, agregar: agregar, cancelar: cancelar };
})();
