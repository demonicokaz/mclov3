/**
 * McLov3 CRM · Instalación.
 * Se ejecuta UNA vez (o cuando algo se desacomode) desde el menú del Sheet:
 *   McLov3 → Instalar / reparar hojas
 * No borra datos: solo crea lo que falte y vuelve a poner encabezados, formatos y listas.
 */
function instalar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet() || libro_();
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  ss.setSpreadsheetTimeZone('America/Mexico_City');

  Object.keys(ESQUEMA).forEach(function (nombre) {
    var esq = ESQUEMA[nombre];
    var hoja = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
    var cols = esq.columnas;
    var calc = esq.calculadas || {};
    var nombresCalc = Object.keys(calc);
    var todas = cols.concat(nombresCalc);

    if (hoja.getMaxColumns() < todas.length) hoja.insertColumnsAfter(hoja.getMaxColumns(), todas.length - hoja.getMaxColumns());
    hoja.getRange(1, 1, 1, cols.length).setValues([cols]);
    nombresCalc.forEach(function (c, i) { hoja.getRange(1, cols.length + 1 + i).setFormula(calc[c]); });

    hoja.setFrozenRows(1);
    hoja.getRange(1, 1, 1, todas.length)
      .setFontWeight('bold').setBackground('#4B2461').setFontColor('#FFFFFF');
    if (nombresCalc.length) {
      hoja.getRange(1, cols.length + 1, 1, nombresCalc.length).setBackground('#1E5E5B')
        .setNote('Columna calculada automáticamente. No escribas aquí.');
    }

    var filas = hoja.getMaxRows() - 1;
    Object.keys(esq.formatos || {}).forEach(function (c) {
      hoja.getRange(2, todas.indexOf(c) + 1, filas, 1).setNumberFormat(esq.formatos[c]);
    });
    Object.keys(esq.listas || {}).forEach(function (c) {
      var regla = SpreadsheetApp.newDataValidation().requireValueInList(esq.listas[c], true).setAllowInvalid(false).build();
      hoja.getRange(2, cols.indexOf(c) + 1, filas, 1).setDataValidation(regla);
    });
    (esq.casillas || []).forEach(function (c) {
      hoja.getRange(2, cols.indexOf(c) + 1, filas, 1).insertCheckboxes();
    });

    // Aviso (no bloqueo) si alguien intenta cambiar los encabezados
    var yaProtegida = hoja.getProtections(SpreadsheetApp.ProtectionType.RANGE).some(function (p) {
      return p.getDescription() === 'Encabezados McLov3';
    });
    if (!yaProtegida) hoja.getRange(1, 1, 1, todas.length).protect().setDescription('Encabezados McLov3').setWarningOnly(true);
  });

  colorearPedidos_(ss.getSheetByName('Pedidos'));
  anchosColumnas_(ss);

  // Config: agrega solo las claves que falten (no pisa lo que ella ya cambió)
  var hojaCfg = ss.getSheetByName('Config');
  var existentes = {};
  leer_('Config').forEach(function (r) { existentes[r.clave] = true; });
  Object.keys(CONFIG_DEFECTO).forEach(function (k) {
    if (!existentes[k]) hojaCfg.appendRow([k, CONFIG_DEFECTO[k]]);
  });

  // Quita la hoja vacía que Google crea por defecto
  ['Hoja 1', 'Hoja1', 'Sheet1'].forEach(function (n) {
    var h = ss.getSheetByName(n);
    if (h && h.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(h);
  });

  // Respaldo automático el día 1 de cada mes
  var hayDisparador = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'respaldoMensual'; });
  if (!hayDisparador) ScriptApp.newTrigger('respaldoMensual').timeBased().onMonthDay(1).atHour(3).create();

  try {
    SpreadsheetApp.getUi().alert('✅ Listo. Las hojas están preparadas.\n\nSiguiente paso: Implementar → Nueva implementación → App web (ver README).');
  } catch (e) { /* se ejecutó desde el editor */ }
}

function colorearPedidos_(hoja) {
  var rango = hoja.getRange('A2:R');
  var colores = { 'Recibido': '#EFE4F7', 'En proceso': '#FBF0BD', 'Listo': '#CDEBE2', 'Entregado': '#EEEEEE' };
  var reglas = hoja.getConditionalFormatRules().filter(function (r) {
    // conserva reglas que no sean nuestras
    var f = r.getBooleanCondition();
    return !(f && String(f.getCriteriaValues()[0]).indexOf('=$L2=') === 0);
  });
  Object.keys(colores).forEach(function (estado) {
    reglas.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$L2="' + estado + '"')
      .setBackground(colores[estado]).setRanges([rango]).build());
  });
  hoja.setConditionalFormatRules(reglas);
}

function anchosColumnas_(ss) {
  var anchos = {
    Clientes: { nombre: 200, medidas: 220, notas: 240 },
    Pedidos: { descripcion: 260, notas: 200, cliente: 180 },
    Solicitudes: { nombre: 180, mensaje: 320, servicio: 180 },
    Config: { clave: 180, valor: 520 }
  };
  Object.keys(anchos).forEach(function (nombre) {
    var hoja = ss.getSheetByName(nombre);
    var todas = ESQUEMA[nombre].columnas.concat(Object.keys(ESQUEMA[nombre].calculadas || {}));
    Object.keys(anchos[nombre]).forEach(function (c) {
      hoja.setColumnWidth(todas.indexOf(c) + 1, anchos[nombre][c]);
    });
  });
}

/** Copia todo el Sheet a la carpeta "Respaldos McLov3" de Drive. Corre sola cada mes. */
function respaldoMensual() {
  var ss = libro_();
  var carpetas = DriveApp.getFoldersByName('Respaldos McLov3');
  var carpeta = carpetas.hasNext() ? carpetas.next() : DriveApp.createFolder('Respaldos McLov3');
  var nombre = 'Respaldo McLov3 ' + Utilities.formatDate(new Date(), TZ_(), 'yyyy-MM-dd');
  DriveApp.getFileById(ss.getId()).makeCopy(nombre, carpeta);
}
