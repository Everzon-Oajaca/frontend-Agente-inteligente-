const API_URL = 'http://localhost:8080/api/preguntas';
let ultimaPregunta = "";



function handleKeyPress(event) {
    if (event.key === 'Enter') {
        consultarPregunta();
    }
}

function consultarPregunta() {
    const pregunta = document.getElementById('pregunta').value.trim().toLowerCase();
    if (!pregunta) {
        alert("Por favor, ingresa una pregunta válida.");
        return;
    }

    agregarMensaje(pregunta, 'user-message');
    document.getElementById('pregunta').value = '';
    ultimaPregunta = pregunta;

    const respuestaCortesia = obtenerRespuestaCortesia(pregunta);
    if (respuestaCortesia) {
        agregarMensaje(respuestaCortesia, 'bot-message');
        document.getElementById('respuesta-container').classList.add('hidden');
        return;
    }

    const escribiendo = agregarMensaje("Escribiendo...", 'bot-message');

    // Consultar la API para obtener la respuesta
    fetch(`${API_URL}/consultar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: pregunta })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('chat-box').removeChild(escribiendo);
        agregarMensaje(data.respuesta || "No tengo una respuesta para esa pregunta.", 'bot-message');

        if (!data.respuesta) {
            document.getElementById('respuesta-container').classList.remove('hidden');
        } else {
            document.getElementById('respuesta-container').classList.add('hidden');
        }
    })
    .catch(error => {
        document.getElementById('chat-box').removeChild(escribiendo);
        console.error('Error:', error);
        agregarMensaje('Hubo un error al consultar.', 'bot-message');
    });
}

function registrarRespuesta() {
    const respuesta = document.getElementById('nueva-respuesta').value.trim();
    if (!respuesta) {
        alert('Por favor, ingresa una respuesta válida.');
        return;
    }

    fetch(`${API_URL}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: ultimaPregunta, respuesta: respuesta })
    })
    .then(() => {
        alert('Respuesta guardada con éxito.');
        document.getElementById('respuesta-container').classList.add('hidden');
        document.getElementById('nueva-respuesta').value = '';
        agregarMensaje(`Nueva respuesta guardada: ${respuesta}`, 'bot-message');
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function cancelarRegistro() {
    document.getElementById('respuesta-container').classList.add('hidden');
    document.getElementById('nueva-respuesta').value = '';
}

function agregarMensaje(texto, clase) {
    const chatBox = document.getElementById('chat-box');
    const mensaje = document.createElement('div');
    mensaje.textContent = texto;
    mensaje.classList.add('message', clase);
    chatBox.appendChild(mensaje);
    chatBox.scrollTop = chatBox.scrollHeight;
    return mensaje;
}
