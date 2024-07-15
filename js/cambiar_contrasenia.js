function getCookie(name) {
    const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return cookieValue ? cookieValue.pop() : null;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cambiarContra');
    console.log("Inicio del contentloaded");
    const cambiarContraseniaButton = document.getElementById('cambiarContraseniaButton');
    cambiarContraseniaButton.addEventListener('click', async () => {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const token = getCookie('jwt'); // Reemplaza con el token real
        console.log("llegue hasta el try, el boton es", cambiarContraseniaButton);
        try {
            const response = await fetch('/cambiarContrasenia', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Asegúrate de incluir el token de autenticación
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const result = await response.json();

            if (result.success) {
                alert('Contraseña actualizada correctamente');
            } else {
                alert('Error al actualizar la contraseña: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al realizar la solicitud');
        }
    });
});