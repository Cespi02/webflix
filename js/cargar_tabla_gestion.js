function getCookie(name) {
    let cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if (name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

$(document).ready(async function() {
    const token = getCookie('jwt');
    const listaNav = document.querySelector('.listaNav');
    let suscripcion = '';

    if (token) {
        const email = JSON.parse(atob(token.split('.')[1])).user; // Decodificar el token para obtener el email
        try {
            const response = await fetch('/obtenerSuscripcion', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Enviar el token de autenticación
                }
            });
            const data = await response.json();
            if (data.success && data.data && data.data.length > 0) {
                suscripcion = data.data[0].nombre_plan; // Nombre del plan desde la base de datos
                console.log("la query trajo " + data.data[0].nombre_plan); 
            } else {
                console.log("No se encontraron suscripciones.");
            }
            listaNav.innerHTML = `
                <ul class="listaNav">
                    <span class="linkNav suscripcion" aria-haspopup="true" aria-expanded="false">Suscripción actual: ${suscripcion}</span>
                    <span class="linkNav suscripcion" aria-haspopup="true" aria-expanded="false">${email}</span>
                    <li class="listaItem"><a class="linkNav iniciarSesion" id="eliminarCuenta">Eliminar cuenta</a></li>
                    <li class="listaItem"><a class="linkNav iniciarSesion" id="anularSus">Anular Suscripción</a></li>
                    <li class="listaItem"><a class="linkNav iniciarSesion" href="cambiar_contrasenia.html">Cambiar Contraseña</a></li>
                    <li class="listaItem"><a class="linkNav iniciarSesion" id="cerrarSesion">Cerrar Sesión</a></li>      
                </ul>
            `;
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
        }

        const eliminarCuenta = document.getElementById('eliminarCuenta');
        eliminarCuenta.addEventListener('click', async () => {
            const token = getCookie('jwt');
            try {
                const response = await fetch('/borrarCuenta', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ token })
                });
                const result = await response.json();
                if (result.success) {
                    alert('Cuenta Eliminada');
                } else {
                    alert('Error al eliminar cuenta: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al realizar la solicitud');
            }
        });

        const anularSus = document.getElementById('anularSus');
        anularSus.addEventListener('click', async () => {
            const token = getCookie('jwt');
            try {
                const response = await fetch('/anularSus', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ token })
                });
                const result = await response.json();
                if (result.success) {
                    alert('Suscripción Anulada');
                    location.reload(); // Recargar la página para actualizar la vista
                } else {
                    alert('Error al anular Suscripción: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al realizar la solicitud');
            }
        });

        document.getElementById('cerrarSesion').addEventListener('click', function(event) {
            event.preventDefault();
            fetch('/cerrarSesion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Sesión cerrada correctamente') {
                    window.location.href = '/';
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }

    var url = 'http://localhost:3000/api/clientes';
    var columnDefs = [];

    if (!suscripcion) {
        columnDefs.push({
            "targets": 3,
            "data": null,
            "render": function(data, type, row) {
                var planId = row.valor;
                var actionUrl = "/suscribirPlan" + planId;
                return "<button type='button' data-url='" + actionUrl + "' class='boton suscribir-btn'>Suscribirse</button>";
            }
        });
    } else {
        columnDefs.push({
            "targets": 3,
            "data": null,
            "render": function(data, type, row) {
                return "<p> Ya suscrito</p>";
            }
        });
    }

    var table = $('#tablaCli').DataTable({
        language: {
            lengthMenu: "Mostrar _MENU_ registros por página",
            zeroRecords: "Ningún usuario encontrado",
            info: "Los planes disponibles son los siguientes",
            infoEmpty: "Ningún usuario encontrado",
            infoFiltered: "(filtrados desde _MAX_ registros totales)",
            search: "Buscar:",
            loadingRecords: "Cargando...",
            paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior"
            }
        },
        "paging": false,
        "searching": false,
        "ajax": {
            "url": url,
            "dataSrc": ""
        },
        "columns": [
            {"data": "nombre_plan"},
            {"data": "cant_dispositivos"},
            {"data": "valor"}
        ],
        "columnDefs": columnDefs,
        "initComplete": function() {
            $('#tablaCli tbody').on('click', '.suscribir-btn', function() {
                var actionUrl = $(this).data('url');
                var planId = actionUrl.replace('/suscribirPlan', '');
                fetch(actionUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ plan: planId })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Respuesta del servidor:', data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
                location.reload();
            });
        }
    });

    $('#cerrarSesion').on('click', function(event) {
        event.preventDefault();
        console.log('Cerrando sesión...');
        fetch('/cerrarSesion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Respuesta del servidor:', data);
            if (data.message === 'Sesión cerrada correctamente') {
                window.location.href = '/';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
