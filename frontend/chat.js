// const API_URL = 'http://localhost:8080/api/preguntas';

const API_URL = 'https://agenteinteligente.onrender.com/api/preguntas';
let ultimaPregunta = "";
let historialPreguntas = {}; // Objeto para almacenar preguntas y respuestas previas

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

    // Verificar si la pregunta ya tiene una respuesta en el historial
    if (historialPreguntas[pregunta]) {
        const respuestaAnterior = historialPreguntas[pregunta];
        agregarMensaje(`Como te lo dije anteriormente, el significado de "${pregunta}" es🧐: ${respuestaAnterior}`, 'bot-message');
        return;
    }

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

        if (data.respuesta) {
            // Guardar en el historial solo si la respuesta es válida
            historialPreguntas[pregunta] = data.respuesta;
            agregarMensaje(data.respuesta, 'bot-message');
            document.getElementById('respuesta-container').classList.add('hidden');
        } else {
            // Si no hay respuesta, preguntar nuevamente
            agregarMensaje("No tengo una respuesta para esa pregunta. ¿Podrías ayudarme?", 'bot-message');
            document.getElementById('respuesta-container').classList.remove('hidden');
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
        
        // Guardar la nueva respuesta en el historial
        historialPreguntas[ultimaPregunta] = respuesta;
        
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

