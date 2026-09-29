/**
 * McLov3 CRM · Funciones que llama la app (google.script.run.nombreFuncion).
 * Todo lo que escribe usa un candado para que la tablet y el celular no se pisen.
 */

/** Una sola llamada al abrir la app: trae todo. */
function cargarTodo() {
  return {
    clientes: leer_('Clientes'),
    pedidos: leer_('Pedidos'),
    pagos: leer_('Pagos'),
    solicitudes: leer_('Solicitudes'),
    config: leerConfig_(),
    hoy: hoyTexto_()
  };
}

/* ---------------- Clientes ---------------- */

function guardarCliente(c) {
  return conBloqueo_(function () { return guardarCliente_(c); });
}

function guardarCliente_(c) {
  c = c || {};
  if (!c.id && !String(c.nombre || '').trim()) throw new Error('Falta el nombre');
  if (c.hasOwnProperty('nombre')) c.nombre = String(c.nombre).trim().slice(0, 100);
  if (c.hasOwnProperty('telefono')) c.telefono = limpiarTel_(c.telefono);
  if (!c.id) {
    c.id = siguienteId_('Clientes', 'C');
    c.creado = new Date();
    c.archivado = false;
  }
  if (c.hasOwnProperty('archivado')) c.archivado = c.archivado === true;
  return guardar_('Clientes', soloCampos_(c, ESQUEMA.Clientes.columnas));
}

/* ---------------- Pedidos ---------------- */

/** Crea o edita un pedido. Si es nuevo y trae anticipo, también registra el pago. */
function guardarPedido(p, anticipo) {
  return conBloqueo_(function () {
    p = p || {};
    if (!p.cliente_id) throw new Error('Falta elegir el cliente');
    var nuevo = !p.folio;
    if (nuevo) {
      p.folio = siguienteFolio_();
      p.fecha_recibido = p.fecha_recibido || hoyTexto_();
      p.estado = p.estado || 'Recibido';
      p.archivado = false;
    }
    if (p.hasOwnProperty('estado') && ESTADOS.indexOf(p.estado) === -1) p.estado = 'Recibido';
    if (nuevo || p.hasOwnProperty('prendas')) p.prendas = Math.max(1, Math.round(num_(p.prendas) || 1));
    if (nuevo || p.hasOwnProperty('precio')) {
      p.precio = Math.max(0, num_(p.precio));
      p.es_gratis = p.es_gratis === true;
      p.descuento = p.es_gratis ? p.precio : Math.min(p.precio, Math.max(0, num_(p.descuento)));
      p.total = p.es_gratis ? 0 : Math.max(0, p.precio - p.descuento);
    }
    p.actualizado = new Date();
    var pedido = guardar_('Pedidos', soloCampos_(p, ESQUEMA.Pedidos.columnas));
    var pago = null;
    if (nuevo && anticipo && num_(anticipo.monto) > 0) {
      pago = guardarPago_({ folio: pedido.folio, monto: anticipo.monto, metodo: anticipo.metodo, nota: 'Anticipo' });
    }
    return { pedido: pedido, pago: pago };
  });
}

function cambiarEstado(folio, estado) {
  if (ESTADOS.indexOf(estado) === -1) throw new Error('Estado no válido: ' + estado);
  return conBloqueo_(function () {
    if (!buscarFila_(hoja_('Pedidos'), folio)) throw new Error('No existe el pedido #' + folio);
    return guardar_('Pedidos', { folio: folio, estado: estado, actualizado: new Date() });
  });
}

function archivarPedido(folio, archivar) {
  return conBloqueo_(function () {
    if (!buscarFila_(hoja_('Pedidos'), folio)) throw new Error('No existe el pedido #' + folio);
    return guardar_('Pedidos', { folio: folio, archivado: archivar === true, actualizado: new Date() });
  });
}

/* ---------------- Pagos ---------------- */

function registrarPago(pg) {
  return conBloqueo_(function () { return guardarPago_(pg || {}); });
}

function guardarPago_(pg) {
  var monto = num_(pg.monto);
  if (!(monto > 0)) throw new Error('El monto debe ser mayor a 0');
  if (!buscarFila_(hoja_('Pedidos'), pg.folio)) throw new Error('No existe el pedido #' + pg.folio);
  return guardar_('Pagos', {
    id: siguienteId_('Pagos', 'G'),
    folio: Number(pg.folio),
    fecha: new Date(),
    monto: monto,
    metodo: METODOS.indexOf(pg.metodo) >= 0 ? pg.metodo : 'Efectivo',
    nota: String(pg.nota || '').slice(0, 200)
  });
}

/** Para corregir un pago capturado por error. */
function anularPago(id) {
  return conBloqueo_(function () { borrarFila_('Pagos', id); return true; });
}

/* ---------------- Solicitudes (de la página) ---------------- */

function guardarSolicitud(s) {
  s = s || {};
  if (s.estado && ESTADOS_SOLICITUD.indexOf(s.estado) === -1) throw new Error('Estado no válido');
  return conBloqueo_(function () {
    if (!buscarFila_(hoja_('Solicitudes'), s.id)) throw new Error('No existe la solicitud');
    return guardar_('Solicitudes', soloCampos_(s, ['id', 'estado', 'notas', 'cliente_id']));
  });
}

/** Crea la clienta a partir de la solicitud (o usa la que ya tenga ese teléfono). */
function convertirSolicitud(id) {
  return conBloqueo_(function () {
    var s = leerFila_('Solicitudes', id);
    if (!s) throw new Error('No existe la solicitud');
    var tel = limpiarTel_(s.telefono);
    var cliente = null;
    leer_('Clientes').forEach(function (c) {
      if (!cliente && tel && limpiarTel_(c.telefono) === tel && c.archivado !== true) cliente = c;
    });
    var nueva = !cliente;
    if (nueva) {
      cliente = guardarCliente_({ nombre: s.nombre, telefono: tel, notas: 'Llegó por la página (' + s.servicio + ')' });
    }
    var solicitud = guardar_('Solicitudes', { id: id, estado: 'Convertida', cliente_id: cliente.id });
    return { cliente: cliente, solicitud: solicitud, nueva: nueva };
  });
}
