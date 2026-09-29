/* McLov3 · galería, mapa y formulario de cotización.
   Escrito en JavaScript sencillo para que funcione en celulares y tablets viejos. */
(function () {
  "use strict";

  var C = window.MCLOV || {};

  function $(id) { return document.getElementById(id); }

  function crear(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto) e.textContent = texto;
    return e;
  }

  function imagen(src, alt, mini) {
    var i = document.createElement("img");
    i.loading = "lazy";
    i.decoding = "async";
    i.alt = alt;
    if (mini) {
      i.srcset = mini + " 600w, " + src + " 1200w";
      i.sizes = "(min-width: 760px) 25vw, 50vw";
      i.src = mini;
    } else {
      i.src = src;
    }
    return i;
  }

  /* ---------------- Galería ---------------- */
  var galeria = $("galeria");
  var filtros = $("filtros");
  var visor = $("visor");
  var fotos = C.GALERIA || [];
  var categorias = C.CATEGORIAS || {};

  function mitad(src, alt, texto) {
    var m = crear("span", "mitad");
    m.appendChild(imagen(src, alt));
    m.appendChild(crear("span", "etiqueta", texto));
    return m;
  }

  function pintarGaleria(filtro) {
    galeria.innerHTML = "";
    var n = 0;
    fotos.forEach(function (f) {
      if (filtro !== "todos" && f.categoria !== filtro) return;
      var b = crear("button", f.antes ? "foto foto-par" : "foto");
      b.type = "button";
      b.setAttribute("aria-label", "Ver en grande: " + f.titulo);
      if (f.antes) {
        b.appendChild(mitad(f.antes, "Antes: " + f.titulo, "Antes"));
        b.appendChild(mitad(f.despues, "Después: " + f.titulo, "Después"));
      } else {
        b.appendChild(imagen(f.foto, f.titulo, f.mini));
      }
      b.appendChild(crear("span", "foto-titulo", f.titulo));
      b.addEventListener("click", function () { abrirVisor(f); });
      galeria.appendChild(b);
      n++;
    });
    if (!n) galeria.appendChild(crear("p", "galeria-vacia", "Muy pronto verás aquí mis trabajos ♥"));
  }

  function pintarFiltros() {
    var usadas = { todos: "Todos" };
    fotos.forEach(function (f) { if (categorias[f.categoria]) usadas[f.categoria] = categorias[f.categoria]; });
    var claves = Object.keys(usadas);
    if (claves.length < 3) { filtros.hidden = true; return; } // con una sola categoría no hace falta filtrar
    claves.forEach(function (clave) {
      var b = crear("button", "filtro", usadas[clave]);
      b.type = "button";
      b.setAttribute("aria-pressed", clave === "todos" ? "true" : "false");
      b.addEventListener("click", function () {
        var todos = filtros.querySelectorAll(".filtro");
        for (var i = 0; i < todos.length; i++) todos[i].setAttribute("aria-pressed", "false");
        b.setAttribute("aria-pressed", "true");
        pintarGaleria(clave);
      });
      filtros.appendChild(b);
    });
  }

  function abrirVisor(f) {
    var principal = f.foto || f.despues;
    if (!visor || typeof visor.showModal !== "function") { window.open(principal, "_blank"); return; }
    var cont = $("visor-fotos");
    cont.innerHTML = "";
    var lista = f.antes ? [[f.antes, "Antes"], [f.despues, "Después"]] : [[f.foto, ""]];
    lista.forEach(function (par) {
      var fig = crear("figure");
      var img = document.createElement("img");
      img.src = par[0];
      img.alt = (par[1] ? par[1] + ": " : "") + f.titulo;
      fig.appendChild(img);
      if (par[1]) fig.appendChild(crear("span", "etiqueta", par[1]));
      cont.appendChild(fig);
    });
    $("visor-titulo").textContent = f.titulo;
    visor.showModal();
  }

  if (galeria) {
    pintarFiltros();
    pintarGaleria("todos");
  }
  if (visor) {
    // cerrar tocando fuera de la foto
    visor.addEventListener("click", function (e) { if (e.target === visor) visor.close(); });
  }

  /* ---------------- Mapa (se carga solo si lo piden) ---------------- */
  var verMapa = $("ver-mapa");
  if (verMapa) {
    verMapa.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = verMapa.getAttribute("data-src");
      f.title = "Mapa de la zona: Col. Penipak, Tuxtla Gutiérrez";
      f.setAttribute("allowfullscreen", "");
      f.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
      var mapa = $("mapa");
      mapa.innerHTML = "";
      mapa.appendChild(f);
    });
  }

  /* ---------------- Formulario de cotización ---------------- */
  var form = $("form-cotiza");
  var estado = $("form-estado");
  var enviar = $("f-enviar");
  var abierto = Date.now();

  function avisar(texto, tipo) {
    estado.textContent = texto;
    estado.className = "form-estado" + (tipo ? " " + tipo : "");
  }

  function soloDigitos(t) {
    var d = String(t || "").replace(/\D/g, "");
    if (d.length === 12 && d.indexOf("52") === 0) d = d.slice(2); // +52 961...
    return d;
  }

  function marcar(campo, malo) {
    if (malo) campo.setAttribute("aria-invalid", "true");
    else campo.removeAttribute("aria-invalid");
  }

  if (form) {
    var fecha = form.elements.fecha_deseada;
    var hoy = new Date();
    fecha.min = hoy.getFullYear() + "-" + ("0" + (hoy.getMonth() + 1)).slice(-2) + "-" + ("0" + hoy.getDate()).slice(-2);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var el = form.elements;
      var datos = {
        nombre: el.nombre.value.trim(),
        telefono: soloDigitos(el.telefono.value),
        servicio: el.servicio.value,
        mensaje: el.mensaje.value.trim(),
        fecha_deseada: el.fecha_deseada.value,
        sitio_web: el.sitio_web.value, // trampa para robots
        t: Date.now() - abierto
      };

      var errores = [];
      marcar(el.nombre, datos.nombre.length < 2);
      if (datos.nombre.length < 2) errores.push("tu nombre");
      marcar(el.telefono, datos.telefono.length !== 10);
      if (datos.telefono.length !== 10) errores.push("un WhatsApp de 10 dígitos");
      marcar(el.servicio, !datos.servicio);
      if (!datos.servicio) errores.push("qué necesitas");
      var casilla = el.acepto.parentNode;
      casilla.className = el.acepto.checked ? "casilla" : "casilla invalida";
      if (!el.acepto.checked) errores.push("aceptar el aviso de privacidad");

      if (errores.length) {
        avisar("Falta: " + errores.join(", ") + ".", "error");
        var primero = form.querySelector("[aria-invalid='true']") || el.acepto;
        primero.focus();
        return;
      }

      if (!C.FORMULARIO_URL) {
        avisar("El formulario todavía no está conectado. Mientras tanto escríbeme por WhatsApp al 961 342 7119 🙂", "error");
        return;
      }

      enviar.disabled = true;
      avisar("Enviando…");
      // text/plain evita la verificación CORS previa que Apps Script no soporta
      fetch(C.FORMULARIO_URL, { method: "POST", body: JSON.stringify(datos) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.error || "error");
          form.reset();
          abierto = Date.now();
          avisar("¡Gracias, " + datos.nombre.split(" ")[0] + "! Recibí tu solicitud y te escribiré por WhatsApp muy pronto ♥", "ok");
        })
        .catch(function () {
          avisar("No se pudo enviar 😔 Revisa tu conexión e inténtalo de nuevo, o escríbeme por WhatsApp al 961 342 7119.", "error");
        })
        .then(function () { enviar.disabled = false; });
    });
  }

  var anio = $("anio");
  if (anio) anio.textContent = new Date().getFullYear();
})();
