/* ==========================================================================
   Ana Sofia & Nate — Wedding Website (Vanilla JS)
   Saturday, August 7th, 2027 · Medellín, Colombia
   ========================================================================== */

(function () {
  'use strict';

  if (window.__WEDDING_APP_INITIALIZED__) return;
  window.__WEDDING_APP_INITIALIZED__ = true;

  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // --------------------------------------------------------------------------
  // 1. COUNTDOWN — August 7, 2027 at 4:00 PM COT (UTC−5)
  // --------------------------------------------------------------------------
  const WEDDING_TIMESTAMP = new Date('2027-08-07T16:00:00-05:00').getTime();
  const cd = { d: $('cd-days'), h: $('cd-hours'), m: $('cd-minutes'), s: $('cd-seconds') };

  function updateCountdown() {
    const diff = Math.max(0, WEDDING_TIMESTAMP - Date.now());
    const pad = (n) => String(n).padStart(2, '0');
    if (cd.d) cd.d.textContent = String(Math.floor(diff / 86400000));
    if (cd.h) cd.h.textContent = pad(Math.floor((diff / 3600000) % 24));
    if (cd.m) cd.m.textContent = pad(Math.floor((diff / 60000) % 60));
    if (cd.s) cd.s.textContent = pad(Math.floor((diff / 1000) % 60));
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // --------------------------------------------------------------------------
  // 2. SCROLL REVEALS (one-time, staggered)
  // --------------------------------------------------------------------------
  document.querySelectorAll('[data-stagger-group]').forEach((group) => {
    group.querySelectorAll('[data-reveal]').forEach((item, idx) => {
      item.style.transitionDelay = `${idx * 110}ms`;
    });
  });

  const revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-revealed'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  // --------------------------------------------------------------------------
  // 3. SCROLL-DRIVEN EFFECTS
  //    header state · progress ribbon · hero parallax · gentle photo zoom ·
  //    story timeline · sticky Medellín portal
  // --------------------------------------------------------------------------
  const siteHeader = $('siteHeader');
  const progressBar = $('scrollProgressBar');
  const heroBg = $('heroBg');
  const zoomObjects = document.querySelectorAll('[data-scroll-zoom]');
  const timelineBox = $('storyTimelineContainer');
  const timelineProgress = $('storyTimelineProgress');
  const timelineNodes = document.querySelectorAll('.timeline-node');

  const portal = {
    track: $('portalScrollTrack'),
    arch: $('portalArchWindow'),
    inner: $('portalInnerBg'),
    left: $('portalLeftShutter'),
    right: $('portalRightShutter'),
    label: $('portalProgressLabel'),
    steps: [$('portalStep1'), $('portalStep2'), $('portalStep3')],
    dots: [$('portalDot1'), $('portalDot2'), $('portalDot3')],
  };

  let lastStep = 0;
  let ticking = false;

  function updateScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const vh = window.innerHeight || 1;
    const docH = Math.max(1, document.documentElement.scrollHeight - vh);

    if (siteHeader) siteHeader.classList.toggle('is-scrolled', scrollY > 40);
    if (progressBar) progressBar.style.transform = `scaleX(${clamp(scrollY / docH, 0, 1).toFixed(4)})`;

    // Timeline spine drawing (kept even with reduced motion — it's not animation, it's progress)
    if (timelineBox && timelineProgress) {
      const rect = timelineBox.getBoundingClientRect();
      const ratio = clamp((vh * 0.65 - rect.top) / Math.max(1, rect.height), 0, 1);
      timelineProgress.style.height = `${(ratio * 100).toFixed(1)}%`;
      timelineNodes.forEach((node) => {
        node.classList.toggle('active-node', ratio >= parseFloat(node.dataset.threshold || '0.5'));
      });
    }

    if (!reduceMotion) {
      // Hero curtain — slow drift + subtle zoom
      if (heroBg && scrollY < vh * 1.2) {
        heroBg.style.transform = `translate3d(0, ${(scrollY * 0.25).toFixed(1)}px, 0) scale(${(1 + scrollY / vh * 0.06).toFixed(3)})`;
      }

      // Gentle photo zoom as frames approach the centre of the viewport
      zoomObjects.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;
        const range = parseFloat(el.dataset.scrollZoom || '0.1');
        const dist = (vh * 0.5 - (rect.top + rect.height * 0.5)) / vh;
        const eased = 1 - Math.pow(1 - clamp(1 - Math.abs(dist), 0, 1), 2);
        el.style.transform = `scale(${(1 - range + eased * range).toFixed(3)})`;
      });

      updatePortal(vh);
    }

    ticking = false;
  }

  function updatePortal(vh) {
    if (!portal.track || !portal.arch) return;
    const rect = portal.track.getBoundingClientRect();
    if (rect.bottom < -vh || rect.top > vh * 2) return;

    const progress = clamp(-rect.top / Math.max(1, rect.height - vh), 0, 1);
    const scale = 0.55 + progress * 0.45;
    const radius = Math.round(360 - progress * 354);

    portal.arch.style.transform = `scale(${scale.toFixed(3)})`;
    portal.arch.style.borderRadius = `${radius}px ${radius}px 6px 6px`;
    if (portal.inner) portal.inner.style.transform = `scale(${(1.22 - progress * 0.2).toFixed(3)})`;

    const sideOpacity = clamp(1 - progress * 1.6, 0, 1).toFixed(2);
    if (portal.left) {
      portal.left.style.transform = `translate3d(${(-progress * 160).toFixed(1)}px, 0, 0)`;
      portal.left.style.opacity = sideOpacity;
    }
    if (portal.right) {
      portal.right.style.transform = `translate3d(${(progress * 160).toFixed(1)}px, 0, 0)`;
      portal.right.style.opacity = sideOpacity;
    }

    const step = progress < 0.34 ? 1 : progress < 0.68 ? 2 : 3;
    if (step !== lastStep) {
      lastStep = step;
      portal.steps.forEach((el, i) => el && el.classList.toggle('is-active', i + 1 === step));
      portal.dots.forEach((el, i) => el && el.classList.toggle('is-active', i + 1 === step));
      if (portal.label) portal.label.textContent = `0${step} / 03`;
    }
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  // Active nav link
  const navLinks = document.querySelectorAll('.main-nav .nav-link');
  if ('IntersectionObserver' in window && navLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['story', 'venue', 'medellin', 'attire', 'gallery', 'rsvp'].forEach((id) => {
      const s = $(id);
      if (s) sectionObserver.observe(s);
    });
  }

  // --------------------------------------------------------------------------
  // 4. MOBILE MENU
  // --------------------------------------------------------------------------
  const menuBtn = $('mobileMenuBtn');
  const drawer = $('mobileMenuDrawer');
  const iconOpen = $('menuIconOpen');
  const iconClose = $('menuIconClose');

  function setMenu(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    if (menuBtn) menuBtn.setAttribute('aria-expanded', String(open));
    if (iconOpen) iconOpen.hidden = open;
    if (iconClose) iconClose.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => setMenu(!drawer.classList.contains('is-open')));
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  // --------------------------------------------------------------------------
  // 5. ENGLISH / ESPAÑOL
  // --------------------------------------------------------------------------
  const translations = {
    en: {
      nav_story: 'Our Story', nav_venue: 'The Day', nav_medellin: 'Medellín', nav_attire: 'Dress Code',
      nav_gallery: 'Photos', nav_rsvp: 'R.S.V.P.',
      hero_eyebrow: 'Together with their families',
      hero_subtitle: '“Two worlds, one love story — gathering our favorite people in the City of Eternal Spring.”',
      hero_date: 'Saturday · August 7 · 2027',
      countdown_label: 'Until “I do” · 4:00 PM COT',
      cd_days: 'Days', cd_hours: 'Hours', cd_mins: 'Minutes', cd_secs: 'Seconds',
      hero_cta_rsvp: 'Kindly R.S.V.P.', hero_cta_calendar: 'Save the Date',
      portal1_eyebrow: 'The Destination', portal1_title: 'Welcome to Medellín',
      portal1_text: 'Tucked high in the Andes, Medellín greets you with eternal-spring weather and true Colombian warmth.',
      portal2_eyebrow: 'Feria de las Flores', portal2_title: 'August in Full Bloom',
      portal2_text: 'Our wedding weekend falls during the Festival of the Flowers, when orchids and rose petals fill the mountain estates.',
      portal3_eyebrow: 'The Celebration', portal3_title: 'Saturday, August 7th',
      portal3_text: 'We gather at Hacienda & Jardín Botánico Santa Elena for candlelit vows, golden-hour cocktails, dinner and dancing.',
      story_eyebrow: 'Nuestra Historia', story_title: 'Our Love Story',
      story_intro: 'From an unexpected meeting over Colombian coffee to a life full of adventure, laughter and two vibrant cultures — here is how our journey unfolded.',
      bio_sofi_role: 'The Bride · La Novia', bio_nate_role: 'The Groom · El Novio',
      bio_sofi_text: 'Warm-hearted, endlessly curious, and proud of her Colombian roots. Whether she is curating playlists, planning the next trip, or bringing everyone together around the table, she fills every room with joy.',
      bio_nate_text: 'Thoughtful, adventurous, and always ready to make Ana Sofia laugh. He fell in love with Ana Sofia first — and shortly after with aguardiente, arepas de chócolo, and the mountain views of Medellín.',
      m1_title: 'How We First Met',
      m1_desc: 'What started as a simple conversation quickly turned into hours of talking as if we had known each other for years. By the end of the night, we both knew something extraordinary had begun.',
      m2_title: 'Falling in Love with Medellín',
      m2_desc: 'Introducing Nate to Medellín — the lush green mountains, the warmth of family, and sunsets over the Aburrá Valley — made it clear where we wanted to celebrate the biggest day of our lives.',
      m3_title: 'The Proposal',
      m3_desc: 'With a ring tucked safely away and hearts racing, Nate asked the question that changed everything. Through happy tears and the easiest “Yes!”, we began planning our forever in Colombia.',
      venue_eyebrow: 'When & Where', venue_title: 'The Venue',
      venue_subtitle: 'Join us amid cloud-forest gardens and colonial architecture in the hills above Medellín.',
      mde_eyebrow: 'La Ciudad de la Eterna Primavera', mde_title: 'Discover Medellín',
      mde_intro: 'Nestled in an Andean valley, Medellín enjoys spring-like weather all year — and our date coincides with the city’s beloved Feria de las Flores.',
      attire_eyebrow: 'Código de Vestimenta', attire_title: 'Dress Code',
      attire_intro: 'We invite you to dress in warm botanical, earth and candlelit tones inspired by the gardens of Medellín. Select a shade for styling ideas.',
      gallery_eyebrow: 'Galería', gallery_title: 'Captured Moments',
      rsvp_title: 'Kindly Reply',
      rsvp_deadline: 'Please respond by June 1st, 2027 so we can save your seat and shuttle.',
    },
    es: {
      nav_story: 'Nuestra Historia', nav_venue: 'El Día', nav_medellin: 'Medellín', nav_attire: 'Vestimenta',
      nav_gallery: 'Fotos', nav_rsvp: 'Confirmar',
      hero_eyebrow: 'Junto a sus familias',
      hero_subtitle: '“Dos mundos, una misma historia de amor — reuniendo a nuestras personas favoritas en la Ciudad de la Eterna Primavera.”',
      hero_date: 'Sábado · 7 de agosto · 2027',
      countdown_label: 'Para el “sí, acepto” · 4:00 PM COT',
      cd_days: 'Días', cd_hours: 'Horas', cd_mins: 'Minutos', cd_secs: 'Segundos',
      hero_cta_rsvp: 'Confirmar asistencia', hero_cta_calendar: 'Guardar la fecha',
      portal1_eyebrow: 'El Destino', portal1_title: 'Bienvenidos a Medellín',
      portal1_text: 'En lo alto de los Andes, Medellín te recibe con su eterna primavera y la calidez colombiana.',
      portal2_eyebrow: 'Feria de las Flores', portal2_title: 'Agosto en plena flor',
      portal2_text: 'Nuestro fin de semana coincide con la Feria de las Flores, cuando orquídeas y pétalos llenan las fincas de la montaña.',
      portal3_eyebrow: 'La Celebración', portal3_title: 'Sábado 7 de agosto',
      portal3_text: 'Nos reunimos en la Hacienda & Jardín Botánico Santa Elena para votos a la luz de las velas, cócteles al atardecer, cena y baile.',
      story_eyebrow: 'About Us', story_title: 'Nuestra Historia de Amor',
      story_intro: 'Desde un encuentro inesperado tomando café colombiano hasta una vida llena de aventuras, risas y dos culturas vibrantes — así comenzó nuestro camino.',
      bio_sofi_role: 'La Novia · The Bride', bio_nate_role: 'El Novio · The Groom',
      bio_sofi_text: 'Cálida, curiosa y orgullosa de sus raíces colombianas. Ya sea creando listas de música, planeando el próximo viaje o reuniendo a todos en la mesa, llena cada rincón de alegría.',
      bio_nate_text: 'Detallista, aventurero y siempre listo para hacer reír a Ana Sofia. Se enamoró primero de Ana Sofia — y muy pronto del aguardiente, las arepas de chócolo y las montañas de Medellín.',
      m1_title: 'Cómo Nos Conocimos',
      m1_desc: 'Lo que comenzó como una charla casual se convirtió en horas de conversación, como si nos conociéramos de toda la vida. Al terminar la noche, sabíamos que algo único había comenzado.',
      m2_title: 'Enamorándonos de Medellín',
      m2_desc: 'Mostrarle Medellín a Nate — sus montañas verdes, el cariño de la familia y los atardeceres sobre el Valle de Aburrá — hizo evidente dónde queríamos celebrar nuestra boda.',
      m3_title: 'La Propuesta',
      m3_desc: 'Con el anillo listo y el corazón a mil, Nate hizo la pregunta que lo cambió todo. Entre lágrimas de felicidad y el “¡Sí!” más fácil del mundo, empezamos a soñar con agosto de 2027.',
      venue_eyebrow: 'Dónde y Cuándo', venue_title: 'El Lugar',
      venue_subtitle: 'Acompáñanos entre jardines de bosque de niebla y arquitectura colonial en las montañas de Medellín.',
      mde_eyebrow: 'The City of Eternal Spring', mde_title: 'Descubre Medellín',
      mde_intro: 'En un valle andino, Medellín disfruta de clima primaveral todo el año — y nuestra fecha coincide con la querida Feria de las Flores.',
      attire_eyebrow: 'Dress Code', attire_title: 'Código de Vestimenta',
      attire_intro: 'Te invitamos a vestir en tonos botánicos, tierra y luz de vela inspirados en los jardines de Medellín. Elige un tono para ver ideas.',
      gallery_eyebrow: 'Gallery', gallery_title: 'Momentos',
      rsvp_title: 'Confirma tu Asistencia',
      rsvp_deadline: 'Por favor responde antes del 1 de junio de 2027 para reservar tu lugar y transporte.',
    },
  };

  let currentLang = 'en';
  const langBtn = $('langToggleBtn');
  const langLabel = $('langLabel');

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'es' : 'en';
      document.documentElement.lang = currentLang;
      if (langLabel) langLabel.textContent = currentLang === 'en' ? 'EN · ES' : 'ES · EN';
      const dict = translations[currentLang];
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const value = dict[el.getAttribute('data-i18n')];
        if (value) el.textContent = value;
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. SAVE THE DATE (.ics) & COPY ADDRESS
  // --------------------------------------------------------------------------
  function downloadBlob(content, type, filename) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const calBtn = $('addToCalendarBtn');
  if (calBtn) {
    calBtn.addEventListener('click', () => {
      const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Ana Sofia and Nate Wedding//Medellin 2027//EN',
        'BEGIN:VEVENT',
        'UID:anasofia-nate-wedding-20270807@medellin',
        `DTSTAMP:${stamp}`,
        'DTSTART:20270807T203000Z',
        'DTEND:20270808T060000Z',
        'SUMMARY:Wedding of Ana Sofia & Nate',
        'DESCRIPTION:Welcome drinks 3:30 PM · Ceremony 4:00 PM (COT). Dress code: Tropical Formal / Garden Black-Tie Optional.',
        'LOCATION:Hacienda & Jardín Botánico Santa Elena\\, Km 27 Vía Las Palmas – El Retiro\\, Medellín\\, Antioquia\\, Colombia',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');
      downloadBlob(ics, 'text/calendar;charset=utf-8', 'Ana-Sofia-and-Nate-Wedding-Aug-7-2027.ics');
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(() => {});
    }
    return Promise.resolve();
  }

  const copyAddressBtn = $('copyAddressBtn');
  const copyAddressLabel = $('copyAddressLabel');
  const venueAddressText = $('venueAddressText');
  if (copyAddressBtn && venueAddressText) {
    copyAddressBtn.addEventListener('click', () => {
      copyText(venueAddressText.textContent.trim());
      if (copyAddressLabel) {
        const original = copyAddressLabel.textContent;
        copyAddressLabel.textContent = 'Copied';
        setTimeout(() => { copyAddressLabel.textContent = original; }, 2000);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7. MEDELLÍN FILTERS
  // --------------------------------------------------------------------------
  const filterButtons = document.querySelectorAll('.mde-filter-btn');
  const mdeCards = document.querySelectorAll('.mde-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      filterButtons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('active-filter', on);
        b.setAttribute('aria-pressed', String(on));
      });
      mdeCards.forEach((card) => {
        const show = category === 'all' || card.dataset.category === category;
        card.classList.toggle('hidden', !show);
        if (show) card.classList.add('is-revealed');
      });
    });
  });

  // --------------------------------------------------------------------------
  // 8. DRESS-CODE SWATCHES
  // --------------------------------------------------------------------------
  const swatches = document.querySelectorAll('.color-swatch-btn');
  const sw = {
    preview: $('selectedSwatchPreview'), role: $('selectedSwatchRole'), name: $('selectedSwatchName'),
    hex: $('selectedSwatchHex'), her: $('selectedSwatchHer'), him: $('selectedSwatchHim'),
  };

  swatches.forEach((swatch) => {
    swatch.setAttribute('aria-label', swatch.dataset.name);
    swatch.addEventListener('click', () => {
      swatches.forEach((s) => s.classList.remove('active'));
      swatch.classList.add('active');
      const d = swatch.dataset;
      if (sw.preview) sw.preview.style.backgroundColor = d.hex;
      if (sw.role) sw.role.textContent = d.role;
      if (sw.name) sw.name.textContent = d.name;
      if (sw.hex) sw.hex.textContent = d.hex;
      if (sw.her) sw.her.textContent = d.her;
      if (sw.him) sw.him.textContent = d.him;
    });
  });

  const copyHexBtn = $('copyHexBtn');
  if (copyHexBtn && sw.hex) {
    copyHexBtn.addEventListener('click', () => {
      const hex = sw.hex.textContent.trim();
      if (!hex.startsWith('#') || hex.includes(' ')) return;
      copyText(hex);
      sw.hex.textContent = `${hex} · copied`;
      setTimeout(() => { sw.hex.textContent = hex; }, 1400);
    });
  }

  // --------------------------------------------------------------------------
  // 9. PHOTO FRAMES — click / keyboard upload, batch upload, preview art
  // --------------------------------------------------------------------------
  const singleInput = $('photoUploadInput');
  const multiInput = $('multiPhotoUploadInput');
  const placeholders = document.querySelectorAll('.photo-placeholder');
  let activePlaceholder = null;

  function applyImage(el, src) {
    let img = el.querySelector('img.uploaded-preview');
    if (!img) {
      img = document.createElement('img');
      img.className = 'uploaded-preview';
      img.alt = el.dataset.title || 'Wedding photo';
      el.appendChild(img);
    }
    img.src = src;
    el.classList.add('has-image');
    const badge = el.querySelector('.placeholder-overlay-badge');
    if (badge) badge.textContent = 'Change photo';
  }

  function readFileInto(file, el) {
    if (!file || !el) return;
    const reader = new FileReader();
    reader.onload = (evt) => evt.target && evt.target.result && applyImage(el, evt.target.result);
    reader.readAsDataURL(file);
  }

  function openPicker(el) {
    activePlaceholder = el;
    if (singleInput) {
      singleInput.value = '';
      singleInput.click();
    }
  }

  placeholders.forEach((el) => {
    el.addEventListener('click', () => openPicker(el));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPicker(el);
      }
    });
  });

  if (singleInput) {
    singleInput.addEventListener('change', (e) => readFileInto(e.target.files && e.target.files[0], activePlaceholder));
  }

  const batchBtn = $('batchUploadPhotosBtn');
  if (batchBtn && multiInput) {
    batchBtn.addEventListener('click', () => {
      multiInput.value = '';
      multiInput.click();
    });
    multiInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      const slots = Array.from(placeholders);
      files.forEach((file, i) => readFileInto(file, slots[i % slots.length]));
    });
  }

  function sampleArt(title, accent, bg) {
    const safe = String(title).replace(/[<>&"]/g, '');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="800" height="900">
      <defs><radialGradient id="g" cx="50%" cy="55%" r="60%"><stop offset="0" stop-color="#F4E3D3"/><stop offset="1" stop-color="${bg}"/></radialGradient></defs>
      <rect width="800" height="900" fill="url(#g)"/>
      <path d="M400 250c40 50 55 85 55 112a55 55 0 0 1-110 0c0-27 15-62 55-112z" fill="${accent}" fill-opacity="0.55"/>
      <rect x="350" y="440" width="100" height="200" rx="10" fill="none" stroke="${accent}" stroke-width="3"/>
      <text x="400" y="740" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="40" fill="#3A2E26">${safe}</text>
      <text x="400" y="786" text-anchor="middle" font-family="sans-serif" font-size="16" letter-spacing="6" fill="#8E6240">MEDELLÍN · 08 · 07 · 2027</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  const sampleBtn = $('loadSampleArtBtn');
  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      const tones = [['#D29A5E', '#F5EEE4'], ['#B8735A', '#FBF8F3'], ['#8C9478', '#F5EEE4'], ['#C99A8C', '#FBF8F3']];
      placeholders.forEach((el, i) => {
        const [accent, bg] = tones[i % tones.length];
        const caption = el.querySelector('.photo-caption span');
        applyImage(el, sampleArt(caption ? caption.textContent : 'Ana Sofia & Nate', accent, bg));
      });
    });
  }

  const resetBtn = $('resetPlaceholdersBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      placeholders.forEach((el) => {
        const img = el.querySelector('img.uploaded-preview');
        if (img) img.remove();
        el.classList.remove('has-image');
        const badge = el.querySelector('.placeholder-overlay-badge');
        if (badge) badge.textContent = 'Add photo';
      });
    });
  }

  // --------------------------------------------------------------------------
  // 10. RSVP — sent to Google Forms, with a backup copy in this browser
  // --------------------------------------------------------------------------

  // Paste your Google Form's PRE-FILLED link here (see README → "RSVP → Google Forms").
  // When making that link, answer each question with its keyword:
  //   NAME, EMAIL, ATTENDING, PARTY, ENTREE, SHUTTLE, EVENTS, DIETARY, SONG, MESSAGE
  // Leave it empty and RSVPs are only kept in the guest's own browser.
  const GOOGLE_FORM_PREFILLED_LINK = '';

  const GOOGLE_FORM_KEYWORDS = {
    NAME: 'guestName', EMAIL: 'guestEmail', ATTENDING: 'attendance', PARTY: 'guestCount',
    ENTREE: 'mealPreference', SHUTTLE: 'shuttleNeeded', EVENTS: 'events',
    DIETARY: 'dietaryNotes', SONG: 'songRequest', MESSAGE: 'personalNote',
  };

  function parseGoogleForm(link) {
    if (!link) return null;
    try {
      const url = new URL(link);
      const match = url.pathname.match(/\/forms\/d\/e\/([^/]+)\//);
      if (!match) throw new Error('not a Google Forms link');
      const fields = {};
      url.searchParams.forEach((value, key) => {
        const field = GOOGLE_FORM_KEYWORDS[value.trim().toUpperCase()];
        if (key.startsWith('entry.') && field) fields[field] = key;
      });
      if (!Object.keys(fields).length) throw new Error('no keyword answers found in the link');
      return { action: `https://docs.google.com/forms/d/e/${match[1]}/formResponse`, fields };
    } catch (err) {
      console.warn('RSVP: Google Form link not usable —', err.message);
      return null;
    }
  }

  const googleForm = parseGoogleForm(GOOGLE_FORM_PREFILLED_LINK);

  function sendToGoogleForm(entry) {
    if (!googleForm) return Promise.resolve(false);
    const body = new URLSearchParams();
    Object.entries(googleForm.fields).forEach(([field, entryId]) => {
      let value = entry[field] || '';
      if (field === 'attendance') value = value === 'accepts' ? 'Joyfully accepts' : 'Regretfully declines';
      body.append(entryId, value);
    });
    // Google Forms does not send CORS headers, so the reply is opaque: a resolved
    // fetch means the request reached Google; a rejected one means it did not.
    return fetch(googleForm.action, { method: 'POST', mode: 'no-cors', body }).then(() => true);
  }

  const STORAGE_KEY = 'anasofia_nate_wedding_rsvps_v1';
  const form = $('rsvpForm');
  const detailsBox = $('attendingDetailsBox');
  const successBox = $('rsvpSuccessBanner');
  const successHeading = $('rsvpConfirmationHeading');
  const successSummary = $('rsvpConfirmationSummary');
  const countBadge = $('rsvpCountBadge');
  const listToggle = $('toggleRsvpListBtn');
  const exportBtn = $('exportRsvpCsvBtn');
  const listDrawer = $('rsvpListDrawer');

  const escapeHtml = (str) => String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function getSaved() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function save(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) { /* storage unavailable */ }
    renderList();
  }

  function renderList() {
    const list = getSaved();
    if (countBadge) countBadge.textContent = String(list.length);
    if (!listDrawer) return;
    if (!list.length) {
      listDrawer.innerHTML = '<p class="rsvp-row">No responses yet.</p>';
      return;
    }
    listDrawer.innerHTML = list.map((r) => {
      const yes = r.attendance === 'accepts';
      return `<div class="rsvp-row">
          <div>
            <b>${escapeHtml(r.guestName)}</b>
            <span class="meta">${escapeHtml(r.guestEmail)}${yes ? ` · ${escapeHtml(r.mealPreference)} · Shuttle: ${escapeHtml(r.shuttleNeeded)}` : ''}</span>
          </div>
          <div>
            <span class="${yes ? 'status-yes' : 'status-no'}">${yes ? `Attending · ${escapeHtml(r.guestCount)}` : 'Declined'}</span>
            <span class="meta">${escapeHtml(r.submittedAt)}</span>
          </div>
        </div>`;
    }).join('');
  }

  document.querySelectorAll('input[name="attendance"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      if (detailsBox) detailsBox.classList.toggle('hidden', e.target.value === 'declines');
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const fd = new FormData(form);
      const get = (k, fallback = '') => (fd.get(k) || fallback).toString().trim();
      const attendance = get('attendance', 'accepts');
      const yes = attendance === 'accepts';

      const entry = {
        guestName: get('guestName'),
        guestEmail: get('guestEmail'),
        attendance,
        guestCount: yes ? get('guestCount', '1') : '0',
        mealPreference: yes ? get('mealPreference') : 'N/A',
        shuttleNeeded: yes ? get('shuttleNeeded') : 'N/A',
        events: yes ? fd.getAll('events').join('; ') : 'None',
        dietaryNotes: get('dietaryNotes'),
        songRequest: get('songRequest'),
        personalNote: get('personalNote'),
        submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      const submitLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      sendToGoogleForm(entry)
        .then(() => {
          const list = getSaved();
          list.unshift(entry);
          save(list);
          showConfirmation(entry, yes);
          form.reset();
          if (detailsBox) detailsBox.classList.remove('hidden');
        })
        .catch(() => {
          showMessage(
            'We couldn’t send your reply',
            'Please check your internet connection and press Send again. Your answers are still in the form.',
            'One moment'
          );
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitLabel;
          }
        });
    });
  }

  const successEyebrow = $('rsvpConfirmationEyebrow');

  function showMessage(heading, summary, eyebrow = '¡Muchas gracias!') {
    if (!successBox || !successHeading || !successSummary) return;
    successBox.classList.remove('hidden');
    if (successEyebrow) successEyebrow.textContent = eyebrow;
    successHeading.textContent = heading;
    successSummary.textContent = summary;
    successBox.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }

  function showConfirmation(entry, yes) {
    if (yes) {
      showMessage(
        `¡Nos vemos en Medellín, ${entry.guestName}!`,
        `Confirmed for ${entry.guestCount} guest(s) · ${entry.mealPreference} · Shuttle: ${entry.shuttleNeeded}.`
      );
    } else {
      showMessage(
        `Thank you, ${entry.guestName}.`,
        'We will miss you in Medellín and are grateful for your warm wishes.'
      );
    }
  }

  if (listToggle && listDrawer) {
    listToggle.addEventListener('click', () => {
      const hidden = listDrawer.classList.toggle('hidden');
      listToggle.textContent = hidden ? 'View' : 'Hide';
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const list = getSaved();
      if (!list.length) {
        alert('No RSVPs saved yet.');
        return;
      }
      const headers = ['Name', 'Email', 'Attendance', 'Party Size', 'Entree', 'Shuttle', 'Events', 'Dietary', 'Song Request', 'Message', 'Submitted Date'];
      const keys = ['guestName', 'guestEmail', 'attendance', 'guestCount', 'mealPreference', 'shuttleNeeded', 'events', 'dietaryNotes', 'songRequest', 'personalNote', 'submittedAt'];
      const rows = list.map((r) => keys.map((k) => `"${String(r[k] || '').replace(/"/g, '""')}"`).join(','));
      downloadBlob([headers.join(','), ...rows].join('\n'), 'text/csv;charset=utf-8;', 'Ana-Sofia-Nate-Wedding-RSVPs.csv');
    });
  }

  renderList();
})();
