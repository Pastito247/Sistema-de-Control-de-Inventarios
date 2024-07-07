document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#inventario-form');
    const movimientosTableBody = document.querySelector('#seguimiento-movimientos tbody');
    const alertasStockList = document.querySelector('#alertas-stock ul');
    const cancelarEdicionBtn = document.querySelector('#cancelar-edicion');
    const stockThreshold = 5; // Umbral para alertas de stock bajo

    let inventario = [];
    let editando = false;
    let editItemId = null;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const descripcion = document.querySelector('#descripcion').value;
        const numeroSerie = document.querySelector('#numero-serie').value;
        const ubicacion = document.querySelector('#ubicacion').value;
        const fecha = new Date().toLocaleString();

        if (editando) {
            const item = inventario.find(item => item.id === editItemId);
            item.descripcion = descripcion;
            item.numeroSerie = numeroSerie;
            item.ubicacion = ubicacion;
            item.fecha = fecha;

            actualizarTabla();
            cancelarEdicion();
        } else {
            const id = Date.now();
            const item = { id, descripcion, numeroSerie, ubicacion, fecha };
            inventario.push(item);

            agregarMovimiento(item);
        }

        verificarStockBajo();
        form.reset();
    });

    cancelarEdicionBtn.addEventListener('click', cancelarEdicion);

    function agregarMovimiento(item) {
        const row = document.createElement('tr');
        row.dataset.id = item.id;
        row.innerHTML = `
            <td>${item.descripcion}</td>
            <td>${item.numeroSerie}</td>
            <td>${item.ubicacion}</td>
            <td>${item.fecha}</td>
            <td>
                <button class="editar">Editar</button>
                <button class="eliminar">Eliminar</button>
            </td>
        `;
        movimientosTableBody.appendChild(row);
    }

    function actualizarTabla() {
        movimientosTableBody.innerHTML = '';
        inventario.forEach(item => agregarMovimiento(item));
    }

    function cancelarEdicion() {
        editando = false;
        editItemId = null;
        form.reset();
        cancelarEdicionBtn.style.display = 'none';
        form.querySelector('button[type="submit"]').textContent = 'Registrar';
    }

    movimientosTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('editar')) {
            const row = event.target.closest('tr');
            const id = parseInt(row.dataset.id);
            const item = inventario.find(item => item.id === id);

            document.querySelector('#descripcion').value = item.descripcion;
            document.querySelector('#numero-serie').value = item.numeroSerie;
            document.querySelector('#ubicacion').value = item.ubicacion;
            editItemId = id;
            editando = true;

            cancelarEdicionBtn.style.display = 'inline';
            form.querySelector('button[type="submit"]').textContent = 'Actualizar';
        }

        if (event.target.classList.contains('eliminar')) {
            const row = event.target.closest('tr');
            const id = parseInt(row.dataset.id);
            inventario = inventario.filter(item => item.id !== id);

            row.remove();
            verificarStockBajo();
        }
    });

    function verificarStockBajo() {
        alertasStockList.innerHTML = ''; // Limpiar alertas anteriores

        const descripcionCounts = inventario.reduce((counts, item) => {
            counts[item.descripcion] = (counts[item.descripcion] || 0) + 1;
            return counts;
        }, {});

        for (const descripcion in descripcionCounts) {
            if (descripcionCounts[descripcion] < stockThreshold) {
                const alertItem = document.createElement('li');
                alertItem.textContent = `Alerta: Bajo stock de "${descripcion}" (${descripcionCounts[descripcion]} unidades)`;
                alertasStockList.appendChild(alertItem);
            }
        }
    }
});
