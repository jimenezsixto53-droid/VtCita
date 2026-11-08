/* agendar.js - Formulario «Agendar cita»: horas libres dinámicas, validación y registro */
(function () {
    'use strict';

    const form = document.getElementById('form-cita');
    if (!form) {
        return;
    }

    const estado = document.getElementById('estado-form');
    const servicio = form.elements.servicio;
    const fecha = form.elements.fecha;
    const hora = form.elements.hora;
    const avisoHora = document.getElementById('hora-ayuda');
    const notas = form.elements.notas;
    const contador = document.getElementById('notas-contador');

    // El selector de fecha solo permite desde hoy hasta 90 días
    fecha.min = Vet.hoyISO();
    fecha.max = Vet.sumarDias(Vet.hoyISO(), Vet.MAX_DIAS);

    // Llena la lista de servicios desde los datos de la clínica
    Vet.SERVICIOS.forEach(function (s) {
        const opcion = document.createElement('option');
        opcion.value = s.id;
        opcion.textContent = s.nombre + ' (' + s.duracion + ' min)';
        servicio.appendChild(opcion);
    });

    // Si se llegó desde «Servicios», el servicio queda elegido
    const pedido = new URLSearchParams(window.location.search).get('servicio');
    if (pedido && Vet.buscarServicio(pedido)) {
        servicio.value = pedido;
    }

    const MOTIVOS = {
        invalida: 'Escribe una fecha válida.',
        pasada: 'La fecha no puede ser anterior a hoy.',
        lejana: 'Solo se puede agendar con hasta ' + Vet.MAX_DIAS + ' días de anticipación.',
        cerrado: 'La clínica no atiende los domingos. Elige otro día.'
    };

    // Muestra en «Hora» solo los horarios libres para el servicio y la fecha elegidos
    function actualizarHoras() {
        const anterior = hora.value;
        const elegido = Vet.buscarServicio(servicio.value);
        let libres = [];
        let aviso = 'Elige primero el servicio y la fecha.';

        if (elegido && fecha.value !== '') {
            const problema = Vet.problemaFecha(fecha.value);
            if (problema) {
                aviso = MOTIVOS[problema];
            } else {
                libres = Vet.horariosLibres(fecha.value, elegido, Almacen.cargar());
                aviso = libres.length > 0
                    ? libres.length + (libres.length === 1 ? ' horario disponible.' : ' horarios disponibles.')
                    : 'No hay horarios disponibles ese día. Elige otra fecha.';
            }
        }

        hora.textContent = '';
        const base = document.createElement('option');
        base.value = '';
        base.textContent = libres.length > 0 ? 'Selecciona una hora' : 'Sin horarios disponibles';
        hora.appendChild(base);
        libres.forEach(function (h) {
            const opcion = document.createElement('option');
            opcion.value = h;
            opcion.textContent = h;
            hora.appendChild(opcion);
        });
        if (libres.indexOf(anterior) !== -1) {
            hora.value = anterior;
        }
        avisoHora.textContent = aviso;
    }

    // Reglas de validación: devuelven '' si el dato es válido o el mensaje de error
    function validarDueno() {
        const valor = form.elements.dueno.value.trim();
        if (valor === '') { return 'Escribe el nombre del dueño.'; }
        if (valor.length < 3) { return 'El nombre debe tener al menos 3 caracteres.'; }
        if (!/^[\p{L}][\p{L} '.-]*$/u.test(valor)) { return 'El nombre solo puede tener letras y espacios.'; }
        return '';
    }

    function validarTelefono() {
        const valor = form.elements.telefono.value.trim();
        if (valor === '') { return 'Escribe un teléfono de contacto.'; }
        if (!/^\d{7,10}$/.test(valor)) {
            return 'El teléfono debe tener de 7 a 10 dígitos, solo números.';
        }
        return '';
    }

    function validarCorreo() {
        const campo = form.elements.correo;
        if (campo.value.trim() !== '' && campo.validity.typeMismatch) {
            return 'Escribe un correo válido, por ejemplo nombre@dominio.com.';
        }
        return '';
    }

    function validarMascota() {
        const valor = form.elements.mascota.value.trim();
        if (valor === '') { return 'Escribe el nombre de la mascota.'; }
        if (valor.length < 2) { return 'El nombre de la mascota debe tener al menos 2 caracteres.'; }
        return '';
    }

    function validarEspecie() {
        return form.elements.especie.value === '' ? 'Elige la especie de la mascota.' : '';
    }

    function validarServicio() {
        return servicio.value === '' ? 'Selecciona un servicio.' : '';
    }

    function validarFecha() {
        if (fecha.value === '') { return 'Elige la fecha de la cita.'; }
        return MOTIVOS[Vet.problemaFecha(fecha.value)] || '';
    }

    function validarHora() {
        return hora.value === '' ? 'Elige una hora disponible.' : '';
    }

    // Cada campo: elemento con aria-invalid, elemento que recibe el foco, mensaje de error y regla
    const campos = [
        { control: form.elements.dueno, foco: form.elements.dueno, error: 'dueno-error', validar: validarDueno },
        { control: form.elements.telefono, foco: form.elements.telefono, error: 'telefono-error', validar: validarTelefono },
        { control: form.elements.correo, foco: form.elements.correo, error: 'correo-error', validar: validarCorreo },
        { control: form.elements.mascota, foco: form.elements.mascota, error: 'mascota-error', validar: validarMascota },
        { control: document.getElementById('grupo-especie'), foco: form.elements.especie[0], error: 'especie-error', validar: validarEspecie },
        { control: servicio, foco: servicio, error: 'servicio-error', validar: validarServicio },
        { control: fecha, foco: fecha, error: 'fecha-error', validar: validarFecha },
        { control: hora, foco: hora, error: 'hora-error', validar: validarHora }
    ];

    function mostrarEstado(texto, clase) {
        estado.className = 'estado ' + clase;
        estado.textContent = texto;
    }

    // El error se escribe con texto (no solo con color) y se marca aria-invalid
    function validarCampo(campo) {
        const mensaje = campo.validar();
        document.getElementById(campo.error).textContent = mensaje ? 'Error: ' + mensaje : '';
        if (mensaje) {
            campo.control.setAttribute('aria-invalid', 'true');
        } else {
            campo.control.removeAttribute('aria-invalid');
        }
        return mensaje === '';
    }

    // Al corregir un campo con error, se vuelve a validar mientras el usuario escribe
    function revalidar() {
        let quedanErrores = false;
        campos.forEach(function (campo) {
            if (campo.control.getAttribute('aria-invalid')) {
                quedanErrores = !validarCampo(campo) || quedanErrores;
            }
        });
        if (!quedanErrores && estado.classList.contains('estado-error')) {
            estado.className = 'estado';
            estado.textContent = '';
        }
    }

    function actualizarContador() {
        contador.textContent = notas.value.length + ' de 200 caracteres';
    }

    servicio.addEventListener('change', actualizarHoras);
    fecha.addEventListener('change', actualizarHoras);
    fecha.addEventListener('input', actualizarHoras);
    notas.addEventListener('input', actualizarContador);
    form.addEventListener('input', revalidar);
    form.addEventListener('change', revalidar);

    form.addEventListener('submit', function (evento) {
        evento.preventDefault();

        let primero = null;
        let errores = 0;
        campos.forEach(function (campo) {
            if (!validarCampo(campo)) {
                errores++;
                if (!primero) { primero = campo; }
            }
        });

        if (errores > 0) {
            mostrarEstado('Error: hay ' + errores + (errores === 1 ? ' campo' : ' campos') + ' por corregir.', 'estado-error');
            primero.foco.focus();
            return;
        }

        const elegido = Vet.buscarServicio(servicio.value);
        const cita = Almacen.agregar({
            dueno: form.elements.dueno.value.trim(),
            telefono: form.elements.telefono.value.trim(),
            correo: form.elements.correo.value.trim(),
            mascota: form.elements.mascota.value.trim(),
            especie: form.elements.especie.value,
            servicio: elegido.id,
            fecha: fecha.value,
            hora: hora.value,
            duracion: elegido.duracion,
            notas: notas.value.trim()
        });

        form.reset();
        actualizarContador();
        actualizarHoras();

        mostrarEstado('Cita agendada: ' + cita.mascota + ', ' + Vet.nombreDia(cita.fecha) + ' ' +
            Vet.formatearFecha(cita.fecha) + ' a las ' + cita.hora + '. ', 'estado-exito');
        const enlace = document.createElement('a');
        enlace.href = 'citas.html';
        enlace.textContent = 'Ver mis citas';
        estado.appendChild(enlace);
        estado.focus();
    });

    actualizarHoras();
})();
