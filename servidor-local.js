// Servidor estático mínimo para probar en local (no necesita instalar nada).
// Uso:  node servidor-local.js landing 8080
var http = require("http");
var fs = require("fs");
var path = require("path");

var raiz = path.resolve(__dirname, process.argv[2] || "landing");
var puerto = Number(process.argv[3]) || 8080;
var tipos = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon"
};

http.createServer(function (req, res) {
  var ruta = decodeURIComponent(req.url.split("?")[0]);
  if (ruta.slice(-1) === "/") ruta += "index.html";
  var archivo = path.join(raiz, path.normalize(ruta));
  if (archivo.indexOf(raiz) !== 0) { res.writeHead(403); return res.end(); }
  fs.readFile(archivo, function (err, datos) {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("No encontrado"); }
    res.writeHead(200, { "Content-Type": tipos[path.extname(archivo).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(datos);
  });
}).listen(puerto, function () {
  console.log("Sirviendo " + raiz + " en http://localhost:" + puerto);
});
