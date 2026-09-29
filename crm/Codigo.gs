/**
 * McLov3 CRM · Punto de entrada.
 * Implementar como App web:  Ejecutar como: Yo  ·  Quién tiene acceso: Solo yo
 */

function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate()
    .setTitle('McLov3 · Pedidos')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Inserta el contenido de otro archivo HTML (estilos, app). */
function include(nombre) {
  return HtmlService.createHtmlOutputFromFile(nombre).getContent();
}

/** Menú en el Sheet. */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('McLov3')
    .addItem('📱 Abrir la app', 'abrirApp')
    .addSeparator()
    .addItem('Instalar / reparar hojas', 'instalar')
    .addItem('Hacer un respaldo ahora', 'respaldoMensual')
    .addToUi();
}

function abrirApp() {
  var url = ScriptApp.getService().getUrl();
  var html = url
    ? '<p style="font-family:sans-serif">Abre la app aquí:</p><p><a href="' + url + '" target="_blank" style="font-family:sans-serif;font-size:18px">Abrir McLov3 · Pedidos</a></p>'
    : '<p style="font-family:sans-serif">Todavía no hay una implementación. Ve a Extensiones → Apps Script → Implementar → Nueva implementación → App web.</p>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(340).setHeight(140), 'McLov3');
}
