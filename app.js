const startScanBtn = document.getElementById('start-scan');
const stopScanBtn = document.getElementById('stop-scan');
const statusBox = document.getElementById('status');
const resultBox = document.getElementById('result');
const manualForm = document.getElementById('manual-form');
const barcodeInput = document.getElementById('barcode-input');

let html5QrCode;
let scannerRunning = false;
let products = [];

const LABELS = {
  barcode: 'Código',
  nombre: 'Nombre',
  categoria: 'Categoría',
  precio: 'Precio',
  stock: 'Stock'
};

init();

async function init() {
  await loadDatabase();
  bindEvents();
}

function bindEvents() {
  startScanBtn.addEventListener('click', startScanner);
  stopScanBtn.addEventListener('click', stopScanner);

  manualForm.addEventListener('submit', (event) => {
    event.preventDefault();
    lookupBarcode(barcodeInput.value.trim());
  });
}

async function loadDatabase() {
  try {
    const response = await fetch('./db.json');
    if (!response.ok) {
      throw new Error('No se pudo cargar db.json');
    }
    products = await response.json();
    setStatus(`Base de datos cargada (${products.length} registros).`, 'success');
  } catch (error) {
    setStatus('Error cargando base de datos local. Revisa db.json.', 'error');
  }
}

async function startScanner() {
  if (scannerRunning) {
    return;
  }

  if (typeof Html5Qrcode === 'undefined') {
    setStatus('No se pudo cargar la librería de escaneo.', 'error');
    return;
  }

  html5QrCode = new Html5Qrcode('reader');

  try {
    await html5QrCode.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 260, height: 120 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E
        ]
      },
      (decodedText) => {
        barcodeInput.value = decodedText;
        lookupBarcode(decodedText);
      }
    );

    scannerRunning = true;
    startScanBtn.disabled = true;
    stopScanBtn.disabled = false;
    setStatus('Escáner activo. Apunta la cámara al código de barras.', 'success');
  } catch (error) {
    setStatus('No se pudo iniciar la cámara. Verifica permisos del navegador.', 'error');
  }
}

async function stopScanner() {
  if (!scannerRunning || !html5QrCode) {
    return;
  }

  await html5QrCode.stop();
  await html5QrCode.clear();
  scannerRunning = false;
  startScanBtn.disabled = false;
  stopScanBtn.disabled = true;
  setStatus('Escáner detenido.', '');
}

function lookupBarcode(rawCode) {
  const barcode = String(rawCode || '').trim();
  if (!barcode) {
    setStatus('Introduce o escanea un código válido.', 'error');
    hideResult();
    return;
  }

  const product = products.find((item) => item.barcode === barcode);

  if (!product) {
    setStatus(`No se encontró el código ${barcode} en la base de datos.`, 'error');
    hideResult();
    return;
  }

  setStatus(``);
  renderResult(product);
}

function renderResult(product) {
  resultBox.innerHTML = '';

  const dd = document.createElement('div');
  dd.textContent = String(product.numero);

  // Estilos comunes
  dd.style.padding = '20px';
  dd.style.fontSize = '3rem';
  dd.style.fontWeight = 'bold';
  dd.style.borderRadius = '8px';
  dd.style.display = 'inline-block';
  dd.style.textAlign = 'center';
  dd.style.minWidth = '80px';

  // Color según el campo "color"
  if (product.color === "Amarillo") {
    dd.style.backgroundColor = '#FFFF00';
    dd.style.color = '#000'; // negro para que se lea sobre amarillo
  } else {
    dd.style.backgroundColor = '#FF0000';
    dd.style.color = '#fff'; // blanco para que se lea sobre rojo
  }

  resultBox.appendChild(dd);
  resultBox.hidden = false;
}

function hideResult() {
  resultBox.hidden = true;
  resultBox.innerHTML = '';
}

function setStatus(message, type = '') {
  statusBox.textContent = message;
  statusBox.className = 'status';
  if (type) {
    statusBox.classList.add(type);
  }
}
