let prestamos = JSON.parse(localStorage.getItem('patric_prestamos')) || [];

// Función para registrar un nuevo préstamo
function agregarPrestamo() {
    const nombre = document.getElementById('nombre').value;
    const monto = document.getElementById('monto').value;
    const frecuencia = document.getElementById('frecuencia').value;
    const vencimiento = document.getElementById('vencimiento').value;
    const interes = document.getElementById('interes').value;
    const empeno = document.getElementById('empeno').value || "Ninguno";

    // Validación básica
    if(!nombre || !monto || !vencimiento) {
        alert("¡Atención! Por favor completá nombre, monto y fecha de vencimiento.");
        return;
    }

    const nuevoPrestamo = {
        id: Date.now(),
        nombre: nombre.trim(),
        monto: parseFloat(monto),
        saldo: parseFloat(monto), // El saldo inicial es igual al monto total
        frecuencia: frecuencia,
        vencimiento: vencimiento,
        interes: parseFloat(interes) || 0,
        empeno: empeno.trim()
    };

    // Guardar en el array
    prestamos.push(nuevoPrestamo);
    
    // Guardar en LocalStorage y actualizar la vista
    guardarYMostrar();
    
    // Limpiar los campos para el próximo registro
    limpiarFormulario();
}

// Función para registrar un pago (descontar del saldo)
function abonar(id) {
    const index = prestamos.findIndex(p => p.id === id);
    const cliente = prestamos[index];

    const montoAbono = prompt(`Registrar pago para ${cliente.nombre}\nSaldo actual: $${cliente.saldo}\n¿Cuánto está pagando hoy? ($)`);
    
    if (montoAbono === null || montoAbono === "" || isNaN(montoAbono)) return;

    const abonoNum = parseFloat(montoAbono);

    if (abonoNum <= 0) {
        alert("El monto debe ser mayor a cero.");
        return;
    }

    if (abonoNum > cliente.saldo) {
        alert("¡Error! El abono no puede ser superior al saldo pendiente.");
        return;
    }

    // Proceso de descuento
    prestamos[index].saldo -= abonoNum;
    
    if (prestamos[index].saldo === 0) {
        alert("✅ ¡FELICITACIONES! El crédito de " + cliente.nombre + " ha sido cancelado en su totalidad.");
    }

    guardarYMostrar();
}

// Función para eliminar un registro
function eliminar(id) {
    if(confirm("¿Estás seguro de eliminar este préstamo? Esta acción no se puede deshacer.")) {
        prestamos = prestamos.filter(p => p.id !== id);
        guardarYMostrar();
    }
}

// Función principal para renderizar las tarjetas en pantalla
function guardarYMostrar() {
    // Persistencia de datos
    localStorage.setItem('patric_prestamos', JSON.stringify(prestamos));
    
    const container = document.getElementById('listaPrestamos');
    container.innerHTML = "";

    // Obtenemos la fecha de hoy para el control semafórico
    const hoy = new Date().toISOString().split('T')[0];

    prestamos.forEach(p => {
        // Lógica de colores de estado
        let colorStatus = "#2ecc71"; // Verde (Al día)
        if (p.vencimiento < hoy && p.saldo > 0) {
            colorStatus = "#e74c3c"; // Rojo (Vencido)
        } else if (p.vencimiento === hoy && p.saldo > 0) {
            colorStatus = "#f1c40f"; // Amarillo (Vence hoy)
        }
        
        // Si el saldo es 0, siempre es verde brillante (Cancelado)
        if (p.saldo === 0) colorStatus = "#00ff88";

        container.innerHTML += `
            <div class="prestamo-card" style="border-right: 5px solid ${colorStatus}">
                <div class="badge-frecuencia">${p.frecuencia}</div>
                
                <div class="card-header">
                    <h4>${p.nombre.toUpperCase()}</h4>
                    <span class="monto-total">Crédito inicial: $${p.monto}</span>
                </div>

                <div class="card-body">
                    <div class="saldo-display">
                        SALDO PENDIENTE: <span>$${p.saldo}</span>
                    </div>
                    <p><i class="far fa-calendar-alt"></i> Próx. Vencimiento: <b>${p.vencimiento}</b></p>
                    <p><i class="fas fa-percentage"></i> Interés Mora: <b>${p.interes}%</b></p>
                    <p><i class="fas fa-hand-holding-usd"></i> Empeño: <b>${p.empeno}</b></p>
                </div>

                <div class="card-actions">
                    <button onclick="abonar(${p.id})" class="btn-pago">
                        <i class="fas fa-cash-register"></i> COBRAR
                    </button>
                    
                    <a href="https://wa.me/?text=Hola%20${p.nombre},%20desde%20PATRIC%20SOFT%20te%20recordamos%20que%20tu%20pago%20${p.frecuencia.toLowerCase()}%20vence%20el%20${p.vencimiento}.%20Tu%20saldo%20actual%20es%20de%20$${p.saldo}." 
                       target="_blank" 
                       class="btn-ws">
                        <i class="fab fa-whatsapp"></i>
                    </a>

                    <button onclick="eliminar(${p.id})" class="btn-del">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
}

// Función para limpiar los campos del formulario
function limpiarFormulario() {
    document.getElementById('nombre').value = "";
    document.getElementById('monto').value = "";
    document.getElementById('vencimiento').value = "";
    document.getElementById('interes').value = "";
    document.getElementById('empeno').value = "";
    document.getElementById('frecuencia').selectedIndex = 0;
}

// Ejecutar al cargar la página
window.onload = guardarYMostrar;