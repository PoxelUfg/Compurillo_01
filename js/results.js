document.addEventListener("DOMContentLoaded", () => {
  const salaId = 1;

  const nombreElem = document.getElementById("nombreGanador");
  const puntuacionElem = document.getElementById("puntuacionGanador");
  const volverBtn = document.getElementById("volverLobby");

  fetch(`http://localhost:3000/resultados?salaId=${salaId}`)
    .then(res => res.json())
    .then(data => {
      console.log("Resultado recibido:", data);

      if (data && data.ganador && data.ganador.jugador && data.ganador.promedio != null) {
        nombreElem.textContent = data.ganador.jugador.nombre;
        puntuacionElem.textContent = Number(data.ganador.promedio).toFixed(2);
      } else {
        nombreElem.textContent = "Sin ganador aún";
        puntuacionElem.textContent = "0";
      }
    })
    .catch(err => {
      console.error("Error al obtener resultados:", err);
      nombreElem.textContent = "Error al obtener resultados";
      puntuacionElem.textContent = "-";
    });

  volverBtn.addEventListener("click", () => {
    window.location.href = "lobby.html";
  });
});
