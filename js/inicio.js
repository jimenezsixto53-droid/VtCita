/* inicio.js - Resumen de citas y horario de hoy en la página de inicio */
(function () {
    'use strict';

    const proximas = document.getElementById('num-proximas');
    if (!proximas) {
        return;
    }

    const citas = Almacen.cargar();
    const hoy = Vet.hoyISO();
    const conteo = { proxima: 0, pasada: 0, cancelada: 0 };
    let paraHoy = 0;
    const lista = [];

    citas.forEach(function (cita) {
        const estado = Vet.estadoDe(cita);
        conteo[estado]++;
        if (estado === 'proxima') {
            lista.push(cita);
            if (cita.fecha === hoy) { paraHoy++; }
        }
    });

    proximas.textContent = conteo.proxima;
    document.getElementById('num-hoy').textContent = paraHoy;
    document.getElementById('num-pasadas').textContent = conteo.pasada;
    document.getElementById('num-canceladas').textContent = conteo.cancelada;

    // Próxima cita: la más cercana entre las programadas que aún no pasan
    lista.sort(function (a, b) {
        return (a.fecha + a.hora).localeCompare(b.fecha + b.hora);
    });
    const mensaje = document.getElementById('proxima');
    if (lista.length > 0) {
        const c = lista[0];
        mensaje.textContent = 'Próxima cita: ' + c.mascota + ' (' + Vet.buscarServicio(c.servicio).nombre + '), ' +
            Vet.nombreDia(c.fecha) + ' ' + Vet.formatearFecha(c.fecha) + ' a las ' + c.hora + '.';
    } else {
        mensaje.textContent = 'No tienes citas próximas. Agenda una desde «Agendar cita».';
    }

    // Horario de atención de hoy
    const rango = Vet.horarioDelDia(hoy);
    const fechaHoy = Vet.nombreDia(hoy) + ' ' + Vet.formatearFecha(hoy);
    document.getElementById('atencion').textContent = rango
        ? 'Hoy ' + fechaHoy + ' atendemos de ' + Vet.minAHora(rango[0]) + ' a ' + Vet.minAHora(rango[1]) + '.'
        : 'Hoy ' + fechaHoy + ' la clínica está cerrada.';
})();
