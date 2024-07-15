
document.addEventListener('DOMContentLoaded', function() {
    // Función para obtener una cookie por nombre
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

    const token = getCookie('jwt');
    const listaNav = document.querySelector('.listaNav');

    if (token) {
        // Si el token existe, significa que el usuario está autenticado
        const email = JSON.parse(atob(token.split('.')[1])).user; // Decodificar el token para obtener el email
        
        listaNav.innerHTML = `
            <ul class="listaNav">
                <span class="linkNav"  aria-haspopup="true" aria-expanded="false">${email}</span>
                <li class="listaItem"><a class="linkNav iniciarSesion" href="/gestion">Gestion Cliente</a></li>
                <li class="listaItem"><a class="linkNav iniciarSesion" id="eliminarCuenta">Eliminar cuenta</a></li>
                <li class="listaItem"><a class="linkNav iniciarSesion" href="cambiar_contrasenia.html">Cambiar Contraseña</a></li>
                <li class="listaItem"><a class="linkNav iniciarSesion" id="cerrarSesion">Cerrar Sesión</a></li>      
            </ul>
        `;

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
                console.log('Respuesta del servidor:', data);
                if (data.message === 'Sesión cerrada correctamente') {
                    window.location.href = '/';
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }
// Boton eliminar cuenta
    const eliminarCuenta = document.getElementById('eliminarCuenta');
    eliminarCuenta.addEventListener('click', async () => {
        const token = getCookie('jwt'); // Reemplaza con el token real
        console.log("llegue hasta el try, el boton es", eliminarCuenta);
        try {
            const response = await fetch('/borrarCuenta', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Asegúrate de incluir el token de autenticación
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
});
