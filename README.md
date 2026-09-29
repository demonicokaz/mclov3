# McLov3 · Página + CRM

La página (landing) y el control de clientes y pedidos de **McLov3 Costura y Composturas**, de Mafer (Col. Penipak, Tuxtla Gutiérrez).
Todo funciona gratis: la página en GitHub Pages y el CRM en Google Sheets + Apps Script.

📝 **¿Qué hay que cambiar y dónde?** → [GUIA-DE-CAMBIOS.md](GUIA-DE-CAMBIOS.md)

```
landing/       Página pública (HTML/CSS/JS, sin frameworks) → GitHub Pages
formulario/    Apps Script aparte que recibe las cotizaciones de la página (solo puede AGREGAR filas)
crm/           Apps Script pegado al Google Sheet: la app de pedidos para la tablet
crm/dev/       Solo para probar la app en la compu con datos falsos (no se sube a Google)
servidor-local.js   Servidor mínimo para probar en local (funciona hasta con Node 8)
```

---

## 1. Probar en la computadora

```bash
node servidor-local.js landing 8080
```
Abre http://localhost:8080. Para ver un tema de temporada: http://localhost:8080/?tema=navidad (también `muertos`, `patrias`, `san-valentin`, `dia-madres`, `regreso-clases`).

```bash
node servidor-local.js crm 8081
```
Abre http://localhost:8081/dev/preview.html. Es la app del CRM con datos de ejemplo guardados en tu navegador. Para empezar de cero, escribe `reiniciarDatosFalsos()` en la consola.

---

## 2. Publicar la página (GitHub Pages)

1. Crea un repositorio en GitHub (puede llamarse `mclov3`) y sube esta carpeta.
2. En el repo ve a **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada vez que cambie algo dentro de `landing/`, el flujo `.github/workflows/pages.yml` publica la página solo, en 1–2 minutos. No hay límite mensual de publicaciones.
4. La dirección es `https://demonicokaz.github.io/mclov3/` y ya está puesta en `landing/index.html` (`og:image`, `og:url` y el bloque `ld+json`), que es lo que usan WhatsApp y Facebook para mostrar la imagen. Si algún día cambia (por ejemplo, con dominio propio), actualízala ahí.
5. (Opcional) Un dominio propio como `mclov3.com.mx` se conecta en **Settings → Pages → Custom domain**.

> Con el plan gratis, GitHub Pages necesita un repositorio **público**. No pasa nada: el repo no guarda datos de clientes, esos viven en el Google Sheet.

### Cambios frecuentes (se pueden hacer desde github.com, incluso desde el celular)
Abre el archivo en GitHub, toca el lápiz ✏️, edita y da **Commit changes**.

| Quiero cambiar… | Archivo | Qué hacer |
|---|---|---|
| Tema de temporada | `landing/js/config.js` | Las fechas están en `TEMPORADAS`. Para fijar uno: `TEMA_FIJO: "navidad"` (y `null` para que vuelva a ser automático). |
| Fotos de trabajos | `landing/img/galeria/` + `config.js` | Sube la foto con **Add file → Upload files** y agrégala a `GALERIA`. Borra los `ejemplo-*.svg` cuando haya fotos reales. |
| Horario | `landing/index.html` | Busca `✏️ EDITAR: horario` (y también cámbialo en `openingHoursSpecification`, más arriba). |
| Servicios, "chambas", textos | `landing/index.html` | Busca los comentarios `✏️ EDITAR`. |
| Teléfono | `landing/index.html` | Busca `9613427119` y `961 342 7119`. |
| Logo e ilustración | `landing/img/logo.jpg`, `mafer.jpg`, `og.jpg` | Los actuales están recortados de capturas: hay que cambiarlos por los archivos originales. |
| Aviso de privacidad | `landing/aviso-privacidad.html` | Completa el nombre, el correo y la fecha, y que Mafer lo revise. |

**Fotos:** usa JPG o WebP de unos 1200 px de ancho y menos de 300 KB. Puedes comprimirlas gratis en https://squoosh.app. Si además subes una versión de 600 px, agrégala como `mini` y cargará más rápido.

---

## 3. Instalar el CRM (una sola vez)

Hazlo con la cuenta de Google de Mafer, o con una cuenta del negocio que ella use en la tablet.

1. Crea un Google Sheet vacío llamado **McLov3 CRM**.
2. En el Sheet: **Extensiones → Apps Script**.
3. Copia los archivos de `crm/` al editor. Borra el `Código.gs` que viene de ejemplo y crea:
   - Archivos de script (＋ → Secuencia de comandos): `Codigo`, `Datos`, `Api`, `Instalar`, cada uno con el contenido de su `.gs`.
   - Archivos HTML (＋ → HTML): `index`, `estilos`, `app`, con el contenido de sus `.html`.
   - En **Configuración del proyecto ⚙️**, pon la zona horaria **(GMT-06:00) Ciudad de México**.
4. Recarga el Sheet. Aparece el menú **McLov3** → **Instalar / reparar hojas**.
   - Google pedirá permisos y dirá "Google no verificó esta app". Es normal, porque la app es tuya: **Configuración avanzada → Ir a McLov3 CRM**.
   - Se crean las hojas Clientes, Pedidos, Pagos, Solicitudes y Config, además de un respaldo automático el día 1 de cada mes en la carpeta de Drive "Respaldos McLov3".
5. En Apps Script: **Implementar → Nueva implementación → ⚙️ App web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Solo yo**
   - Copia la URL que termina en `/exec`.
6. **En la tablet** (Chrome, con la cuenta de Mafer): abre la URL → menú ⋮ → **Agregar a la pantalla principal**. En el celular se hace lo mismo.
   - ⚠️ En ese Chrome debe haber **una sola cuenta de Google** abierta. Con varias, Apps Script falla (es un bug conocido de Google).

**Si cambias el código después:** **Implementar → Gestionar implementaciones → ✏️ → Versión: Nueva versión → Implementar**. La URL no cambia.

> **Alternativa con `clasp`** (subir el código desde la terminal): requiere Node 18 o más reciente, y en esta compu está Node 8. Con Node actualizado: `npm i -g @google/clasp`, `clasp login`, y dentro de `crm/` usa `clasp clone <ID del script>` seguido de `clasp push`. `.claspignore` ya excluye `dev/`.

## 4. Conectar el formulario de la página

1. Ve a https://script.new (crea un proyecto aparte) y ponle de nombre **McLov3 Formulario**.
2. Pega el contenido de `formulario/Formulario.gs`. En `SHEET_ID` pon el ID del Sheet: la parte larga de su URL, `docs.google.com/spreadsheets/d/`**`ESTE_ID`**`/edit`.
3. Elige la función `probar` y dale ▶ **Ejecutar**. Autoriza igual que antes y revisa que aparezca una fila en **Solicitudes**; después bórrala.
4. **Implementar → Nueva implementación → App web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
5. Copia la URL `/exec` y pégala en `landing/js/config.js` → `FORMULARIO_URL: "https://script.google.com/macros/s/…/exec"`.
6. Manda una solicitud desde la página publicada. Debe aparecer en la app, en la pestaña 📨 Solicitudes.

¿Por qué son dos proyectos? El del formulario tiene que estar abierto a "cualquier persona" y **solo puede agregar solicitudes**. El CRM queda cerrado a la cuenta de Mafer.

---

## 5. Cómo se usa la app (para Mafer)

- **🏠 Inicio:** entregas de hoy, atrasados, listos, cuánto le deben y solicitudes nuevas. Toca cualquier tarjeta para ver la lista.
- **＋ Nuevo pedido:** busca al cliente o crea uno nuevo, elige el tipo de trabajo, precio, anticipo y fecha de entrega.
  - Si es su **primera vez**, la app pone el **10% de descuento** sola.
  - Si ya juntó **9 sellos**, avisa que **este es GRATIS** 🎁.
- **Pedido:** el número (#12) sirve para escribirlo en la etiqueta de la prenda. Toca el estado (Recibido → En proceso → Listo → Entregado).
  - Con el pedido en "Listo" aparece el botón para **avisarle por WhatsApp**.
  - Los **abonos** se registran ahí mismo.
  - **Ver nota** muestra una nota para mandar en captura de pantalla o como texto.
- **👩 Clientes:** datos, **medidas**, historial y **tarjeta de fidelidad**. Cada pedido entregado suma un sello.
- **💰 Cobros ("Cobrando ando"):** quién debe y cuánto, con un botón para mandar el recordatorio por WhatsApp.
- **📨 Solicitudes:** lo que llega desde la página. **Responder** abre WhatsApp con el mensaje ya escrito, y **Crear cliente** lo pasa a clientes.
- **⟳** (arriba a la derecha) actualiza los datos. La app también se actualiza sola si pasan más de 5 minutos.

### Editar directo en el Sheet (como Excel)
- ✅ Sí se puede: cambiar valores, marcar casillas y editar la hoja **Config** (mensajes de WhatsApp, `tipos` de trabajo, `sellos_para_regalo`, `descuento_primera`, `sellos_por` = `pedido` o `prenda`).
- ❌ No se debe: cambiar el orden de las columnas ni los encabezados, ni escribir en las columnas verdes de Pedidos (cliente, pagado y saldo se calculan solos).
- En los mensajes de WhatsApp se pueden usar `{nombre}`, `{folio}`, `{saldo}`, `{saldo_txt}`, `{total}`, `{pagado}`, `{trabajo}`, `{prendas}`, `{entrega}`, `{folios}`, `{servicio}`, `{negocio}` y `{firma}`.

---

## 6. Límites y notas

- **Gratis:** GitHub Pages (sitios hasta 1 GB) y Google Sheets / Apps Script con cuenta normal alcanzan de sobra para este negocio.
- **Velocidad:** la app tarda de 2 a 4 s en abrir, porque Google la prepara, y cada guardado ~1 s. Necesita internet.
- **Respaldos:** automáticos cada mes. Además, Sheets guarda un historial de versiones (**Archivo → Historial de versiones**).
- **Privacidad:** el CRM solo lo abre la cuenta de Mafer. La página tiene aviso de privacidad y casilla de aceptación. Falta completarlo (ver arriba).

## Pendientes / ideas para después
- Poner el logo, la ilustración y las fotos originales, y el horario real.
- Perfil de **Google Business** (gratis): ayuda mucho en búsquedas como "costurera en Tuxtla".
- Aviso por correo de solicitudes nuevas (una línea con `MailApp` en `Formulario.gs`).
- Fotos por pedido guardadas en Drive, o una casilla "mostrar en la galería".
- Si llega spam al formulario: Cloudflare Turnstile (gratis).
