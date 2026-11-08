/* menu.js - Menú desplegable accesible para pantallas pequeñas */
(function () {
    'use strict';

    // Marca que JavaScript está activo: sin JS el menú queda siempre visible
    document.documentElement.classList.add('js');

    const boton = document.getElementById('menu-boton');
    const lista = document.getElementById('menu-lista');

    if (!boton || !lista) {
        return;
    }

    function abrirMenu(abrir) {
        lista.classList.toggle('abierto', abrir);
        boton.setAttribute('aria-expanded', String(abrir));
    }

    boton.addEventListener('click', function () {
        abrirMenu(boton.getAttribute('aria-expanded') !== 'true');
    });

    // Esc cierra el menú y devuelve el foco al botón
    document.addEventListener('keydown', function (evento) {
        if (evento.key === 'Escape' && boton.getAttribute('aria-expanded') === 'true') {
            abrirMenu(false);
            boton.focus();
        }
    });
})();
