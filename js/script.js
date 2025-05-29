var limpiar = document.getElementById("limpiar");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var cronometroElemento = document.getElementById("cronometro");
var tiempoRestante = 60; // en segundos
var intervaloTiempo = null; // para guardar el setInterval


// Palabra nueva
var palabraElemento = document.getElementById("palabra");
var nuevaPalabraBtn = document.getElementById("nuevaPalabra");

var palabras = [
    "Monitor", "Teclado", "CPU", "Mouse", "Router", "Placa Base", 
    "Memoria RAM", "Disco Duro", "Webcam", "Impresora", 
    "Fuente de Poder", "Tarjeta Gráfica", "Ventilador", "Audífonos"
];

// Tu sistema original
var cw = canvas.width = 500, cx = cw / 2;
var ch = canvas.height = 500, cy = ch / 2;

var dibujar = false;
var factorDeAlisamiento = 5;
var Trazados = [];
var puntos = [];

// ctx.lineJoin = "round";
ctx.lineWidth = 3;

/* Evento para limpiar el canvas */
limpiar.addEventListener('click', function() {
    dibujar = false;
    ctx.clearRect(0, 0, cw, ch); // Se limpia el canvas
    Trazados.length = 0;         // Se vacía el historial de trazos
    puntos.length = 0;           // Se vacía el historial de puntos
}, false);

/* Evento para comenzar a dibujar */
canvas.addEventListener('mousedown', function() {
    dibujar = true;
    puntos.length = 0;
    ctx.beginPath();
}, false);

/* Evento para terminar de dibujar */
canvas.addEventListener('mouseup', redibujarTrazados, false);
canvas.addEventListener('mouseout', redibujarTrazados, false);

/* Evento para dibujar mientras se mueve el mouse */
canvas.addEventListener('mousemove', function(evt){
    if (dibujar) {
        var m = oMousePos(canvas, evt); // Obtener posición del mouse
        puntos.push(m);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
    }
}, false);

/* Función para reducir puntos */
function reducirArray(n, elArray){
    let nuevoArray = elArray.filter((_ ,i) => i % n === 0);
    nuevoArray.push(elArray[elArray.length - 1]);
    Trazados.push(nuevoArray);
}

/* Función para calcular punto de control */
function calcularPuntoDeControl(ry, a, b) {
    return {
        x: (ry[a].x + ry[b].x) / 2,
        y: (ry[a].y + ry[b].y) / 2
    };
}

/* Función para alisar trazado */
function alisarTrazado(ry) {
    if (ry.length > 1) {
        var ultimoPunto = ry.length - 1;
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

/* Función para redibujar los trazados */
function redibujarTrazados() {
    dibujar = false;
    ctx.clearRect(0, 0, cw, ch);
    reducirArray(factorDeAlisamiento, puntos);
    Trazados.forEach(trazado => alisarTrazado(trazado));
}

/* Función para obtener la posición del mouse */
function oMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: Math.round(evt.clientX - rect.left),
        y: Math.round(evt.clientY - rect.top)
    };
}

/* Evento para elegir nueva palabra */
nuevaPalabraBtn.addEventListener('click', function() {
    if (intervaloTiempo !== null) return; // Si ya hay un juego en curso, no hacer nada

    var palabraAleatoria = palabras[Math.floor(Math.random() * palabras.length)];
    palabraElemento.textContent = "Dibuja: " + palabraAleatoria;

    // Desactivar botón para no cambiar tema
    nuevaPalabraBtn.disabled = true;

    // Reiniciar cronómetro
    tiempoRestante = 60;
    cronometroElemento.textContent = "Tiempo: " + tiempoRestante + "s";

    intervaloTiempo = setInterval(function() {
        tiempoRestante--;
        cronometroElemento.textContent = "Tiempo: " + tiempoRestante + "s";

        if (tiempoRestante <= 0) {
            clearInterval(intervaloTiempo);
            intervaloTiempo = null;
            cronometroElemento.textContent = "¡Tiempo terminado!";
            nuevaPalabraBtn.disabled = false; // Reactivar botón
        }
    }, 1000); // cada segundo
});
