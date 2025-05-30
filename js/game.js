const salaId = 1;
const jugadorId = localStorage.getItem("jugadorId");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const palabraElemento = document.getElementById("palabra");
const cronometroElemento = document.getElementById("cronometro");
const limpiarBtn = document.getElementById("limpiar");

const cw = canvas.width = 500;
const ch = canvas.height = 500;
ctx.lineJoin = "round";
ctx.lineWidth = 3;

let dibujar = false;
let puntos = [];
let factorDeAlisamiento = 5;
let Trazados = [];

// ✅ Obtener palabra de la sala
fetch(`https://compurillo01db-production.up.railway.app/salas/${salaId}`)
  .then(res => res.json())
  .then(data => {
    palabraElemento.textContent = data.palabra;
  })
  .catch(err => console.error("Error al obtener palabra:", err));

// 🎨 Dibujar
canvas.addEventListener('mousedown', () => {
  dibujar = true;
  puntos.length = 0;
  ctx.beginPath();
});

canvas.addEventListener('mouseup', redibujarTrazados, false);
canvas.addEventListener('mouseout', redibujarTrazados, false);

canvas.addEventListener('mousemove', (evt) => {
  if (dibujar) {
    const m = oMousePos(canvas, evt);
    puntos.push(m);
    ctx.lineTo(m.x, m.y);
    ctx.stroke();
  }
}, false);

// 🧹 Limpiar
limpiarBtn.addEventListener('click', () => {
  dibujar = false;
  ctx.clearRect(0, 0, cw, ch);
  Trazados.length = 0;
  puntos.length = 0;
});

// Utilidades para suavizar líneas
function reducirArray(n, elArray) {
  let nuevoArray = elArray.filter((_, i) => i % n === 0);
  nuevoArray.push(elArray[elArray.length - 1]);
  Trazados.push(nuevoArray);
}

function calcularPuntoDeControl(ry, a, b) {
  return {
    x: (ry[a].x + ry[b].x) / 2,
    y: (ry[a].y + ry[b].y) / 2
  };
}

function alisarTrazado(ry) {
  if (ry.length > 1) {
    const ultimoPunto = ry.length - 1;
    ctx.beginPath();
    ctx.moveTo(ry[0].x, ry[0].y);

    for (let i = 1; i < ry.length - 2; i++) {
      let pc = calcularPuntoDeControl(ry, i, i + 1);
      ctx.quadraticCurveTo(ry[i].x, ry[i].y, pc.x, pc.y);
    }

    ctx.quadraticCurveTo(
      ry[ultimoPunto - 1].x,
      ry[ultimoPunto - 1].y,
      ry[ultimoPunto].x,
      ry[ultimoPunto].y
    );
    ctx.stroke();
  }
}

function redibujarTrazados() {
  dibujar = false;
  ctx.clearRect(0, 0, cw, ch);
  reducirArray(factorDeAlisamiento, puntos);
  Trazados.forEach(trazado => alisarTrazado(trazado));
}

function oMousePos(canvas, evt) {
  let rect = canvas.getBoundingClientRect();
  return {
    x: Math.round(evt.clientX - rect.left),
    y: Math.round(evt.clientY - rect.top)
  };
}

let tiempoRestante = 10;
cronometroElemento.textContent = `Tiempo: ${tiempoRestante}s`;

let intervaloTiempo = setInterval(() => {
  tiempoRestante--;
  cronometroElemento.textContent = `Tiempo: ${tiempoRestante}s`;

  if (tiempoRestante <= 0) {
    clearInterval(intervaloTiempo);
    cronometroElemento.textContent = "¡Tiempo terminado!";
    enviarDibujo();
  }
}, 1000);

// ✅ Enviar el dibujo en base64 al backend
function enviarDibujo() {
  redibujarTrazados(); // 👈 importante para capturar el dibujo suavizado

  const imagenBase64 = canvas.toDataURL("image/png");

  console.log("Base64 generado:", imagenBase64.substring(0, 100));

  fetch("https://compurillo01db-production.up.railway.app/dibujos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jugadorId: Number(jugadorId),
      salaId: salaId,
      imagenBase64: imagenBase64
    })
  })
    .then(() => {
      console.log("Dibujo enviado correctamente.");
      console.log("Enviando dibujo desde jugadorId:", jugadorId);
      setTimeout(() => {
        console.log("Consultando estado de la sala:", salaId);
        const esperarVotacion = setInterval(() => {
          fetch(`https://compurillo01db-production.up.railway.app/salas/${salaId}`)
            .then(res => res.json())
            .then(data =>{
              console.log("Estado actual de la sala:", data.estado);

              if (data.estado === "VOTANDO") {
                clearInterval(esperarVotacion);
                window.location.href = "vote.html"
              }
            })
        })
      }, 2000);
    })
    .catch(err => {
      console.error("Error al enviar dibujo:", err);
    });
}

