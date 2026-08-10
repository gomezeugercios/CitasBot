/* =====================================================================
   CitasBot · landing — JS vanilla, sin dependencias.
   ===================================================================== */

/* ╔═══════════════════════════════════════════════════════════════════╗
   ║                                                                   ║
   ║   ⚙️  BLOQUE DE CONFIGURACIÓN — ES LO ÚNICO QUE TIENES QUE TOCAR   ║
   ║                                                                   ║
   ║   Cambia estos valores y guarda. Nada más en todo el proyecto     ║
   ║   necesita ediciones para poner la página en marcha.              ║
   ║   (Excepción: las metaetiquetas og: de index.html, que llevan la   ║
   ║   URL absoluta de tu web. Los robots de WhatsApp no leen JS.)      ║
   ║                                                                   ║
   ╚═══════════════════════════════════════════════════════════════════╝ */

const CONFIG = {

  /* ───── 1. IDENTIDAD ───────────────────────────────────────────── */

  // Nombre del proyecto. Aparece en la cabecera, el móvil de la demo y el pie.
  BRAND_NAME: 'CitasBot',


  /* ───── 2. VÍDEO DEMO ──────────────────────────────────────────── */

  // OPCIÓN A (recomendada): sube el vídeo a YouTube y pega aquí su ID.
  // El ID son los 11 caracteres tras "v=" en https://youtube.com/watch?v=XXXXXXXXXXX
  // Se carga en diferido: primero la portada, y el reproductor solo al pulsar play
  // (así no hunde la puntuación de rendimiento y no se cargan cookies de Google).
  VIDEO_YOUTUBE_ID: 'lZMS8nRKg0w',

  // OPCIÓN B: si dejas VIDEO_YOUTUBE_ID vacío, se usa este fichero local.
  // Déjalo en '' si todavía no tienes vídeo: se mostrará un bloque alternativo
  // con botón de WhatsApp (nunca un hueco roto).
  VIDEO_MP4: 'assets/demo.mp4',

  // Portada del vídeo (vale para las dos opciones). Si prefieres la miniatura
  // real de YouTube, pon: 'https://i.ytimg.com/vi/TU_ID/maxresdefault.jpg'
  VIDEO_POSTER: 'assets/img/poster.png',


  /* ───── 3. CONTACTO ────────────────────────────────────────────── */

  // WhatsApp en formato internacional, SIN "+", SIN espacios. 34 = España.
  WHATSAPP_PHONE: '+34 684 18 57 70',

  // Mensaje que aparece ya escrito cuando el visitante abre WhatsApp.
  WHATSAPP_MESSAGE: 'Hola, he visto la demo del chatbot de citas y quiero probarlo',

  // Email de contacto (botón "Mándame un email").
  CONTACT_EMAIL: 'gomezeugercios@gmail.com',

  // Asunto precargado en ese email.
  CONTACT_EMAIL_SUBJECT: 'Quiero probar el chatbot de citas',


  /* ───── 4. FORMULARIO (OPCIONAL) ───────────────────────────────── */

  // Como la página no tiene servidor, el formulario necesita Formspree.
  // Crea una cuenta gratis en https://formspree.io, crea un form y pega aquí
  // el ID (la parte final de la URL: https://formspree.io/f/XXXXXXXX).
  // Si lo dejas vacío, el formulario NO se muestra: solo WhatsApp y email.
  FORMSPREE_ID: '',


  /* ───── 5. AVISO LEGAL (OPCIONAL PERO RECOMENDADO) ─────────────── */

  // La LSSI española pide identificar a quien presta el servicio.
  // Si rellenas estos dos campos aparece una línea discreta en el pie.
  LEGAL_NAME: 'Mario Gomez Eugercios',   // p. ej. 'Eugenio Gómez'
  LEGAL_ID:   '',   // p. ej. 'NIF 00000000X'


  /* ───── 6. CONVERSACIÓN DEL MÓVIL DEL HERO ─────────────────────── */

  // Se escribe sola en bucle. Cámbiala por una de tu sector si quieres.
  CHAT_SCRIPT: [
    { who: 'user', text: 'Hola, ¿tenéis hueco esta semana?' },
    { who: 'bot',  text: '¡Hola! Sí 🙂 Me queda el jueves a las 17:30 y el viernes a las 10:00. ¿Cuál te viene mejor?' },
    { who: 'user', text: 'El jueves a las 17:30' },
    { who: 'bot',  text: 'Hecho, cita confirmada para el jueves a las 17:30. Te aviso el miércoles para que no se te pase 👌' }
  ]
};

/* ╔═══════════════════════════════════════════════════════════════════╗
   ║   A partir de aquí no hace falta que toques nada.                 ║
   ╚═══════════════════════════════════════════════════════════════════╝ */

(function () {
  'use strict';

  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────── Identidad y enlaces de contacto ─────────── */

  function applyConfig() {
    $$('[data-brand]').forEach(el => { el.textContent = CONFIG.BRAND_NAME; });
    document.title = document.title.replace('CitasBot', CONFIG.BRAND_NAME);

    const avatar = $('.chat__avatar');
    if (avatar) avatar.textContent = CONFIG.BRAND_NAME.trim().charAt(0).toUpperCase();

    // WhatsApp
    const waHref = 'https://wa.me/' + CONFIG.WHATSAPP_PHONE.replace(/\D/g, '') +
                   '?text=' + encodeURIComponent(CONFIG.WHATSAPP_MESSAGE);
    $$('[id="waBtn"], [data-wa]').forEach(a => {
      a.href = waHref;
      a.target = '_blank';
      a.rel = 'noopener';
    });

    // Email
    const mailHref = 'mailto:' + CONFIG.CONTACT_EMAIL +
                     '?subject=' + encodeURIComponent(CONFIG.CONTACT_EMAIL_SUBJECT);
    const mailBtn = $('#mailBtn');
    if (mailBtn) mailBtn.href = mailHref;

    // Pie legal (LSSI): solo si está relleno
    const legal = $('#footerLegal');
    if (legal && CONFIG.LEGAL_NAME) {
      legal.textContent = 'Servicio prestado por ' + CONFIG.LEGAL_NAME +
        (CONFIG.LEGAL_ID ? ' · ' + CONFIG.LEGAL_ID : '') + ' · ' + CONFIG.CONTACT_EMAIL;
    }

    return waHref;
  }

  /* ─────────── Sección de vídeo ─────────── */

  const PLAY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>';

  function mountVideo(waHref) {
    const mount = $('#videoMount');
    if (!mount) return;

    if (CONFIG.VIDEO_YOUTUBE_ID) return mountYouTubeFacade(mount);
    if (CONFIG.VIDEO_MP4)        return mountLocalVideo(mount, waHref);
    return mountPlaceholder(mount, waHref);
  }

  // Facade: portada + botón. El iframe se inyecta SOLO al hacer clic.
  function mountYouTubeFacade(mount) {
    mount.dataset.state = 'facade';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'video__facade';
    btn.setAttribute('aria-label', 'Reproducir el vídeo demo de 60 segundos');
    btn.innerHTML =
      '<img src="' + CONFIG.VIDEO_POSTER + '" alt="" width="1280" height="720" loading="lazy" decoding="async">' +
      '<span class="video__play" aria-hidden="true">' + PLAY_SVG + '</span>' +
      '<span class="video__label">Demo real · 60 segundos<small>Se carga solo al pulsar play. Sin cookies antes de eso.</small></span>';

    btn.addEventListener('click', function () {
      const iframe = document.createElement('iframe');
      // Sin referrer, YouTube devuelve "Error 153". Con file:// no hay origin
      // válido, así que en local hay que servir la página por http (ver README).
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      // youtube-nocookie: no deja cookies de seguimiento → no hace falta banner.
      let src = 'https://www.youtube-nocookie.com/embed/' + CONFIG.VIDEO_YOUTUBE_ID +
                '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      if (location.protocol === 'http:' || location.protocol === 'https:') {
        src += '&origin=' + encodeURIComponent(location.origin);
      }
      iframe.src = src;
      iframe.title = 'Vídeo demo del chatbot de citas';
      iframe.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      mount.replaceChildren(iframe);
      mount.dataset.state = 'playing';
      iframe.focus();
    });

    mount.replaceChildren(btn);
  }

  // Vídeo local. Si el fichero no existe, cae en el bloque alternativo.
  function mountLocalVideo(mount, waHref) {
    mount.dataset.state = 'local';
    const video = document.createElement('video');
    video.controls = true;
    video.preload = 'metadata';
    video.playsInline = true;
    video.poster = CONFIG.VIDEO_POSTER;
    video.setAttribute('aria-label', 'Vídeo demo del chatbot de citas');

    const source = document.createElement('source');
    source.src = CONFIG.VIDEO_MP4;
    source.type = 'video/mp4';

    let failed = false;
    const fail = () => { if (!failed) { failed = true; mountPlaceholder(mount, waHref); } };
    source.addEventListener('error', fail);
    video.addEventListener('error', fail);

    video.appendChild(source);
    video.appendChild(document.createTextNode(
      'Tu navegador no puede reproducir el vídeo. Escríbeme y te lo mando por WhatsApp.'
    ));
    mount.replaceChildren(video);
  }

  // Nunca un hueco roto: si no hay vídeo, esto sigue vendiendo.
  function mountPlaceholder(mount, waHref) {
    mount.dataset.state = 'empty';
    const box = document.createElement('div');
    box.className = 'video__empty';
    box.innerHTML =
      '<span class="video__frame" aria-hidden="true"></span>' +
      '<span class="video__play" aria-hidden="true">' + PLAY_SVG + '</span>' +
      '<h3>El vídeo se está grabando ahora mismo</h3>' +
      '<p>Mientras tanto te lo enseño en directo: escríbeme y en cinco minutos ves ' +
      'una conversación completa con tu propio caso.</p>' +
      '<a class="btn btn--wa" data-wa href="#">Que me lo enseñen ya</a>';
    mount.replaceChildren(box);
    const a = $('[data-wa]', box);
    if (a) { a.href = waHref; a.target = '_blank'; a.rel = 'noopener'; }
  }

  /* ─────────── Conversación que se escribe sola ─────────── */

  function chatLoop() {
    const body = $('#chatBody');
    if (!body) return;
    const script = CONFIG.CHAT_SCRIPT || [];

    // Sin animación: se pinta la conversación entera y punto.
    if (REDUCED) {
      script.forEach(m => {
        const b = document.createElement('div');
        b.className = 'bub bub--' + m.who;
        b.textContent = m.text;
        body.appendChild(b);
      });
      return;
    }

    let visible = true, alive = true;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const idle = () => new Promise(r => {
      (function wait() { (visible && !document.hidden) ? r() : setTimeout(wait, 320); })();
    });

    async function type(bubble, text, speed) {
      const caret = document.createElement('span');
      caret.className = 'caret';
      bubble.appendChild(caret);
      for (let i = 0; i < text.length; i++) {
        if (!alive) return;
        caret.before(document.createTextNode(text[i]));
        await sleep(speed + Math.random() * speed * 0.6);
      }
      caret.remove();
    }

    async function run() {
      while (alive) {
        await idle();
        body.replaceChildren();
        for (const msg of script) {
          if (!alive) return;
          await idle();
          if (msg.who === 'bot') {
            const dots = document.createElement('div');
            dots.className = 'bub bub--bot bub--typing';
            dots.innerHTML = '<i></i><i></i><i></i>';
            body.appendChild(dots);
            await sleep(850);
            dots.remove();
          }
          const bubble = document.createElement('div');
          bubble.className = 'bub bub--' + msg.who;
          body.appendChild(bubble);
          await type(bubble, msg.text, msg.who === 'bot' ? 16 : 34);
          await sleep(msg.who === 'bot' ? 900 : 500);
        }
        await sleep(3400);
      }
    }

    // No gastamos CPU cuando el móvil no se ve.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { visible = entries[0].isIntersecting; },
        { threshold: 0.15 }).observe(body);
    }
    run();
  }

  /* ─────────── Animaciones de entrada + contadores ─────────── */

  function reveals() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window) || REDUCED) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const siblings = Array.from(entry.target.parentElement.children).filter(n => n.classList.contains('reveal'));
        const delay = Math.min(siblings.indexOf(entry.target), 7) * 70;
        entry.target.style.transitionDelay = delay + 'ms';
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(el => io.observe(el));
  }

  function counters() {
    const nums = $$('[data-count]');
    const paint = el => { el.textContent = el.dataset.count; };
    if (!('IntersectionObserver' in window) || REDUCED) { nums.forEach(paint); return; }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target, target = parseInt(el.dataset.count, 10) || 0;
        obs.unobserve(el);
        if (target === 0) { paint(el); return; }
        const t0 = performance.now(), dur = 1400;
        (function step(now) {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.5 });
    nums.forEach(el => io.observe(el));
  }

  /* ─────────── Acordeón de objeciones ─────────── */

  function faq() {
    const buttons = $$('.faq__q');
    // El estado plegado lo pone el JS: sin JS, las respuestas se ven todas.
    buttons.forEach(btn => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      panel.setAttribute('data-collapsed', '');
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        buttons.forEach(other => {                       // uno abierto cada vez
          other.setAttribute('aria-expanded', 'false');
          document.getElementById(other.getAttribute('aria-controls')).setAttribute('data-collapsed', '');
        });
        if (!open) {
          btn.setAttribute('aria-expanded', 'true');
          panel.removeAttribute('data-collapsed');
        }
      });
    });
  }

  /* ─────────── Cabecera pegajosa ─────────── */

  function stickyHeader() {
    const header = $('#siteHeader');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─────────── Formulario opcional (Formspree) ─────────── */

  function contactForm() {
    const form = $('#contactForm');
    if (!form) return;
    if (!CONFIG.FORMSPREE_ID) return;                    // sin ID → queda oculto

    form.action = 'https://formspree.io/f/' + CONFIG.FORMSPREE_ID;
    form.hidden = false;

    const status = $('#formStatus');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      status.removeAttribute('data-err');
      status.textContent = 'Enviando…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        status.setAttribute('data-ok', '');
        status.textContent = '¡Recibido! Te escribo hoy mismo.';
      } catch (err) {
        status.setAttribute('data-err', '');
        status.textContent = 'No he podido enviarlo. Escríbeme por WhatsApp y lo vemos.';
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* ─────────── Arranque ─────────── */

  function init() {
    const waHref = applyConfig();
    mountVideo(waHref);
    chatLoop();
    reveals();
    counters();
    faq();
    stickyHeader();
    contactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
