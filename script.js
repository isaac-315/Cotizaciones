let itemCounter = 1;
let itemsBD = [];

// Cargar ítems desde la base de datos
async function cargarItems() {
  try {
    const response = await fetch('http://localhost:3000/api/get_items');
    const data = await response.json();
    if (data.error) {
      console.error("Error desde la API:", data.error);
      return;
    }
    itemsBD = data;
  } catch (error) {
    console.error("Error al cargar ítems:", error);
  }
}

// Función para obtener los ítems ya seleccionados en otras filas
function obtenerSeleccionados(selectActual = null) {
  const selects = document.querySelectorAll('.descripcion');
  return Array.from(selects)
    .filter(s => s !== selectActual)
    .map(s => s.value)
    .filter(v => v !== '');
}

// Función para crear opciones del select (filtrando los ya seleccionados)
function crearOpcionesHTML(selectActual = null) {
  const seleccionados = obtenerSeleccionados(selectActual);
  return itemsBD
    .filter(item => !seleccionados.includes(item.itm_descripcion))
    .map(item => `<option value="${item.itm_descripcion}" data-precio="${item.itm_precio}">${item.itm_descripcion}</option>`)
    .join('');
}

// Función para renumerar ítems
function renumerarItems() {
  const filas = document.querySelectorAll('#itemsBody tr td:first-child');
  filas.forEach((celda, index) => {
    celda.textContent = index + 1;
  });
}

// Función para actualizar todos los selects
function actualizarSelects() {
  const selects = document.querySelectorAll('.descripcion');
  selects.forEach(select => {
    const valorAnterior = select.value;
    select.innerHTML = `<option value="" selected disabled>Seleccionar...</option>` + crearOpcionesHTML(select);
    select.value = valorAnterior;
  });
}

// Función para agregar un nuevo ítem
function agregarItem() {
  const tbody = document.getElementById('itemsBody');
  const row = document.createElement('tr');

  // Obtener el siguiente número disponible
  const numeroItem = getSiguienteNumeroItem();

  row.innerHTML = `
    <td>${numeroItem}</td>
    <td>
      <select class="descripcion">
        <option value="" selected disabled>Seleccionar...</option>
        ${crearOpcionesHTML(null)}
      </select>
    </td>
    <td><input type="number" class="cantidad" value="1" min="1"></td>
    <td><input type="number" class="precio" value="0" min="0" step="0.01"></td>
    <td><button class="eliminar-item">Eliminar</button></td>
  `;

  const select = row.querySelector('.descripcion');
  const precioInput = row.querySelector('.precio');

  // Evento para cambiar el precio al seleccionar un ítem
  select.addEventListener('change', () => {
    const selectedOption = select.options[select.selectedIndex];
    const precio = selectedOption.getAttribute('data-precio');
    const precioNumerico = parseFloat(precio);

    if (!isNaN(precioNumerico)) {
      precioInput.value = precioNumerico.toFixed(2);
    } else {
      precioInput.value = '0.00';
    }
    actualizarTotal();
    actualizarSelects();
  });

  // Evento para actualizar total al cambiar cantidad o precio
  precioInput.addEventListener('input', actualizarTotal);
  const cantidadInput = row.querySelector('.cantidad');
  cantidadInput.addEventListener('input', actualizarTotal);

  // Evento para eliminar ítem
  const botonEliminar = row.querySelector('.eliminar-item');
  botonEliminar.addEventListener('click', () => {
    row.remove();
    renumerarItems();
    actualizarTotal();
    actualizarSelects();
  });

  tbody.appendChild(row);
  actualizarTotal();
}

// Función para obtener el siguiente número de ítem disponible
function getSiguienteNumeroItem() {
  const numeros = Array.from(document.querySelectorAll('#itemsBody td:first-child'))
    .map(td => parseInt(td.textContent));
  let num = 1;
  while (numeros.includes(num)) {
    num++;
  }
  return num;
}

// Función para actualizar el total
function actualizarTotal() {
  let total = 0;
  const rows = document.querySelectorAll('#itemsBody tr');

  rows.forEach(row => {
    const cantidad = parseFloat(row.querySelector('.cantidad').value) || 0;
    const precio = parseFloat(row.querySelector('.precio').value) || 0;
    total += cantidad * precio;
  });

  document.getElementById('totalAmount').textContent = total.toFixed(2);
}

// Función para imprimir (versión profesional)
function imprimirCotizacion() {
  // Llenar el contenido imprimible
  const objetoCotizacion = document.getElementById('objetoCotizacion').value;
  document.getElementById('print-objeto-cotizacion').textContent = objetoCotizacion || 'No especificado.';

  const totalAmount = document.getElementById('totalAmount').textContent;
  document.getElementById('print-total-amount').textContent = totalAmount;

  // Limpiar y llenar la tabla de ítems
  const printItemsBody = document.getElementById('print-items-body');
  printItemsBody.innerHTML = '';

  const rows = document.querySelectorAll('#itemsBody tr');
  rows.forEach(row => {
    const item = row.cells[0].textContent;
    const descripcion = row.querySelector('.descripcion').value;
    const cantidad = row.querySelector('.cantidad').value;
    const precio = row.querySelector('.precio').value;
    const subtotal = (parseFloat(cantidad) * parseFloat(precio)).toFixed(2);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item}</td>
      <td>${descripcion}</td>
      <td>${cantidad}</td>
      <td>$${precio}</td>
      <td>$${subtotal}</td>
    `;
    printItemsBody.appendChild(tr);
  });

  // Mostrar el contenedor de impresión
  document.getElementById('printable-content').style.display = 'block';

  // Imprimir
  window.print();

  // Ocultar nuevamente el contenedor
  document.getElementById('printable-content').style.display = 'none';
}

// Event listeners
document.getElementById('agregarItem').addEventListener('click', agregarItem);
document.getElementById('imprimirCotizacion').addEventListener('click', imprimirCotizacion);

// Inicializar con un primer ítem y cargar ítems
document.addEventListener('DOMContentLoaded', async () => {
  await cargarItems();
  agregarItem();
});