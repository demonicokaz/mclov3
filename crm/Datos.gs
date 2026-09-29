/**
 * McLov3 CRM · Estructura del Sheet y utilidades para leer/escribir.
 * ⚠️ No cambies el orden de las columnas en las hojas: el código las ubica por posición.
 *    Sí puedes agregar filas, editar valores y cambiar colores/anchos.
 */

var ESTADOS = ['Recibido', 'En proceso', 'Listo', 'Entregado'];
var METODOS = ['Efectivo', 'Transferencia', 'Tarjeta'];
var ESTADOS_SOLICITUD = ['Nueva', 'Contactada', 'Convertida', 'Descartada'];

var ESQUEMA = {
  Clientes: {
    columnas: ['id', 'nombre', 'telefono', 'email', 'medidas', 'notas', 'creado', 'archivado'],
    formatos: { telefono: '@', creado: 'dd/mm/yyyy' },
    casillas: ['archivado']
  },
  Pedidos: {
    columnas: ['folio', 'cliente_id', 'tipo', 'descripcion', 'prendas', 'precio', 'descuento', 'total',
      'es_gratis', 'fecha_recibido', 'fecha_entrega', 'estado', 'notas', 'actualizado', 'archivado'],
    // Columnas con fórmula (solo para verlas en el Sheet). Van al final: P, Q, R
    calculadas: {
      cliente: '={"cliente";ARRAYFORMULA(IF(A2:A="",,IFERROR(VLOOKUP(B2:B,Clientes!A:B,2,FALSE),"")))}',
      pagado: '={"pagado";ARRAYFORMULA(IF(A2:A="",,SUMIF(Pagos!B2:B,A2:A,Pagos!D2:D)))}',
      saldo: '={"saldo";ARRAYFORMULA(IF(A2:A="",,H2:H-Q2:Q))}'
    },
    formatos: {
      precio: '"$"#,##0.00', descuento: '"$"#,##0.00', total: '"$"#,##0.00',
      fecha_recibido: 'dd/mm/yyyy', fecha_entrega: 'dd/mm/yyyy', actualizado: 'dd/mm/yyyy hh:mm',
      pagado: '"$"#,##0.00', saldo: '"$"#,##0.00'
    },
    listas: { estado: ESTADOS },
    casillas: ['es_gratis', 'archivado']
  },
  Pagos: {
    columnas: ['id', 'folio', 'fecha', 'monto', 'metodo', 'nota'],
    formatos: { fecha: 'dd/mm/yyyy hh:mm', monto: '"$"#,##0.00' },
    listas: { metodo: METODOS }
  },
  Solicitudes: {
    columnas: ['id', 'fecha', 'nombre', 'telefono', 'servicio', 'mensaje', 'fecha_deseada', 'estado', 'cliente_id', 'notas'],
    formatos: { fecha: 'dd/mm/yyyy hh:mm', telefono: '@', fecha_deseada: 'dd/mm/yyyy' },
    listas: { estado: ESTADOS_SOLICITUD }
  },
  Config: {
    columnas: ['clave', 'valor']
  }
};

/** Valores iniciales de la hoja Config (ella los puede cambiar directo en el Sheet). */
var CONFIG_DEFECTO = {
  negocio: 'McLov3',
  firma: 'Mafer',
  telefono_negocio: '961 342 7119',
  sellos_para_regalo: 9,
  sellos_por: 'pedido',
  descuento_primera: 10,
  tipos: 'Arreglo, Compostura, Reparación, Parche, Tejido, Rejuvenecer, Vestido, Uniforme, Otro',
  wa_solicitud: 'Hola {nombre} 😊 Soy {firma} de {negocio}. Recibí tu solicitud de "{servicio}". ¿Me compartes fotos de la prenda para darte el precio?',
  wa_listo: 'Hola {nombre} 😊 Tu pedido #{folio} ya está listo para recoger. {saldo_txt} ¡Te espero! ♥',
  wa_cobro: 'Hola {nombre} 😊 Te escribo de {negocio} para recordarte tu saldo pendiente de {saldo} ({folios}). Aceptamos efectivo, transferencia y tarjeta. ¡Gracias! ♥',
  wa_nota: '🧵 {negocio} · Nota de pedido #{folio}\nCliente: {nombre}\nTrabajo: {trabajo}\nPrendas: {prendas}\nTotal: {total}\nPagado: {pagado}\nSaldo: {saldo}\nEntrega: {entrega}\n¡Gracias por tu confianza! ♥'
};

function TZ_() { return Session.getScriptTimeZone() || 'America/Mexico_City'; }

function libro_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

function hoja_(nombre) {
  var h = libro_().getSheetByName(nombre);
  if (!h) throw new Error('Falta la hoja "' + nombre + '". Abre el Sheet y usa el menú McLov3 → Instalar / reparar hojas.');
  return h;
}

/** Última fila con dato en la columna A (las fórmulas de otras columnas no cuentan). */
function ultimaFila_(hoja) {
  var n = hoja.getLastRow();
  if (n < 2) return 1;
  var col = hoja.getRange(1, 1, n, 1).getValues();
  while (n > 1 && col[n - 1][0] === '') n--;
  return n;
}

/** google.script.run no puede enviar fechas: se convierten a texto "2026-10-05T14:30:00". */
function normalizar_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TZ_(), "yyyy-MM-dd'T'HH:mm:ss");
  return v;
}

/** Evita que un texto como "=HYPERLINK(...)" se ejecute como fórmula. */
function seguro_(v) {
  return (typeof v === 'string' && /^[=+\-@\t\r]/.test(v)) ? "'" + v : v;
}

/** Lee una hoja completa como lista de objetos {columna: valor}. */
function leer_(nombre) {
  var esq = ESQUEMA[nombre];
  var hoja = hoja_(nombre);
  var n = ultimaFila_(hoja);
  if (n < 2) return [];
  var campos = esq.columnas.concat(Object.keys(esq.calculadas || {}));
  var valores = hoja.getRange(2, 1, n - 1, campos.length).getValues();
  var lista = [];
  for (var i = 0; i < valores.length; i++) {
    if (valores[i][0] === '') continue;
    var o = {};
    for (var j = 0; j < campos.length; j++) o[campos[j]] = normalizar_(valores[i][j]);
    lista.push(o);
  }
  return lista;
}

function buscarFila_(hoja, id) {
  if (id === '' || id == null) return 0;
  var n = ultimaFila_(hoja);
  if (n < 2) return 0;
  var col = hoja.getRange(2, 1, n - 1, 1).getValues();
  for (var i = 0; i < col.length; i++) {
    if (String(col[i][0]) === String(id)) return i + 2;
  }
  return 0;
}

/**
 * Crea o actualiza una fila. La primera columna es la clave (id o folio).
 * Solo cambia los campos que vienen en "cambios"; el resto se queda igual.
 * Nunca toca las columnas calculadas.
 */
function guardar_(nombre, cambios) {
  var cols = ESQUEMA[nombre].columnas;
  var hoja = hoja_(nombre);
  var fila = buscarFila_(hoja, cambios[cols[0]]);
  var valores;
  if (fila) {
    valores = hoja.getRange(fila, 1, 1, cols.length).getValues()[0];
  } else {
    fila = ultimaFila_(hoja) + 1;
    valores = cols.map(function () { return ''; });
  }
  cols.forEach(function (c, i) {
    if (cambios.hasOwnProperty(c)) valores[i] = cambios[c];
  });
  // Se protege toda la fila: un texto guardado antes como "=..." no debe volverse fórmula al reescribirlo
  hoja.getRange(fila, 1, 1, cols.length).setValues([valores.map(seguro_)]);
  var o = {};
  cols.forEach(function (c, i) { o[c] = normalizar_(valores[i]); });
  return o;
}

function borrarFila_(nombre, id) {
  var hoja = hoja_(nombre);
  var fila = buscarFila_(hoja, id);
  if (!fila) throw new Error('No se encontró el registro ' + id);
  hoja.deleteRow(fila);
}

function leerFila_(nombre, id) {
  var lista = leer_(nombre);
  for (var i = 0; i < lista.length; i++) if (String(lista[i][ESQUEMA[nombre].columnas[0]]) === String(id)) return lista[i];
  return null;
}

/** Siguiente id legible: C0001, C0002… */
function siguienteId_(nombre, prefijo) {
  var hoja = hoja_(nombre);
  var n = ultimaFila_(hoja), max = 0;
  if (n >= 2) {
    hoja.getRange(2, 1, n - 1, 1).getValues().forEach(function (r) {
      var m = String(r[0]).match(new RegExp('^' + prefijo + '(\\d+)$'));
      if (m) max = Math.max(max, Number(m[1]));
    });
  }
  return prefijo + ('000' + (max + 1)).slice(-4);
}

/** Folio consecutivo de pedidos (1, 2, 3…), para escribirlo en la etiqueta de la prenda. */
function siguienteFolio_() {
  var hoja = hoja_('Pedidos');
  var n = ultimaFila_(hoja), max = 0;
  if (n >= 2) hoja.getRange(2, 1, n - 1, 1).getValues().forEach(function (r) { max = Math.max(max, Number(r[0]) || 0); });
  return max + 1;
}

function soloCampos_(obj, campos) {
  var o = {};
  campos.forEach(function (c) { if (obj.hasOwnProperty(c)) o[c] = obj[c]; });
  return o;
}

function num_(v) {
  var n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

function limpiarTel_(t) {
  var d = String(t || '').replace(/\D/g, '');
  if (d.length === 12 && d.indexOf('52') === 0) d = d.slice(2);
  return d;
}

function hoyTexto_() { return Utilities.formatDate(new Date(), TZ_(), 'yyyy-MM-dd'); }

function conBloqueo_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function leerConfig_() {
  var cfg = {};
  Object.keys(CONFIG_DEFECTO).forEach(function (k) { cfg[k] = CONFIG_DEFECTO[k]; });
  leer_('Config').forEach(function (r) { if (r.clave !== '') cfg[String(r.clave)] = r.valor; });
  return cfg;
}
