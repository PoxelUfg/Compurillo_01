const salaId = 1; // TODO: luego puedes obtenerlo dinámicamente desde el backend

const listaJugadores = document.getElementById("listaJugadores");
const jugarBtn = document.getElementById("jugarBtn");


// Crear jugador al entrar
const nombreJugador = prompt("Ingresa tu nombre:");

fetch("https://compurillo01db-production.up.railway.app/jugadores", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    nombre: nombreJugador,
    salaId: salaId
  })
})
  .then(res => res.json())
  .then(data => {
    console.log("Jugador creado:", data);
    localStorage.setItem("jugadorId", data.id); // Guardar ID del jugador
    obtenerJugadores(); // Actualizar lista
  })
  .catch(err => console.error("Error al crear jugador:", err));

// Obtener lista de jugadores
function obtenerJugadores() {
  fetch(`https://compurillo01db-production.up.railway.app/jugadores?salaId=${salaId}`)
    .then(res => res.json())
    .then(jugadores => {
      listaJugadores.innerHTML = "";
      jugadores.forEach(jugador => {
        const li = document.createElement("li");
        li.textContent = jugador.nombre;
        listaJugadores.appendChild(li);
      });
    });
}

// Evento de "Jugar"
jugarBtn.addEventListener("click", () => {
  // TODO: POST para cambiar estado de la sala a JUGANDO
  fetch(`https://compurillo01db-production.up.railway.app/salas/${salaId}/estado`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ estado: "JUGANDO" })
  })
    .then(() => {
      window.location.href = "game.html";
    })
    .catch(err => console.error("Error al cambiar estado:", err));
});

setInterval(() => {
  fetch(`https://compurillo01db-production.up.railway.app/salas/${salaId}`)
    .then(res => res.json())
    .then(data => {
      if (data.estado === "JUGANDO") {
        window.location.href = "game.html";
      }
    });
}, 2000); 

setInterval(obtenerJugadores, 2000);