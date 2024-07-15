document.addEventListener('DOMContentLoaded', () => {
document.getElementById('cambiarContra').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevenir el comportamiento predeterminado del formulario

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const token = getCookie('jwt'); // Reemplaza con el token real

    try {
        const response = await fetch('http://localhost:3000/cambiarContrasenia', {
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