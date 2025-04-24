var limpiar = document.getElementById("limpiar");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var cw = canvas.width = 300, cx = cw / 2;
var ch = canvas.height = 300, cy = ch / 2;

var dibujar = false;
var factorDeAlisamiento = 5;
var Trazados = [];
var puntos = [];

ctx.lineJoin = "round";

/* Agregar un evento para limpiar el canvas */
limpiar.addEventListener('click', function() {
    dibujar = false;
    ctx.clearRect(0, 0, cw, ch); // Se limpia el canvas
    Trazados.length = 0;         // Se vacía el historial de trazos
    puntos.length = 0;           // Se vacía el historial de puntos
}, false);

/* Agregar evento para */
canvas.addEventListener('mousedown', function() {
    dibujar = true;
    puntos.length = 0;
    ctx.beginPath();
}, false);

/* Agregar evento para cuando el usuario ha dejado de presionar el ratón */
canvas.addEventListener('mouseup', redibujarTrazados, false);

/* Agregar evento cuando el puntero ha salido del canvas */
canvas.addEventListener('mouseout', redibujarTrazados, false);

/* Agregar evento para el dibujo continuo al mover el ratón */
canvas.addEventListener('mousemove', function(evt){
    if (dibujar) {
        var m = oMousePos(canvas, evt); // Obtener la posición del puntero del ratón
        puntos.push(m); // Almacenar la posición del puntero del ratón en un arreglo
        ctx.lineTo(m.x, m.y); // Dibujar una línea desde el último punto creado hasta el punto actual
        ctx.stroke(); // Crear el dibujo
    }
}, false);

/* Función para reducir la cantidad de puntos en el trazado */
function reducirArray(n, elArray){
    let nuevoArray = elArray.filter((_ ,i) => i % n === 0); // Se filtran los puntos en cada "n" posiciones
    nuevoArray.push(elArray[elArray.length - 1]); // Se agrega el último punto al arreglo
    Trazados.push(nuevoArray);
}

function calcularPuntoDeControl(ry, a, b) {
    return {
        x: (ry[a].x + ry[b].x) / 2,
        y: (ry[a].y + ry[b].y) / 2
    };
}

function alisarTrazado(ry) {
    if (ry.length > 1) { // SE VERIFICA QUE EXISTAN MÁS DE 1 PUNTO PARA REALIZAR EL TRAZADO
        var ultimoPunto = ry.length - 1;
        ctx.beginPath();
        ctx.moveTo(ry[0].x, ry[0].y); // Iniciar el trazado desde el primer punto establecido

        for (let i = 1; i < ry.length - 2; i++) {
            let pc = calcularPuntoDeControl(ry, i, i + 1); // Calcular el punto de control
            ctx.quadraticCurveTo(ry[i].x, ry[i].y, pc.x, pc.y); // Dibujar una curva hasta el punto de control
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
    ctx.clearRect(0, 0, cw, ch); // Limpiar el canvas
    reducirArray(factorDeAlisamiento, puntos); // Reducir la cantidad de puntos
    Trazados.forEach(trazado => alisarTrazado(trazado)); // Suavizar y redibujar los trazos
}

function oMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect(); // Se obtienen los límites del canvas
    return {
        x: Math.round(evt.clientX - rect.left),
        y: Math.round(evt.clientY - rect.top)
    };
}

