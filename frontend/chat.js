const API_URL = 'https://agenteinteligente.onrender.com/api/preguntas';
let ultimaPregunta = "";
let ultimaRespuesta = "";

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

    // Si la pregunta es la misma que la última, responder con historial
    if (pregunta === ultimaPregunta) {
        agregarMensaje(`🔄 Como te dije anteriormente, lo que preguntaste fue: ❓"${ultimaPregunta}"\n✅ Y la respuesta es: 📝"${ultimaRespuesta}"`, 'bot-message');
        return;
    }

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
        ultimaRespuesta = data.respuesta || "No tengo una respuesta para esa pregunta.";
        agregarMensaje(ultimaRespuesta, 'bot-message');

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
        agregarMensaje(`Nueva respuesta guardada: "${respuesta}"`, 'bot-message');
        ultimaRespuesta = respuesta; // Guardar la nueva respuesta en el historial
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

