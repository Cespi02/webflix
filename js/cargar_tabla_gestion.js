$(document).ready(function() {
    var url = 'http://localhost:3000/api/clientes';
    
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
        "columnDefs": [
            {
                "targets": 3,
                "data": null,
                "render": function(data, type, row) {
                    var planId = row.valor;
                    var actionUrl = "/suscribirPlan" + planId;
                    return "<button type='button' data-url='" + actionUrl + "' class='suscribir-btn'>Suscribirse</button>";
                }
            }
        ],
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
            });
        }
    });

    // Evento de clic para cerrar sesión
    $('#cerrarSesion').on('click', function(event) {
        event.preventDefault();
        console.log('Cerrando sesión...'); // Para verificar si el evento se dispara

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