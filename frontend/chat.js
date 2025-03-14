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

    // Detectar si el usuario pregunta por la hora, fecha o día
    const respuestaTiempo = obtenerTiempo(pregunta);
    if (respuestaTiempo) {
        agregarMensaje(respuestaTiempo, 'bot-message');
        return;
    }

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

// Función para detectar preguntas sobre la hora, el día o la fecha actual
function obtenerTiempo(pregunta) {
    const fechaActual = new Date();
    const hora = fechaActual.getHours().toString().padStart(2, '0');
    const minutos = fechaActual.getMinutes().toString().padStart(2, '0');
    const segundos = fechaActual.getSeconds().toString().padStart(2, '0');
    const diaSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][fechaActual.getDay()];
    const dia = fechaActual.getDate();
    const mes = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][fechaActual.getMonth()];
    const año = fechaActual.getFullYear();

    if (pregunta.includes("hora") || pregunta.includes("qué hora es")) {
        return `🕒 La hora actual es ${hora}:${minutos}:${segundos}.`;
    }
    if (pregunta.includes("qué día es") || pregunta.includes("qué día estamos") || pregunta.includes("día actual")) {
        return `📅 Hoy es ${diaSemana}.`;
    }
    if (pregunta.includes("fecha") || pregunta.includes("cuál es la fecha de hoy")) {
        return `📆 La fecha de hoy es ${dia} de ${mes} del ${año}.`;
    }
    if (pregunta.includes("año") || pregunta.includes("qué año es")) {
        return `🌍 Estamos en el año ${año}.`;
    }

    return null; // No es una pregunta relacionada con el tiempo
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


