# Guía de cambios · McLov3

Qué **debes** cambiar antes de anunciar la página, qué **puedes** cambiar cuando quieras y qué **no conviene tocar**.

**Cómo encontrar cada cosa:** abre el archivo en GitHub (o en tu editor) y busca con `Ctrl + F` el texto que aparece en la columna "Busca". Los números de línea cambian con cada edición; esos textos no.

**Cómo publicar un cambio de la página:** edita el archivo en github.com (lápiz ✏️) y haz **Commit changes**. En 1–2 minutos la página se actualiza sola en https://demonicokaz.github.io/mclov3/ (puedes ver el avance en la pestaña **Actions**).

---

## 1. Lo que DEBES cambiar (antes de anunciarla)

### 1.1 Conectar el formulario con Google
Sin esto, el formulario le dice al cliente que le escriba por WhatsApp. Sigue las secciones 3 y 4 del [README](README.md) en este orden:

| Paso | Qué | Dónde | Busca | De dónde sale |
|---|---|---|---|---|
| 1 | ID del Sheet | `formulario/Formulario.gs`, **pegado en el editor de Apps Script** (no hace falta subirlo al repo) | `PEGA_AQUI_EL_ID_DEL_SHEET` | La dirección del Sheet: `docs.google.com/spreadsheets/d/`**`ESTE_ID`**`/edit` |
| 2 | URL del formulario | [`landing/js/config.js`](landing/js/config.js) | `FORMULARIO_URL: ""` | Al implementar el formulario como App web te da una URL que termina en `/exec`. Pégala entre las comillas. |

La URL del **CRM** no va en ningún archivo: solo se abre en la tablet y se guarda como ícono.

### 1.2 Textos que inventé (confírmalos con Mafer)
Todos están en [`landing/index.html`](landing/index.html):

| Qué | Busca | Nota |
|---|---|---|
| Frase de bienvenida | `Soy Mafer y le doy amor a tu ropa` | Solo cambia el texto; deja `<span class="brocha">¡Hola!</span>` como está |
| Los 6 servicios y sus descripciones | `✏️ EDITAR: servicios` | Cada servicio es un bloque `<article class="servicio">…</article>` |
| Lista de "chambas" | `✏️ EDITAR: agrega o quita chambas` | Cada chamba es un `<li>…</li>` |
| **Horario (2 lugares)** | `✏️ EDITAR: horario real` **y** `openingHoursSpecification` | El primero es lo que ven las personas. El segundo es lo que lee Google: días en inglés (`Monday`…) y horas en formato `"10:00"`. |

### 1.3 Imágenes
Las actuales están recortadas de capturas de WhatsApp y se ven borrosas. Van en `landing/img/`:

| Archivo | Qué es | Tamaño ideal |
|---|---|---|
| `logo.jpg` | Logo de la cabecera | ~600 px de ancho |
| `mafer.jpg` | Ilustración del inicio (se muestra en círculo) | Cuadrada, ~600 × 600 px |
| `og.jpg` | Imagen que aparece al compartir el enlace en WhatsApp/Facebook | **Exactamente 1200 × 630 px** |
| `icono-180.png` | Ícono cuando alguien guarda la página en su celular | 180 × 180 px |
| `galeria/ejemplo-*.svg` | Fotos de ejemplo de la galería | Bórralas cuando haya fotos reales (ver 2.2) |

Para reemplazar una imagen, súbela con **el mismo nombre** (Add file → Upload files) y no hay que tocar ningún código. Comprímelas en https://squoosh.app para que pesen menos de 300 KB.

### 1.4 Aviso de privacidad
En [`landing/aviso-privacidad.html`](landing/aviso-privacidad.html) completa `[Nombre completo de Mafer]`, `[correo de contacto]` y `[fecha]`, y pídele a Mafer que lo lea.

---

## 2. Lo que PUEDES cambiar cuando quieras

### 2.1 Temas de temporada
Todo está en [`landing/js/config.js`](landing/js/config.js):

| Quiero… | Qué hacer |
|---|---|
| Que cambie solo según la fecha | Deja `TEMA_FIJO: null` (así está ahora) |
| Fijar un tema | `TEMA_FIJO: "navidad"`. Opciones: `"base"`, `"san-valentin"`, `"dia-madres"`, `"regreso-clases"`, `"patrias"`, `"muertos"`, `"navidad"` |
| Cambiar las fechas o el mensaje de la franja de arriba | Edita `desde`, `hasta` (formato `"MM-DD"`) y `aviso` en `TEMPORADAS` |
| Ver un tema sin publicarlo | Abre la página con `?tema=muertos` al final de la dirección |
| Cambiar los colores de un tema | [`landing/css/temporadas.css`](landing/css/temporadas.css), en el bloque de ese tema |
| Crear un tema nuevo | Copia un bloque en `temporadas.css`, cámbiale el nombre y agrégalo a `TEMPORADAS` |

### 2.2 Galería de trabajos
1. Sube la foto a `landing/img/galeria/`, por ejemplo `vestido-xv-ana.jpg`.
2. En [`landing/js/config.js`](landing/js/config.js), dentro de `GALERIA: [ … ]`, agrega una línea:
   ```js
   { foto: "img/galeria/vestido-xv-ana.jpg", categoria: "vestidos", titulo: "Vestido de XV años" },
   ```
   - **Antes y después:** `{ antes: "img/galeria/a.jpg", despues: "img/galeria/b.jpg", categoria: "antes-despues", titulo: "…" },`
   - **Categorías disponibles:** `vestidos`, `arreglos`, `tejido`, `parches`, `antes-despues`. Para agregar otra, edita `CATEGORIAS`.
   - Las primeras fotos de la lista son las que se ven primero.
3. Borra las líneas de `ejemplo-*.svg`.

### 2.3 Datos del negocio

| Qué | Dónde | Busca |
|---|---|---|
| **Teléfono / WhatsApp** | `landing/index.html` (3 enlaces + la ficha para Google) | `529613427119` (en los enlaces va con 52 y sin espacios) y `+52 961 342 7119` |
| | `landing/js/main.js` (mensajes de error del formulario) | `961 342 7119` |
| | `landing/aviso-privacidad.html` | `529613427119` y `961 342 7119` |
| | Hoja **Config** del Sheet del CRM | `telefono_negocio` |
| Promoción de 10% | `landing/index.html` | `10%` (sale en 3 lugares: el inicio, la tarjeta de fidelidad y la descripción para compartir) |
| Redes sociales | `landing/index.html` | `✏️ EDITAR: redes sociales`. Pega tu enlace y quita los `<!--` `-->` que lo rodean |
| Ubicación / mapa | `landing/index.html` | `Penipak` (texto, botón del mapa y enlace a Google Maps) |
| Título y descripción en Google | `landing/index.html` | `<title>` y `name="description"` |
| Texto al compartir el enlace | `landing/index.html` | `og:title` y `og:description` |
| Opciones de "¿Qué necesitas?" | `landing/index.html` → `✏️ EDITAR: opciones del formulario` **y** `formulario/Formulario.gs` → `var SERVICIOS` | Mantén las dos listas iguales. Si no, la solicitud igual llega, pero marcada como "Otro: …" |

### 2.4 Colores y letra de la página (tema normal)
En [`landing/css/estilos.css`](landing/css/estilos.css), al inicio, dentro de `:root { … }`: `--morado`, `--rosa-fuerte`, `--lila`, `--teal`, etc. La letra de los títulos es **Kalam** (de Google Fonts). Se cambia en `landing/index.html` (busca `family=Kalam`) y en `--letra-mano`.

### 2.5 CRM: sin tocar código, desde la hoja **Config** del Sheet

| Clave | Para qué | Valor actual |
|---|---|---|
| `negocio` | Nombre en mensajes y notas | McLov3 |
| `firma` | Nombre con el que saluda la app y firma los mensajes | Mafer |
| `telefono_negocio` | Teléfono en la nota de pedido | 961 342 7119 |
| `sellos_para_regalo` | Arreglos necesarios para el regalo | 9 |
| `sellos_por` | `pedido` (1 sello por pedido) o `prenda` (1 por prenda) | pedido |
| `descuento_primera` | % de descuento la primera vez (`0` = no hay) | 10 |
| `tipos` | Botones de tipo de trabajo, separados por comas | Arreglo, Compostura, … |
| `wa_solicitud` | Mensaje para responder una solicitud de la página | |
| `wa_listo` | Aviso de "tu pedido ya está listo" | |
| `wa_cobro` | Recordatorio de saldo | |
| `wa_nota` | Nota de pedido enviada como texto | |

**Palabras que se reemplazan solas** en los mensajes `wa_*`: `{nombre}`, `{folio}`, `{saldo}`, `{saldo_txt}`, `{total}`, `{pagado}`, `{trabajo}`, `{prendas}`, `{entrega}`, `{folios}`, `{servicio}`, `{negocio}` y `{firma}`. Para un salto de línea dentro de la celda: `Ctrl + Enter`.

Después de cambiar Config, toca **⟳** en la app para que tome los cambios.

### 2.6 CRM: en el código (opcional)
Si cambias algo de `crm/`, pégalo en el editor de Apps Script y haz **Implementar → Gestionar implementaciones → ✏️ → Nueva versión**.

| Qué | Dónde | Busca |
|---|---|---|
| Medidas sugeridas al capturar un cliente | `crm/app.html` | `MEDIDAS_SUGERIDAS` |
| Formas de pago | `crm/Datos.gs` **y** `crm/app.html` (en los dos) | `var METODOS`. Después ejecuta **McLov3 → Instalar / reparar hojas** |
| Colores de la app | `crm/estilos.html` | `:root` |

### 2.7 Anti-spam del formulario
En `formulario/Formulario.gs` están `MAX_POR_TELEFONO_POR_HORA` (3), `MAX_POR_DIA` (60) y `TIEMPO_MINIMO_MS` (3000). Si los cambias, crea una nueva versión de la implementación.

---

## 3. Lo que NO conviene tocar (se rompe)

- **Orden y encabezados de columnas del Sheet.** El código las busca por posición. En la hoja Pedidos, las columnas verdes (`cliente`, `pagado`, `saldo`) se calculan solas: no escribas en ellas.
- **Los estados** (`Recibido`, `En proceso`, `Listo`, `Entregado`). Dependen de ellos los colores del Sheet, las validaciones y la app.
- **Los `id="…"` y `data-…` del HTML**, por ejemplo `id="galeria"` o `id="form-cotiza"`. Los usa el JavaScript.
- **Los nombres de funciones** en los archivos `.gs` (`doPost`, `cargarTodo`, `guardarPedido`, …).
- **La puntuación de `config.js`.** Cada línea termina en coma, los textos van entre comillas `"…"` y `null` va sin comillas. Si la página se ve "rota" después de editarlo, casi siempre falta una coma o una comilla.
- **`.github/workflows/pages.yml`.** Es lo que publica la página.
- **`crm/dev/`.** Solo sirve para pruebas en la compu y no se sube a Google.

¿Algo salió mal? En GitHub, abre el archivo → **History**, y puedes ver o restaurar cualquier versión anterior. En el Sheet: **Archivo → Historial de versiones**.
