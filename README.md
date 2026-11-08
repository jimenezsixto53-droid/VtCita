# VetCita

Aplicación web para agendar citas en una clínica veterinaria (ficticia). Proyecto de medio ciclo de *Desarrollo basado en plataformas*.
Solo usa HTML, CSS y JavaScript nativos (sin frameworks ni librerías externas).

## Páginas

- `index.html`: inicio con el resumen de citas y el horario de atención.
- `servicios.html`: servicios y su duración, con enlace para agendar.
- `agendar.html`: formulario con validación; muestra solo las horas libres.
- `citas.html`: lista de citas con filtro y cancelación.
- `ayuda.html`: reglas de la agenda y uso con teclado.

## Estructura

```
VetCita/
├── index.html, servicios.html, agendar.html, citas.html, ayuda.html
├── css/estilos.css
└── js/
    ├── datos.js      Servicios, horarios y funciones de fecha y hora
    ├── almacen.js    Guardar y leer citas (localStorage)
    ├── menu.js       Menú desplegable accesible
    ├── inicio.js     Resumen de la página de inicio
    ├── agendar.js    Formulario, horas libres y validación
    └── citas.js      Lista, filtro y cancelación
```

## Reglas de la agenda

- Lunes a viernes de 08:00 a 18:00 y sábados de 08:00 a 12:00; domingos cerrado.
- Una cita a la vez: no se pueden empalmar. La duración depende del servicio.
- No se agenda en fechas pasadas ni con más de 90 días de anticipación.

## Cómo abrirla

1. Abre la carpeta en Visual Studio Code (archivo `VetCita.code-workspace` o *Archivo > Abrir carpeta*).
2. Abre `index.html` en el navegador (doble clic) o usa la extensión *Live Server*.

## Cómo publicarla en GitHub Pages

1. Sube **el contenido de esta carpeta** a un repositorio de GitHub (los archivos, no la carpeta).
2. En el repositorio: *Settings > Pages > Source: Deploy from a branch > main > / (root) > Save*.
3. La dirección será `https://TU_USUARIO.github.io/TU_REPOSITORIO/` (carga `index.html` automáticamente).
