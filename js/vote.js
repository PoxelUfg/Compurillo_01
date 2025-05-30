const salaId = 1;
const jugadorId = Number(localStorage.getItem("jugadorId"));

if (!jugadorId) {
  alert("Error: No se encontró jugadorId en localStorage");
  window.location.href = "lobby.html";
}

const canvas = document.getElementById("canvasVoto");
const ctx = canvas.getContext("2d");
const nombreJugadorElem = document.getElementById("nombreJugador");
const enviarVotoBtn = document.getElementById("enviarVoto");
const estrellasElems = document.querySelectorAll("#estrellas span");

canvas.width = 300;
canvas.height = 300;

let dibujos = [];
let indiceActual = 0;
let votoSeleccionado = 0;

// 🚀 Obtener los dibujos de la sala
fetch(`https://compurillo01db-production.up.railway.app/dibujos?salaId=${salaId}`)
  .then(res => res.json())
  .then(data => {
    console.log("Dibujos recibidos:", data);

    dibujos = data.filter(d => d.jugador.id !== jugadorId);

    if (dibujos.length === 0) {
      alert("No hay dibujos de otros jugadores para votar.");
      window.location.href = "results.html";
    } else {
      mostrarDibujoActual();
    }
  })
  .catch(err => {
    console.error("Error al obtener dibujos:", err);
    alert("Hubo un problema al cargar los dibujos.");
  });

function mostrarDibujoActual() {
  const dibujo = dibujos[indiceActual];
  votoSeleccionado = 0;
  enviarVotoBtn.disabled = true;
  actualizarEstrellasVisual();

  if (!dibujo || !dibujo.imagenBase64 || !dibujo.jugador) {
    console.warn("Dibujo inválido o incompleto:", dibujo);
    nombreJugadorElem.textContent = "(Jugador desconocido)";
    avanzar();
    return;
  }

  if (!dibujo.imagenBase64.startsWith("data:image/png;base64,")) {
    console.warn("Imagen base64 no válida:", dibujo.imagenBase64);
    alert("Dibujo inválido o dañado. Saltando...");
    avanzar();
    return;
  }

  const imagen = new Image();
  imagen.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imagen, 0, 0, canvas.width, canvas.height);
  };
  imagen.onerror = () => {
    console.warn("No se pudo cargar la imagen. Saltando...");
    avanzar();
  };

  imagen.src = dibujo.imagenBase64;
  nombreJugadorElem.textContent = dibujo.jugador.nombre;

  console.log(`Mostrando dibujo #${dibujo.id} de ${dibujo.jugador.nombre}`);
}

estrellasElems.forEach((estrella) => {
  estrella.addEventListener("click", () => {
    votoSeleccionado = parseInt(estrella.getAttribute("data-valor"));
    actualizarEstrellasVisual();
    enviarVotoBtn.disabled = false;
  });
});

function actualizarEstrellasVisual() {
  estrellasElems.forEach((estrella) => {
    const valor = parseInt(estrella.getAttribute("data-valor"));
    estrella.style.color = valor <= votoSeleccionado ? "gold" : "gray";
  });
}

enviarVotoBtn.addEventListener("click", () => {
  const dibujoId = dibujos[indiceActual].id;

  fetch("https://compurillo01db-production.up.railway.app/votos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      dibujoId,
      jugadorId,
      estrellas: votoSeleccionado
    })
  })
    .then(() => {
      console.log(`Voto enviado para dibujo ${dibujoId}`);
      avanzar();
    })
    .catch(err => {
      console.error("Error al enviar voto:", err);
      alert("No se pudo enviar tu voto.");
    });
});

function avanzar() {
  indiceActual++;
  if (indiceActual < dibujos.length) {
    mostrarDibujoActual();
  } else {
    console.log("Todos los dibujos han sido votados. Esperando a que los demás terminen...");

    // 🔁 Esperar a que la sala pase a estado RESULTADOS
    const esperarResultados = setInterval(() => {
      fetch(`https://compurillo01db-production.up.railway.app/salas/${salaId}`)
        .then(res => res.json())
        .then(data => {
          if (data.estado === "RESULTADOS") {
            clearInterval(esperarResultados);
            window.location.href = "results.html";
          }
        })
        .catch(err => {
          console.error("Error al verificar estado de la sala:", err);
        });
    }, 2000);
  }
}