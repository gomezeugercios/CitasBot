# CitasBot — landing de venta

Landing en español, de una sola página, para vender un chatbot de WhatsApp/Telegram
que gestiona citas 24/7. Está pensada para un visitante concreto: el dueño de una
clínica, peluquería, taller o gestoría que llega desde un email frío o un QR, la abre
**en el móvil** y decide en cinco segundos si sigue leyendo o cierra.

100 % estática. Sin build, sin frameworks, sin backend, sin cookies. Se abre haciendo
doble clic en `index.html` y se publica gratis en GitHub Pages.

```
citas-landing/
├── index.html              ← toda la página
├── .nojekyll               ← evita que GitHub Pages procese el sitio con Jekyll
├── robots.txt              ← cambia la URL del sitemap al publicar
├── sitemap.xml             ← cambia la URL al publicar
├── assets/
│   ├── css/styles.css
│   ├── js/main.js          ← ⚙️ EL BLOQUE DE CONFIGURACIÓN ESTÁ AQUÍ ARRIBA
│   └── img/
│       ├── favicon.svg
│       ├── og.png          ← 1200×630, la preview de WhatsApp
│       └── poster.png      ← 1280×720, portada del vídeo
└── tools/make-images.py    ← regenera og.png y poster.png (opcional)
```

Peso total del repositorio: **~180 KB**. La página carga unos 105 KB sin contar
tipografías ni vídeo. El presupuesto era 1,5 MB.

---

## 1. Verlo en local

Doble clic en `index.html`. No necesita servidor: funciona con `file://`.

Si prefieres servirlo (recomendable para probar rutas tal cual quedarán publicadas):

```bash
python -m http.server 8000
```

Y abre `http://localhost:8000`.

---

## 2. Publicarlo en GitHub Pages

1. Crea un repositorio **público** en GitHub. Llámalo por ejemplo `citas-landing`.
2. Sube el contenido de esta carpeta:

```bash
git init
git add .
git commit -m "Landing de CitasBot"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/citas-landing.git
git push -u origin main
```

3. En GitHub: **Settings → Pages**.
4. En *Source* elige **Deploy from a branch**; en *Branch*, `main` y carpeta `/ (root)`. Guarda.
5. Espera 1–2 minutos. Tu web estará en:
   `https://TU-USUARIO.github.io/citas-landing/`

> Si el repo se llama `TU-USUARIO.github.io`, la web sale directamente en
> `https://TU-USUARIO.github.io/` (sin subcarpeta), que queda más limpio para compartir.

### Paso obligatorio después de publicar

Abre `index.html` y sustituye **las cuatro apariciones** de
`https://TU-USUARIO.github.io/citas-landing/` por tu URL real (están todas juntas,
en el bloque comentado `SEO` al principio del `<head>`). Haz lo mismo en `robots.txt`
y `sitemap.xml`.

Esto **no** se puede leer desde el bloque de configuración del JS: los robots de
WhatsApp, Google y LinkedIn no ejecutan JavaScript, así que la URL de la imagen de
preview tiene que estar escrita en el HTML. Si te lo saltas, al pegar el enlace en
WhatsApp saldrá sin imagen.

**Comprueba la preview** pegando tu URL en
[developers.facebook.com/tools/debug](https://developers.facebook.com/tools/debug/)
y pulsando *Scrape Again*. WhatsApp usa la misma caché de Open Graph, así que si
cambias la imagen más adelante tendrás que forzar el rescrapeo ahí.

---

## 3. Cambiar vídeo, contacto y textos

Abre `assets/js/main.js`. Lo primero del fichero es un objeto `CONFIG` comentado.
**Es lo único que necesitas tocar.** En un minuto:

| Clave | Para qué sirve |
|---|---|
| `BRAND_NAME` | Nombre del proyecto (cabecera, móvil de la demo, pie). |
| `VIDEO_YOUTUBE_ID` | ID del vídeo de YouTube. Si lo rellenas, tiene prioridad. |
| `VIDEO_MP4` | Ruta al vídeo local. Se usa solo si el ID de YouTube está vacío. |
| `VIDEO_POSTER` | Portada del vídeo. |
| `WHATSAPP_PHONE` | Tu número, internacional, sin `+` ni espacios: `34600000000`. |
| `WHATSAPP_MESSAGE` | Mensaje que ya aparece escrito al abrir WhatsApp. |
| `CONTACT_EMAIL` / `CONTACT_EMAIL_SUBJECT` | Botón de email. |
| `FORMSPREE_ID` | Opcional. Vacío = el formulario ni se muestra. |
| `LEGAL_NAME` / `LEGAL_ID` | Opcional. Añaden una línea de identificación en el pie. |
| `CHAT_SCRIPT` | La conversación que se escribe sola en el móvil del hero. |

Los textos de venta (titulares, sectores, FAQ) están directamente en `index.html`,
en secciones marcadas con comentarios grandes. Búscalos por el nombre de la sección.

---

## 4. El vídeo demo

La sección del vídeo tiene tres estados, y el JS elige solo:

**A · YouTube (recomendado).** Rellena `VIDEO_YOUTUBE_ID`. Se usa una *facade*: primero
solo se pinta la portada y un botón de play; el reproductor se inyecta **al hacer clic**.
Así un vídeo incrustado no hunde la puntuación de rendimiento. Se usa el dominio
`youtube-nocookie.com`, que no deja cookies de seguimiento hasta que el visitante
pulsa play: por eso esta página no necesita banner de consentimiento.

**B · Fichero local.** Deja el ID de YouTube vacío y pon el `.mp4` en `assets/demo.mp4`.
Se monta un `<video controls preload="metadata">` con póster, que descarga solo unos
kilobytes hasta que alguien le da al play.

**C · Sin vídeo (estado actual).** Si no hay ninguna de las dos cosas —o si el `.mp4`
no existe— aparece un bloque cuidado con titular, explicación y botón de WhatsApp,
nunca un hueco roto. Esa es la configuración con la que se entrega el proyecto: la
página vende igual mientras grabas el vídeo.

### Comprimir el vídeo para GitHub

**GitHub rechaza ficheros de más de 100 MB** (y avisa a partir de 50 MB). Un minuto a
1080p suele caber de sobra, pero si te pasas:

```bash
ffmpeg -i original.mov -vf "scale=-2:1080" -c:v libx264 -preset slow -b:v 5M -maxrate 5.5M -bufsize 10M -c:a aac -b:a 128k -movflags +faststart assets/demo.mp4
```

`-movflags +faststart` es importante: coloca el índice al principio para que el vídeo
empiece a verse antes de descargarse entero. Si aun así no baja de 100 MB, reduce el
bitrate (`-b:v 3M`) o sube el vídeo a YouTube y usa la opción A, que además ahorra
ancho de banda.

---

## 5. Formulario de contacto (opcional)

La página no tiene servidor, así que un formulario necesita un servicio externo.
Está preparado para [Formspree](https://formspree.io) (plan gratuito):

1. Crea cuenta y un formulario nuevo.
2. Copia el ID de la URL `https://formspree.io/f/XXXXXXXX`.
3. Pégalo en `FORMSPREE_ID`.

Si lo dejas vacío el formulario permanece oculto y la sección de contacto funciona
solo con WhatsApp y email, que es lo que más convierte en este perfil de cliente.

---

## 6. Conectar un dominio propio más adelante

1. Compra el dominio donde quieras (IONOS, Namecheap, Cloudflare…).
2. En el panel DNS del proveedor:
   - Para el dominio raíz (`tudominio.com`), cuatro registros **A**:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Para `www`, un registro **CNAME** apuntando a `TU-USUARIO.github.io`
3. En GitHub: **Settings → Pages → Custom domain**, escribe tu dominio y guarda.
   Se creará un fichero `CNAME` en el repositorio.
4. Marca **Enforce HTTPS** cuando se active (tarda unos minutos en emitirse el certificado).
5. Actualiza las URLs absolutas del `<head>`, `robots.txt` y `sitemap.xml`, y vuelve a
   forzar el rescrapeo de Open Graph.

---

## 7. Regenerar las imágenes

`og.png` y `poster.png` están dibujadas por código, no son fotos de stock. Para
cambiarles el texto edita las constantes del principio de `tools/make-images.py` y:

```bash
pip install pillow
python tools/make-images.py
```

El póster **no lleva botón de play dibujado** a propósito: el play lo pone encima el
CSS (o el propio navegador). Si le dibujas uno saldrán dos.

---

## 8. Decisiones tomadas (y por qué)

**CSS puro en vez de Tailwind por CDN.** Tailwind por CDN son ~110 KB de JavaScript
que compilan estilos en el navegador y bloquean el primer pintado. La hoja de estilos
completa de esta página son 23 KB. Para una landing de una sola pantalla de scroll,
el CDN solo habría añadido peso.

**Paleta lima eléctrica (#C6F24E) + violeta (#7C5CFF) sobre negro azulado.** El azul
corporativo es exactamente lo que usa la competencia y lo que el visitante ya ha
descartado veinte veces. El lima sobre fondo oscuro da 15:1 de contraste, así que la
decisión estética también resuelve la accesibilidad.

**Tipografías: Space Grotesk (titulares) + Inter (texto), vía Google Fonts con
`font-display: swap`.** Google Fonts no deja cookies, pero sí registra la IP del
visitante. Si quieres cerrar ese frente del todo, descarga los `.woff2`, mételos en
`assets/fonts/` y sustituye el `<link>` por `@font-face`. Es la única petición a un
tercero que hace la página tal cual está.

**Copy centrado en la pérdida, no en la tecnología.** El titular no dice qué es el
producto, dice qué se está perdiendo el visitante ahora mismo. En toda la página no
aparecen las palabras «API», «IA conversacional» ni «NLP»: el dueño de una peluquería
no compra tecnología, compra dejar de perder citas.

**Las cifras son honestas.** «24/7» y «menos de 10 segundos» describen cómo funciona
el sistema, así que se afirman. El «hasta un 30 % menos de citas perdidas» va con
«hasta», con «pueden», y con una nota debajo que dice literalmente que es una
estimación orientativa y no un estudio propio. Un dueño de negocio que ya ha visto
cien landings detecta la estadística inventada, y cuando la detecta deja de creerse
también lo verdadero.

**Precio: no hay tabla.** La FAQ del precio responde con el criterio (lo que vale una
cita × las que se escapan al mes) e invita a hablar. Con verticales tan distintos,
una cifra en pantalla descarta clientes antes de la conversación.

**Un solo CTA principal por sección.** Hero: ver la demo. Final: WhatsApp. El email
es la alternativa, no un competidor visual.

**Sin cookies ni analítica.** Por eso no hay banner de consentimiento, que es la
primera fricción que se come a un visitante que viene de un QR. Si algún día quieres
medir, usa algo sin cookies (Plausible, Umami) antes que Google Analytics, o volverás
a necesitar el banner.

---

## 9. Accesibilidad y rendimiento

- Mobile-first real: diseñado a 390 px y ampliado hacia arriba, no al revés.
- Contraste AA en todo el texto (el gris más apagado está en 5,6:1).
- Objetivos táctiles de 52 px mínimo en todos los botones.
- Acordeón de FAQ con `aria-expanded` y `role="region"`; sin JavaScript las tres
  respuestas se ven abiertas en vez de quedar inaccesibles.
- `prefers-reduced-motion` respetado: se desactivan gradientes animados, el efecto
  de escritura del móvil, los contadores y las entradas al hacer scroll.
- Animaciones hechas a mano con `IntersectionObserver`. Cero librerías.
- El móvil del hero deja de animarse cuando sale de pantalla o cambias de pestaña.
- Todas las imágenes decorativas son SVG o CSS. No hay ni una foto de stock.

## 10. Verificado antes de entregar

- Renderizado a 390 px y a 1440 px: sin desbordamiento horizontal en ninguno de los dos.
- Sin `VIDEO_YOUTUBE_ID` y sin `assets/demo.mp4`, la sección del vídeo muestra el
  bloque alternativo con su CTA, no un hueco.
- Con `VIDEO_YOUTUBE_ID` puesto, se monta la portada y **cero iframes** hasta el clic.
- Enlaces de WhatsApp y `mailto:` generados con el mensaje y el asunto ya escritos.
- Formulario oculto mientras `FORMSPREE_ID` esté vacío.
- Acordeón, contadores y animaciones de entrada funcionando.
