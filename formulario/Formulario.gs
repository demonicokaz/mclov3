/**
 * McLov3 · Receptor del formulario de cotización de la página.
 *
 * Es un proyecto de Apps Script APARTE del CRM. Se despliega como app web con:
 *   Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier persona
 * Lo único que puede hacer es AGREGAR filas a la hoja "Solicitudes" del Sheet del CRM.
 */

// ✏️ ID del Sheet del CRM: es la parte larga de su dirección
//    https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
var SHEET_ID = 'PEGA_AQUI_EL_ID_DEL_SHEET';

var HOJA = 'Solicitudes';
var MAX_POR_TELEFONO_POR_HORA = 3;
var MAX_POR_DIA = 60;
var TIEMPO_MINIMO_MS = 3000; // una persona real tarda más de 3 s en llenar el formulario
var SERVICIOS = ['Arreglo o compostura', 'Reparación', 'Parche o remiendo', 'Tejido',
  'Rejuvenecer una prenda', 'Confección de vestido', 'Uniformes', 'Otro'];

/** Para comprobar que la URL funciona: ábrela en el navegador y debe decir ok. */
function doGet() {
  return responder_({ ok: true, servicio: 'Formulario McLov3' });
}

function doPost(e) {
  try {
    var d = leerDatos_(e);

    // Robots: les respondemos "ok" para que no insistan, pero no guardamos nada
    if (d.sitio_web) return responder_({ ok: true });
    if (!(Number(d.t) >= TIEMPO_MINIMO_MS)) return responder_({ ok: true });

    var nombre = texto_(d.nombre, 80);
    var telefono = String(d.telefono || '').replace(/\D/g, '');
    if (telefono.length === 12 && telefono.indexOf('52') === 0) telefono = telefono.slice(2);
    if (nombre.length < 2) return responder_({ ok: false, error: 'nombre' });
    if (telefono.length !== 10) return responder_({ ok: false, error: 'telefono' });

    // Si cambian las opciones en la página y no aquí, no se pierde la solicitud
    var servicio = texto_(d.servicio, 60);
    if (SERVICIOS.indexOf(servicio) === -1) servicio = servicio ? 'Otro: ' + servicio : 'Otro';
    var fechaDeseada = /^\d{4}-\d{2}-\d{2}$/.test(d.fecha_deseada || '') ? d.fecha_deseada : '';

    // Límites contra spam
    var cache = CacheService.getScriptCache();
    var claveTel = 'tel_' + telefono;
    var claveDia = 'dia_' + Utilities.formatDate(new Date(), 'America/Mexico_City', 'yyyyMMdd');
    var nTel = Number(cache.get(claveTel) || 0);
    var nDia = Number(cache.get(claveDia) || 0);
    if (nTel >= MAX_POR_TELEFONO_POR_HORA || nDia >= MAX_POR_DIA) return responder_({ ok: false, error: 'limite' });

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var hoja = SpreadsheetApp.openById(SHEET_ID).getSheetByName(HOJA);
      var datos = {
        id: 'S' + Utilities.formatDate(new Date(), 'America/Mexico_City', 'yyMMddHHmmss') + Math.floor(Math.random() * 90 + 10),
        fecha: new Date(),
        nombre: nombre,
        telefono: telefono,
        servicio: servicio,
        mensaje: texto_(d.mensaje, 1000),
        fecha_deseada: fechaDeseada,
        estado: 'Nueva'
      };
      // Se acomoda según los encabezados de la hoja, así no importa el orden de las columnas
      var encabezados = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
      var fila = encabezados.map(function (h) { return datos.hasOwnProperty(h) ? seguro_(datos[h]) : ''; });
      hoja.appendRow(fila);
    } finally {
      lock.releaseLock();
    }

    cache.put(claveTel, String(nTel + 1), 3600);
    cache.put(claveDia, String(nDia + 1), 86400);
    return responder_({ ok: true });
  } catch (err) {
    console.error(err);
    return responder_({ ok: false, error: 'servidor' });
  }
}

function leerDatos_(e) {
  if (e && e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (x) { /* no era JSON */ }
  }
  return (e && e.parameter) || {};
}

function texto_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

/** Evita que un texto como "=IMPORTXML(...)" se ejecute como fórmula en el Sheet. */
function seguro_(v) {
  return (typeof v === 'string' && /^[=+\-@\t\r]/.test(v)) ? "'" + v : v;
}

function responder_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Prueba desde el editor: selecciona "probar" y dale ▶ Ejecutar. Debe aparecer una fila en Solicitudes. */
function probar() {
  var r = doPost({ postData: { contents: JSON.stringify({
    nombre: 'Prueba desde el editor', telefono: '9611234567', servicio: 'Arreglo o compostura',
    mensaje: '=esto no debe ejecutarse', fecha_deseada: '', sitio_web: '', t: 5000
  }) } });
  Logger.log(r.getContent());
}
