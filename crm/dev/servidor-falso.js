/* SOLO PARA PROBAR EN LOCAL (no se sube a Apps Script).
   Imita google.script.run con datos de ejemplo guardados en el navegador.
   Para empezar de cero: en la consola escribe  reiniciarDatosFalsos()  */
(function () {
  var CLAVE = 'mclov-crm-falso-v1';
  var ESTADOS = ['Recibido', 'En proceso', 'Listo', 'Entregado'];
  var METODOS = ['Efectivo', 'Transferencia', 'Tarjeta'];

  function pad(n) { return ('0' + n).slice(-2); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dia(n) { var d = new Date(); d.setDate(d.getDate() + n); return iso(d) + 'T00:00:00'; }
  function ahora() { var d = new Date(); return iso(d) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  function num(v) { var n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? 0 : Math.round(n * 100) / 100; }
  function tel(t) { var d = String(t || '').replace(/\D/g, ''); return d.length === 12 && d.indexOf('52') === 0 ? d.slice(2) : d; }

  function semilla() {
    var db = {
      config: {
        negocio: 'McLov3', firma: 'Mafer', telefono_negocio: '961 342 7119', sellos_para_regalo: 9, sellos_por: 'pedido', descuento_primera: 10,
        tipos: 'Arreglo, Compostura, Reparación, Parche, Tejido, Rejuvenecer, Vestido, Uniforme, Otro',
        wa_solicitud: 'Hola {nombre} 😊 Soy {firma} de {negocio}. Recibí tu solicitud de "{servicio}". ¿Me compartes fotos de la prenda para darte el precio?',
        wa_listo: 'Hola {nombre} 😊 Tu pedido #{folio} ya está listo para recoger. {saldo_txt} ¡Te espero! ♥',
        wa_cobro: 'Hola {nombre} 😊 Te escribo de {negocio} para recordarte tu saldo pendiente de {saldo} ({folios}). Aceptamos efectivo, transferencia y tarjeta. ¡Gracias! ♥',
        wa_nota: '🧵 {negocio} · Nota de pedido #{folio}\nCliente: {nombre}\nTrabajo: {trabajo}\nPrendas: {prendas}\nTotal: {total}\nPagado: {pagado}\nSaldo: {saldo}\nEntrega: {entrega}\n¡Gracias por tu confianza! ♥'
      },
      clientes: [
        { id: 'C0001', nombre: 'María López', telefono: '9611112233', email: '', medidas: 'Busto: 92\nCintura: 74\nCadera: 100', notas: 'Prefiere entregas en la tarde', creado: dia(-120), archivado: false },
        { id: 'C0002', nombre: 'Ana Gómez', telefono: '9612223344', email: 'ana@example.com', medidas: '', notas: '', creado: dia(-60), archivado: false },
        { id: 'C0003', nombre: 'Lupita Hernández', telefono: '9613334455', email: '', medidas: 'Cintura: 80\nLargo de pantalón: 98', notas: 'Clienta frecuente ♥', creado: dia(-300), archivado: false },
        { id: 'C0004', nombre: 'Sofía Ruiz', telefono: '9614445566', email: '', medidas: '', notas: '', creado: dia(-20), archivado: false },
        { id: 'C0005', nombre: 'Carmen Díaz', telefono: '9615556677', email: '', medidas: '', notas: '', creado: dia(-5), archivado: false }
      ],
      pedidos: [], pagos: [],
      solicitudes: [
        { id: 'S1', fecha: dia(0).replace('T00:00:00', 'T09:15:00'), nombre: 'Rosa Martínez', telefono: '9617778899', servicio: 'Confección de vestido', mensaje: 'Quiero un vestido para la boda de mi hermana en diciembre, color vino.', fecha_deseada: dia(40), estado: 'Nueva', cliente_id: '', notas: '' },
        { id: 'S2', fecha: dia(-1).replace('T00:00:00', 'T18:40:00'), nombre: 'Daniela Pérez', telefono: '9618889900', servicio: 'Arreglo o compostura', mensaje: 'Subir bastilla a 3 pantalones de mezclilla', fecha_deseada: '', estado: 'Nueva', cliente_id: '', notas: '' },
        { id: 'S3', fecha: dia(-4).replace('T00:00:00', 'T11:05:00'), nombre: 'Karla Sánchez', telefono: '9619990011', servicio: 'Tejido', mensaje: 'Gorro tejido para bebé', fecha_deseada: '', estado: 'Contactada', cliente_id: '', notas: '' }
      ]
    };
    var folio = 0;
    function ped(cliente, tipo, desc, precio, estado, recibido, entrega, extra) {
      var p = { folio: ++folio, cliente_id: cliente, tipo: tipo, descripcion: desc, prendas: 1, precio: precio, descuento: 0, total: precio,
        es_gratis: false, fecha_recibido: dia(recibido), fecha_entrega: entrega === null ? '' : dia(entrega), estado: estado, notas: '', actualizado: ahora(), archivado: false };
      Object.keys(extra || {}).forEach(function (k) { p[k] = extra[k]; });
      if (p.es_gratis) { p.descuento = p.precio; p.total = 0; }
      db.pedidos.push(p);
      return p;
    }
    function pago(p, monto, metodo, hace) {
      db.pagos.push({ id: 'G' + ('000' + (db.pagos.length + 1)).slice(-4), folio: p.folio, fecha: dia(-hace), monto: monto, metodo: metodo, nota: '' });
    }
    // Lupita: 9 arreglos entregados -> el siguiente es gratis
    for (var i = 0; i < 9; i++) pago(ped('C0003', 'Arreglo', 'Bastilla de pantalón', 80, 'Entregado', -280 + i * 30, -275 + i * 30), 80, 'Efectivo', 275 - i * 30);
    var a = ped('C0001', 'Vestido', 'Vestido de fiesta a la medida, color lila', 1800, 'En proceso', -10, 5, { notas: 'Segunda prueba el viernes' });
    pago(a, 900, 'Transferencia', 10);
    var b = ped('C0001', 'Compostura', 'Entallar blusa', 150, 'Listo', -4, 0);
    ped('C0002', 'Reparación', 'Cambio de cierre de chamarra', 180, 'Recibido', -6, -2, { descuento: 18, total: 162, notas: 'Primera vez: 10%' });
    var c = ped('C0004', 'Parche', 'Parches en rodillas de 2 pantalones', 240, 'Listo', -3, 1, { prendas: 2 });
    pago(c, 100, 'Efectivo', 3);
    ped('C0005', 'Uniforme', 'Ajuste de uniforme escolar', 200, 'Recibido', -1, 3);
    var d = ped('C0002', 'Arreglo', 'Acortar mangas de saco', 220, 'Entregado', -30, -25);
    pago(d, 120, 'Tarjeta', 25);
    ped('C0004', 'Tejido', 'Bufanda tejida gris', 350, 'En proceso', -2, 7);
    ped('C0003', 'Rejuvenecer', 'Transformar vestido en falda', 300, 'Recibido', 0, null);
    return db;
  }

  var db;
  try { db = JSON.parse(localStorage.getItem(CLAVE)); } catch (e) { db = null; }
  if (!db) db = semilla();
  function guardarDb() { try { localStorage.setItem(CLAVE, JSON.stringify(db)); } catch (e) { /* sin almacenamiento */ } }
  window.reiniciarDatosFalsos = function () { try { localStorage.removeItem(CLAVE); } catch (e) {} location.reload(); };

  function buscar(lista, campo, valor) {
    for (var i = 0; i < lista.length; i++) if (String(lista[i][campo]) === String(valor)) return lista[i];
    return null;
  }
  function sigId(lista, campo, prefijo) {
    var max = 0;
    lista.forEach(function (o) { var m = String(o[campo]).match(new RegExp('^' + prefijo + '(\\d+)$')); if (m) max = Math.max(max, +m[1]); });
    return prefijo + ('000' + (max + 1)).slice(-4);
  }
  function fechaTxt(s) { return s ? String(s).slice(0, 10) + 'T00:00:00' : ''; }
  function mezclar(obj, cambios, campos) {
    campos.forEach(function (k) { if (cambios.hasOwnProperty(k)) obj[k] = cambios[k]; });
    return obj;
  }

  var API = {
    cargarTodo: function () {
      return { clientes: db.clientes, pedidos: db.pedidos, pagos: db.pagos, solicitudes: db.solicitudes, config: db.config, hoy: iso(new Date()) };
    },
    guardarCliente: function (c) {
      if (!c.id && !String(c.nombre || '').trim()) throw new Error('Falta el nombre');
      var obj = c.id ? buscar(db.clientes, 'id', c.id) : null;
      if (!obj) {
        obj = { id: sigId(db.clientes, 'id', 'C'), nombre: '', telefono: '', email: '', medidas: '', notas: '', creado: ahora(), archivado: false };
        db.clientes.push(obj);
      }
      if (c.hasOwnProperty('telefono')) c.telefono = tel(c.telefono);
      return mezclar(obj, c, ['nombre', 'telefono', 'email', 'medidas', 'notas', 'archivado']);
    },
    guardarPedido: function (p, anticipo) {
      if (!p.cliente_id) throw new Error('Falta elegir el cliente');
      var obj = p.folio ? buscar(db.pedidos, 'folio', p.folio) : null, nuevo = !obj;
      if (nuevo) {
        obj = { folio: db.pedidos.reduce(function (m, x) { return Math.max(m, x.folio); }, 0) + 1, fecha_recibido: iso(new Date()) + 'T00:00:00',
          estado: 'Recibido', archivado: false };
        db.pedidos.push(obj);
      }
      mezclar(obj, p, ['cliente_id', 'tipo', 'descripcion', 'notas']);
      obj.prendas = Math.max(1, Math.round(num(p.prendas)) || 1);
      obj.precio = Math.max(0, num(p.precio));
      obj.es_gratis = p.es_gratis === true;
      obj.descuento = obj.es_gratis ? obj.precio : Math.min(obj.precio, Math.max(0, num(p.descuento)));
      obj.total = obj.es_gratis ? 0 : obj.precio - obj.descuento;
      obj.fecha_entrega = fechaTxt(p.fecha_entrega);
      obj.actualizado = ahora();
      var pg = null;
      if (nuevo && anticipo && num(anticipo.monto) > 0) pg = API.registrarPago({ folio: obj.folio, monto: anticipo.monto, metodo: anticipo.metodo, nota: 'Anticipo' });
      return { pedido: obj, pago: pg };
    },
    cambiarEstado: function (folio, estado) {
      if (ESTADOS.indexOf(estado) < 0) throw new Error('Estado no válido');
      var p = buscar(db.pedidos, 'folio', folio);
      if (!p) throw new Error('No existe el pedido #' + folio);
      p.estado = estado; p.actualizado = ahora();
      return p;
    },
    archivarPedido: function (folio, archivar) {
      var p = buscar(db.pedidos, 'folio', folio);
      p.archivado = archivar === true; p.actualizado = ahora();
      return p;
    },
    registrarPago: function (pg) {
      var monto = num(pg.monto);
      if (!(monto > 0)) throw new Error('El monto debe ser mayor a 0');
      var g = { id: sigId(db.pagos, 'id', 'G'), folio: Number(pg.folio), fecha: ahora(), monto: monto,
        metodo: METODOS.indexOf(pg.metodo) >= 0 ? pg.metodo : 'Efectivo', nota: pg.nota || '' };
      db.pagos.push(g);
      return g;
    },
    anularPago: function (id) {
      db.pagos = db.pagos.filter(function (g) { return g.id !== id; });
      return true;
    },
    guardarSolicitud: function (s) {
      var o = buscar(db.solicitudes, 'id', s.id);
      if (!o) throw new Error('No existe la solicitud');
      return mezclar(o, s, ['estado', 'notas', 'cliente_id']);
    },
    convertirSolicitud: function (id) {
      var s = buscar(db.solicitudes, 'id', id);
      var c = db.clientes.filter(function (x) { return tel(x.telefono) === tel(s.telefono) && !x.archivado; })[0];
      var nueva = !c;
      if (nueva) c = API.guardarCliente({ nombre: s.nombre, telefono: s.telefono, notas: 'Llegó por la página (' + s.servicio + ')' });
      s.estado = 'Convertida'; s.cliente_id = c.id;
      return { cliente: c, solicitud: s, nueva: nueva };
    }
  };

  function Corredor(ok, falla) {
    var self = this;
    this._ok = ok; this._falla = falla;
    Object.keys(API).forEach(function (nombre) {
      self[nombre] = function () {
        var args = JSON.parse(JSON.stringify([].slice.call(arguments)));
        setTimeout(function () {
          try {
            var r = API[nombre].apply(null, args);
            guardarDb();
            if (self._ok) self._ok(JSON.parse(JSON.stringify(r === undefined ? null : r)));
          } catch (e) {
            if (self._falla) self._falla(e);
          }
        }, 350); // simula la espera de la red
      };
    });
  }
  Corredor.prototype.withSuccessHandler = function (f) { return new Corredor(f, this._falla); };
  Corredor.prototype.withFailureHandler = function (f) { return new Corredor(this._ok, f); };

  window.google = {
    script: {
      run: new Corredor(),
      history: {
        push: function (estado, params, hash) { history.pushState(estado, '', '#' + hash); },
        replace: function (estado, params, hash) { history.replaceState(estado, '', '#' + hash); },
        setChangeHandler: function (fn) {
          window.addEventListener('popstate', function (e) { fn({ state: e.state, location: { hash: location.hash.slice(1) } }); });
        }
      },
      url: { getLocation: function (cb) { setTimeout(function () { cb({ hash: location.hash.slice(1), parameter: {}, parameters: {} }); }, 0); } }
    }
  };
})();
