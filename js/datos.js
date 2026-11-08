/* datos.js - Reglas de la clínica: servicios, horarios y funciones de fecha y hora */
(function () {
    'use strict';

    const SERVICIOS = [
        { id: 'consulta', nombre: 'Consulta general', duracion: 30 },
        { id: 'vacunacion', nombre: 'Vacunación', duracion: 20 },
        { id: 'desparasitacion', nombre: 'Desparasitación', duracion: 20 },
        { id: 'dental', nombre: 'Limpieza dental', duracion: 60 },
        { id: 'bano', nombre: 'Baño y peluquería', duracion: 60 }
    ];

    // Horario de atención: día de la semana (0 = domingo) -> [apertura, cierre] en minutos desde las 00:00
    const HORARIO = {
        1: [480, 1080], 2: [480, 1080], 3: [480, 1080], 4: [480, 1080], 5: [480, 1080],
        6: [480, 720]
    };
    const PASO = 30;       // minutos entre una hora de inicio y la siguiente
    const MAX_DIAS = 90;   // anticipación máxima para agendar
    const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

    function dos(numero) {
        return String(numero).padStart(2, '0');
    }

    function aISO(fecha) {
        return fecha.getFullYear() + '-' + dos(fecha.getMonth() + 1) + '-' + dos(fecha.getDate());
    }

    function hoyISO() {
        return aISO(new Date());
    }

    function ahoraMin() {
        const ahora = new Date();
        return ahora.getHours() * 60 + ahora.getMinutes();
    }

    function aFecha(iso) {
        const p = iso.split('-');
        return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    }

    function diaSemana(iso) {
        return aFecha(iso).getDay();
    }

    function sumarDias(iso, dias) {
        const fecha = aFecha(iso);
        fecha.setDate(fecha.getDate() + dias);
        return aISO(fecha);
    }

    // AAAA-MM-DD -> DD/MM/AAAA
    function formatearFecha(iso) {
        const p = iso.split('-');
        return p[2] + '/' + p[1] + '/' + p[0];
    }

    function nombreDia(iso) {
        return DIAS[diaSemana(iso)];
    }

    function horaAMin(hora) {
        const p = hora.split(':');
        return Number(p[0]) * 60 + Number(p[1]);
    }

    function minAHora(minutos) {
        return dos(Math.floor(minutos / 60)) + ':' + dos(minutos % 60);
    }

    function buscarServicio(id) {
        return SERVICIOS.find(function (s) { return s.id === id; }) || null;
    }

    function horarioDelDia(iso) {
        return HORARIO[diaSemana(iso)] || null;
    }

    // Devuelve '' si la fecha se puede agendar o el motivo por el que no
    function problemaFecha(iso) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) { return 'invalida'; }
        if (iso < hoyISO()) { return 'pasada'; }
        if (iso > sumarDias(hoyISO(), MAX_DIAS)) { return 'lejana'; }
        if (!horarioDelDia(iso)) { return 'cerrado'; }
        return '';
    }

    // Horas de inicio libres para un servicio en una fecha: dentro del horario,
    // sin horas pasadas y sin empalmarse con otras citas programadas
    function horariosLibres(fecha, servicio, citas) {
        const rango = horarioDelDia(fecha);
        if (!rango) { return []; }

        const ocupadas = citas
            .filter(function (c) { return c.estado === 'programada' && c.fecha === fecha; })
            .map(function (c) { return [horaAMin(c.hora), horaAMin(c.hora) + c.duracion]; });

        const libres = [];
        for (let inicio = rango[0]; inicio + servicio.duracion <= rango[1]; inicio += PASO) {
            const fin = inicio + servicio.duracion;
            if (fecha === hoyISO() && inicio <= ahoraMin()) { continue; }
            const choca = ocupadas.some(function (o) { return inicio < o[1] && fin > o[0]; });
            if (!choca) { libres.push(minAHora(inicio)); }
        }
        return libres;
    }

    // Estado de una cita: 'cancelada', 'pasada' o 'proxima'
    function estadoDe(cita) {
        if (cita.estado === 'cancelada') { return 'cancelada'; }
        const hoy = hoyISO();
        if (cita.fecha < hoy) { return 'pasada'; }
        if (cita.fecha === hoy && horaAMin(cita.hora) + cita.duracion <= ahoraMin()) { return 'pasada'; }
        return 'proxima';
    }

    window.Vet = {
        SERVICIOS: SERVICIOS,
        MAX_DIAS: MAX_DIAS,
        hoyISO: hoyISO,
        sumarDias: sumarDias,
        formatearFecha: formatearFecha,
        nombreDia: nombreDia,
        horaAMin: horaAMin,
        minAHora: minAHora,
        buscarServicio: buscarServicio,
        horarioDelDia: horarioDelDia,
        problemaFecha: problemaFecha,
        horariosLibres: horariosLibres,
        estadoDe: estadoDe
    };
})();
