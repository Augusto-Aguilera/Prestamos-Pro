// Cargar datos desde LocalStorage
let prestamos = JSON.parse(localStorage.getItem('patric_prestamos')) || [];

// Función para registrar nuevo préstamo
function agregarPrestamo() {
    const nombre = document.getElementById('nombre').value;
    const monto = document.getElementById('monto').value;
    const frecuencia = document.getElementById('frecuencia').value;
    const vencimiento = document.getElementById('vencimiento').value;
    const interes = document.getElementById('interes').value;
    const empeno = document.getElementById('empeno').value || "Ninguno";

    if(!nombre || !monto || !vencimiento) {
        alert("¡Error de PATRIC SOFT! Completá Nombre, Monto y Vencimiento.");
        return;
    }

    const nuevo = {
        id: Date.now(),
        nombre: nombre.trim(),
        monto: parseFloat(monto),
        saldo: parseFloat(monto),
        frecuencia,
        vencimiento,
        interes: parseFloat(interes) || 0,
        empeno: empeno.trim()
    };

    prestamos.push(nuevo);
    guardarYMostrar();
    limpiarFormulario();
}

// Función para cobrar cuota
function abonar(id) {
    const index = prestamos.findIndex(p => p.id === id);
    const montoAbono = prompt(`Cobro para ${prestamos[index].nombre}\nSaldo Pendiente: $${prestamos[index].saldo}\n¿Cuánto paga hoy?`);
    
    if (montoAbono === null || montoAbono === "" || isNaN(montoAbono)) return;
    
    const abonoNum = parseFloat(montoAbono);
    if (abonoNum > prestamos[index].saldo) {
        alert("¡Ojo! El abono no puede superar la deuda.");
        return;
    }

    prestamos[index].saldo -= abonoNum;
    guardarYMostrar();
}

// Función para eliminar cliente
function eliminar(id) {
    if(confirm("¿Seguro que querés eliminar este cliente de la cartera?")) {
        prestamos = prestamos.filter(p => p.id !== id);
        guardarYMostrar();
    }
}

// FUNCIÓN DE AVISO MASIVO (Solo abre para los que están en alerta)
function avisoMasivo() {
    const hoy = new Date();
    const paraAvisar = prestamos.filter(p => {
        const fechaVenc = new Date(p.vencimiento + "T00:00:00");
        const diffTiempo = fechaVenc - hoy;
        const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));
        return diffDias <= 3 && diffDias >= 0 && p.saldo > 0;
    });

    if (paraAvisar.length === 0) return;

    alert(`PATRIC SOFT preparará ${paraAvisar.length} recordatorios de WhatsApp.`);
    
    paraAvisar.forEach(p => {
        const msg = `Hola ${p.nombre}, te recordamos de PATRIC SOFT que tu pago ${p.frecuencia.toLowerCase()} vence el ${p.vencimiento}. Saldo: $${p.saldo}.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });
}

// Función Renderizadora
function guardarYMostrar() {
    localStorage.setItem('patric_prestamos', JSON.stringify(prestamos));
    
    const containerGral = document.getElementById('listaPrestamos');
    const containerAlertas = document.getElementById('listaAlertas');
    const alertasSection = document.getElementById('alertasSection');
    
    containerGral.innerHTML = "";
    containerAlertas.innerHTML = "";
    
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    let hayAlertas = false;

    prestamos.forEach(p => {
        // Cálculo de días para alertas
        const fechaVenc = new Date(p.vencimiento + "T00:00:00");
        const diffTiempo = fechaVenc - hoy;
        const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));

        // 1. CARGA DE ALERTAS (Visual solamente)
        if (diffDias <= 3 && diffDias >= 0 && p.saldo > 0) {
            hayAlertas = true;
            containerAlertas.innerHTML += `
                <div class="card-alerta-mini">
                    <h5>${p.nombre.toUpperCase()}</h5>
                    <p>Faltan: <b>${diffDias} días</b></p>
                    <p>Debe: <b>$${p.saldo}</b></p>
                </div>
            `;
        }

        // 2. CARGA DE CARTERA GENERAL (Gestión total)
        let colorStatus = "#2ecc71"; // Verde
        if (p.vencimiento < hoyStr && p.saldo > 0) colorStatus = "#e74c3c"; // Rojo
        else if (p.vencimiento === hoyStr && p.saldo > 0) colorStatus = "#f1c40f"; // Amarillo
        if (p.saldo === 0) colorStatus = "#00ff88"; // Pagado

        containerGral.innerHTML += `
            <div class="prestamo-card" style="border-right: 5px solid ${colorStatus}">
                <div class="badge-frecuencia">${p.frecuencia}</div>
                <div class="card-header">
                    <h4>${p.nombre.toUpperCase()}</h4>
                    <span style="font-size:0.7rem; color:#666;">Original: $${p.monto}</span>
                </div>
                <div class="card-body">
                    <div class="saldo-display">SALDO: <span>$${p.saldo}</span></div>
                    <p><i class="far fa-calendar-alt"></i> Próximo Venc: <b>${p.vencimiento}</b></p>
                    <p><i class="fas fa-hand-holding-usd"></i> Empeño: <b>${p.empeno}</b></p>
                </div>
                <div class="card-actions">
                    <button onclick="abonar(${p.id})" class="btn-pago">COBRAR</button>
                    <a href="https://wa.me/?text=Hola%20${p.nombre},%20tu%20saldo%20actual%20es%20$${p.saldo}" class="btn-ws" target="_blank"><i class="fab fa-whatsapp"></i></a>
                    <button onclick="eliminar(${p.id})" class="btn-del"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    alertasSection.style.display = hayAlertas ? "block" : "none";
}

function limpiarFormulario() {
    document.getElementById('nombre').value = "";
    document.getElementById('monto').value = "";
    document.getElementById('vencimiento').value = "";
    document.getElementById('interes').value = "";
    document.getElementById('empeno').value = "";
}

// Iniciar app
window.onload = guardarYMostrar;
