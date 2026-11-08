/* citas.js - Lista de citas: filtro, estado y cancelación */
(function () {
    'use strict';

    const lista = document.getElementById('lista');
    if (!lista) {
        return;
    }

    const estado = document.getElementById('estado-lista');
    const vacio = document.getElementById('vacio');
    const encabezado = document.getElementById('titulo-lista');
    const radios = document.querySelectorAll('input[name="filtro"]');
    const ETIQUETAS = { proxima: 'Programada', pasada: 'Pasada', cancelada: 'Cancelada' };
    let filtro = 'proximas';

    function anunciar(texto) {
        estado.textContent = texto;
    }

    function crearTexto(etiqueta, clase, texto) {
        const elemento = document.createElement(etiqueta);
        elemento.className = clase;
        elemento.textContent = texto;
        return elemento;
    }

    // Construye el <li> de una cita usando solo textContent (sin innerHTML)
    function crearItem(cita) {
        const situacion = Vet.estadoDe(cita);
        const servicio = Vet.buscarServicio(cita.servicio);
        const fin = Vet.minAHora(Vet.horaAMin(cita.hora) + cita.duracion);

        const item = document.createElement('li');
        item.className = 'cita' + (situacion === 'proxima' ? '' : ' cita-' + situacion);

        const info = document.createElement('div');
        info.className = 'cita-info';
        const titulo = document.createElement('h3');
        titulo.textContent = cita.mascota + ' · ' + servicio.nombre;
        info.appendChild(titulo);
        info.appendChild(crearTexto('p', 'cita-meta',
            cita.especie + ' · ' + Vet.nombreDia(cita.fecha) + ' ' + Vet.formatearFecha(cita.fecha) + ' · ' + cita.hora + ' a ' + fin));
        info.appendChild(crearTexto('p', 'cita-meta',
            'Dueño: ' + cita.dueno + ' · Teléfono: ' + cita.telefono));
        if (cita.notas) {
            info.appendChild(crearTexto('p', 'cita-notas', 'Observaciones: ' + cita.notas));
        }
        const meta = document.createElement('p');
        meta.className = 'cita-meta';
        meta.appendChild(crearTexto('span', 'etiqueta etiqueta-' + situacion, ETIQUETAS[situacion]));
        info.appendChild(meta);
        item.appendChild(info);

        // Solo las citas próximas se pueden cancelar
        if (situacion === 'proxima') {
            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'boton boton-peligro';
            boton.textContent = 'Cancelar cita';
            boton.setAttribute('aria-label', 'Cancelar cita de ' + cita.mascota + ' del ' +
                Vet.formatearFecha(cita.fecha) + ' a las ' + cita.hora);
            boton.addEventListener('click', function () {
                Almacen.cancelar(cita.id);
                dibujar();
                encabezado.focus();
                anunciar('Cita de ' + cita.mascota + ' cancelada. El horario quedó libre.');
            });
            item.appendChild(boton);
        }
        return item;
    }

    function pasaFiltro(cita) {
        const situacion = Vet.estadoDe(cita);
        if (filtro === 'proximas') { return situacion === 'proxima'; }
        if (filtro === 'pasadas') { return situacion === 'pasada'; }
        if (filtro === 'canceladas') { return situacion === 'cancelada'; }
        return true;
    }

    // Ordena por fecha y hora
    function ordenar(citas) {
        return citas.slice().sort(function (a, b) {
            return (a.fecha + a.hora).localeCompare(b.fecha + b.hora);
        });
    }

    // Vuelve a dibujar la lista completa según el filtro actual
    function dibujar() {
        const visibles = ordenar(Almacen.cargar().filter(pasaFiltro));
        lista.textContent = '';
        visibles.forEach(function (cita) {
            lista.appendChild(crearItem(cita));
        });
        vacio.hidden = visibles.length > 0;
        return visibles.length;
    }

    radios.forEach(function (radio) {
        radio.addEventListener('change', function () {
            filtro = radio.value;
            const cantidad = dibujar();
            anunciar('Mostrando ' + cantidad + (cantidad === 1 ? ' cita' : ' citas') + ' (' + radio.value + ').');
        });
    });

    dibujar();
})();
