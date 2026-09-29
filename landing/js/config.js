/* =====================================================================
   ✏️  CONFIGURACIÓN EDITABLE DE LA PÁGINA McLov3
   Aquí se cambia: el enlace del formulario, las temporadas y la galería.
   Reglas: respeta las comillas "" y las comas al final de cada línea.
   ===================================================================== */
window.MCLOV = {

  /* URL de la app web de Apps Script que guarda las solicitudes en el Sheet.
     Se obtiene al desplegar /formulario (ver README). Vacío = formulario sin conectar. */
  FORMULARIO_URL: "",

  /* Tema fijo: deja null para que cambie solo según la fecha.
     Para forzar uno escribe su nombre entre comillas, por ejemplo: "navidad".
     Temas: "base", "san-valentin", "dia-madres", "regreso-clases", "patrias", "muertos", "navidad" */
  TEMA_FIJO: null,

  /* Temporadas automáticas (formato "MM-DD"). Si una temporada cruza el año
     (por ejemplo del 01 de diciembre al 06 de enero) también funciona. */
  TEMPORADAS: [
    { tema: "san-valentin",   desde: "02-01", hasta: "02-14", aviso: "💘 Ajustes express para tu outfit de San Valentín" },
    { tema: "dia-madres",     desde: "04-25", hasta: "05-10", aviso: "🌷 Consiente a mamá: ajustes y composturas para el 10 de mayo" },
    { tema: "regreso-clases", desde: "08-01", hasta: "08-31", aviso: "✏️ Regreso a clases: bastillas, parches y ajustes de uniformes" },
    { tema: "patrias",        desde: "09-01", hasta: "09-16", aviso: "🇲🇽 ¡Viva México! Ajustes para tu traje típico y tu vestido de noche mexicana" },
    { tema: "muertos",        desde: "10-15", hasta: "11-02", aviso: "🎃 ¿Tu disfraz o tu vestido de catrina necesita ajustes? ¡Agenda con tiempo!" },
    { tema: "navidad",        desde: "12-01", hasta: "01-06", aviso: "🎄 Deja lista tu ropa para las posadas y las fiestas de fin de año" }
  ],

  /* Categorías de la galería (clave: "Texto del botón") */
  CATEGORIAS: {
    "vestidos": "Vestidos",
    "arreglos": "Arreglos",
    "tejido": "Tejido",
    "parches": "Parches",
    "antes-despues": "Antes y después"
  },

  /* Fotos de la galería. Sube las fotos a  img/galeria/  y agrégalas aquí.
     - Foto normal:        { foto: "img/galeria/archivo.jpg", categoria: "vestidos", titulo: "..." }
     - Con miniatura:      agrega  mini: "img/galeria/archivo-mini.jpg"  (carga más rápido)
     - Antes y después:    { antes: "img/galeria/a.jpg", despues: "img/galeria/b.jpg", categoria: "antes-despues", titulo: "..." }
     Las primeras fotos de la lista son las que se ven primero. */
  GALERIA: [
    { foto: "img/galeria/ejemplo-vestido.svg",  categoria: "vestidos", titulo: "Vestido de XV años hecho a la medida" },
    { antes: "img/galeria/ejemplo-antes.svg", despues: "img/galeria/ejemplo-despues.svg", categoria: "antes-despues", titulo: "Chamarra de mezclilla rejuvenecida" },
    { foto: "img/galeria/ejemplo-arreglo.svg",  categoria: "arreglos", titulo: "Bastilla y entallado de pantalón" },
    { foto: "img/galeria/ejemplo-tejido.svg",   categoria: "tejido",   titulo: "Gorro y bufanda tejidos a mano" },
    { foto: "img/galeria/ejemplo-parche.svg",   categoria: "parches",  titulo: "Parche decorativo en rodilla" },
    { foto: "img/galeria/ejemplo-uniforme.svg", categoria: "arreglos", titulo: "Ajuste de uniforme escolar" }
  ]
};
