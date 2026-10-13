/* يوسف الشمراني · صفحة الهبوط · السلوك الخاص بالصفحة (المحرك لا يُعدَّل). */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var mobile = window.matchMedia('(max-width: 860px)');

  // الوضع الليلي/النهاري (قبل المحرك حتى لا تومض الألوان)
  (function theme() {
    var KEY = 'yl.theme', root = document.documentElement, meta = document.querySelector('meta[name="theme-color"]');
    var saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
    function apply(t) {
      if (t === 'light') root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme');
      if (meta) meta.setAttribute('content', t === 'light' ? '#F4F1EA' : '#0B0B0D');
      var b = document.querySelector('[data-theme-toggle]'); if (b) b.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
    }
    apply(saved === 'light' ? 'light' : 'dark');
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(next); try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  })();

  // المحرك
  var sc = window.ScrollCraft.mount(document.body);

  /* ------------------------------------------------------------------ */
  /* الخط الزمني: السكرول رأس التشغيل، وكل قسم تعدّيه ينطبع عليه علامة  */
  /* ------------------------------------------------------------------ */
  (function timeline() {
    var tl = document.querySelector('.tl'); if (!tl) return;
    var track = tl.querySelector('.tl__track');
    var fill = tl.querySelector('.tl__fill');
    var head = tl.querySelector('.tl__head');
    var tc = tl.querySelector('.tl__tc');
    var secs = Array.prototype.slice.call(document.querySelectorAll('[data-tl]'));
    var marks = [], docH = 1, maxY = 1;

    function measure() {
      docH = document.documentElement.scrollHeight;
      maxY = Math.max(docH - window.innerHeight, 1);
      marks.forEach(function (m) {
        var top = m.sec.getBoundingClientRect().top + window.scrollY;
        m.y = Math.min(top, maxY);
        m.pos = m.y / maxY;
        m.el.style.insetInlineStart = (m.pos * 100).toFixed(3) + '%';
      });
    }
    secs.forEach(function (sec) {
      var b = document.createElement('button');
      b.className = 'tl__m'; b.type = 'button';
      b.setAttribute('aria-label', 'انتقل إلى ' + sec.getAttribute('data-tl'));
      b.innerHTML = '<i></i><b>' + sec.getAttribute('data-tl') + '</b>';
      b.addEventListener('click', function () {
        var id = sec.id || sec.getAttribute('data-tl');
        window.scrollTo({ top: Math.min(sec.getBoundingClientRect().top + window.scrollY, maxY), behavior: reduced ? 'auto' : 'smooth' });
        if (history.replaceState && sec.id) history.replaceState(null, '', '#' + sec.id);
      });
      track.appendChild(b);
      marks.push({ sec: sec, el: b, y: 0, pos: 0 });
    });
    var total = 90; // ثوانٍ وهمية لعدّاد التايم كود: 00:00:00 → 00:01:30
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function paint() {
      var y = window.scrollY, p = Math.min(Math.max(y / maxY, 0), 1);
      fill.style.width = (p * 100).toFixed(3) + '%';
      head.style.insetInlineStart = (p * 100).toFixed(3) + '%';
      var s = Math.round(p * total), fr = Math.round((p * total - Math.floor(p * total)) * 30);
      tc.textContent = '00:' + pad(Math.floor(s / 60)) + ':' + pad(s % 60) + (mobile.matches ? '' : ':' + pad(fr % 30));
      var here = null;
      marks.forEach(function (m) {
        var passed = y + window.innerHeight * 0.45 >= m.y;
        m.el.classList.toggle('is-stamped', passed);
        if (passed) here = m;
      });
      marks.forEach(function (m) { m.el.classList.toggle('is-here', m === here); });
    }
    var raf = 0;
    window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; paint(); }); }, { passive: true });
    window.addEventListener('resize', function () { measure(); paint(); });
    window.addEventListener('load', function () { measure(); paint(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); paint(); });
    measure(); paint();
    // الصفحة تتغير طولها (الكتيّب، الصور) فنقيس كل ثانية بهدوء
    setInterval(function () { var h = document.documentElement.scrollHeight; if (h !== docH) { measure(); paint(); } }, 1000);
  })();

  /* ------------------------------------------------------------------ */
  /* قبل / بعد: فاصل يُسحب بالإصبع أو الماوس، وتبويبات للأزواج الثلاثة    */
  /* ------------------------------------------------------------------ */
  (function beforeAfter() {
    var ba = document.querySelector('[data-ba]'); if (!ba) return;
    var range = ba.querySelector('.ba__range');
    var pairs = ba.querySelectorAll('.ba__pair');
    var tabs = document.querySelectorAll('.proof__tabs .tab');
    var x = 50, dragging = false;
    function set(v, animate) {
      x = Math.min(Math.max(v, 2), 98);
      if (animate) { ba.style.transition = '--x 420ms'; }
      ba.style.setProperty('--x', x.toFixed(2));
      range.value = Math.round(x);
    }
    function fromEvent(e) {
      var r = ba.getBoundingClientRect();
      var cx = (e.touches ? e.touches[0].clientX : e.clientX);
      set(((cx - r.left) / r.width) * 100);
    }
    ba.addEventListener('pointerdown', function (e) { if (e.button !== 0 && e.pointerType === 'mouse') return; dragging = true; ba.setPointerCapture(e.pointerId); fromEvent(e); });
    ba.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    ba.addEventListener('pointerup', function () { dragging = false; });
    ba.addEventListener('pointercancel', function () { dragging = false; });
    range.addEventListener('input', function () { set(parseFloat(range.value)); });
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (o) { o.classList.remove('is-on'); o.setAttribute('aria-selected', 'false'); });
        t.classList.add('is-on'); t.setAttribute('aria-selected', 'true');
        var i = parseInt(t.getAttribute('data-pair'), 10);
        pairs.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
        set(50);
      });
    });
    // أول دخول: الفاصل يتحرك لوحده مرة واحدة من 50 إلى 72 ثم يرجع، عشان يفهم الزائر إنه يُسحب
    if (!reduced && 'IntersectionObserver' in window) {
      var once = false;
      new IntersectionObserver(function (en) {
        if (once || !en[0].isIntersecting) return; once = true;
        var t0 = null;
        function step(ts) {
          if (!t0) t0 = ts; var k = Math.min((ts - t0) / 1600, 1);
          var e = 0.5 - 0.5 * Math.cos(k * Math.PI * 2);
          if (!dragging) set(50 + 24 * e);
          if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }, { threshold: 0.6 }).observe(ba);
    }
  })();

  /* ------------------------------------------------------------------ */
  /* معاينات الفيديو: تشتغل صامتة لما تكون ظاهرة، وبالضغط تفتح بصوتها     */
  /* ------------------------------------------------------------------ */
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-video]'));
  (function previews() {
    if (reduced) return;
    var saveData = navigator.connection && navigator.connection.saveData;
    if (saveData) return;
    function arm(card) {
      var v = card.querySelector('video'); if (!v || v.getAttribute('src')) return;
      v.src = v.getAttribute('data-prev'); v.load();
      v.addEventListener('playing', function () { card.classList.add('is-live'); }, { once: true });
    }
    function play(card) { var v = card.querySelector('video'); if (!v) return; arm(card); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    function stop(card) { var v = card.querySelector('video'); if (!v) return; v.pause(); card.classList.remove('is-live'); }
    if (finePointer) {
      cards.forEach(function (c) {
        c.addEventListener('pointerenter', function () { play(c); });
        c.addEventListener('pointerleave', function () { stop(c); });
      });
      // على الكمبيوتر: الريلز في فسيفساء الدرون تشتغل لحالها لما تظهر (بدون انتظار الماوس)
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var c = en.target;
          var auto = !finePointer || c.classList.contains('reel');
          if (!auto) return;
          if (en.isIntersecting && en.intersectionRatio >= 0.35) play(c); else stop(c);
        });
      }, { threshold: [0, 0.35] });
      cards.forEach(function (c) { io.observe(c); });
    }
  })();

  /* ------------------------------------------------------------------ */
  /* المشغّل الكامل                                                      */
  /* ------------------------------------------------------------------ */
  (function lightbox() {
    var lb = document.querySelector('[data-lb]'); if (!lb || !lb.showModal) return;
    var video = lb.querySelector('.lb__video');
    var title = lb.querySelector('[data-lb-title]');
    var meta = lb.querySelector('[data-lb-meta]');
    var cur = -1;
    function open(i) {
      cur = (i + cards.length) % cards.length;
      var c = cards[cur];
      video.pause();
      video.src = 'assets/video/' + c.getAttribute('data-video') + '.mp4';
      video.poster = c.querySelector('img').getAttribute('src');
      title.textContent = c.getAttribute('data-title') || '';
      meta.textContent = c.getAttribute('data-meta') || '';
      if (!lb.open) lb.showModal();
      var p = video.play(); if (p && p.catch) p.catch(function () {});
    }
    function close() { video.pause(); video.removeAttribute('src'); video.load(); if (lb.open) lb.close(); }
    cards.forEach(function (c, i) { c.addEventListener('click', function () { open(i); }); });
    lb.querySelector('.lb__close').addEventListener('click', close);
    lb.querySelector('.lb__nav--prev').addEventListener('click', function () { open(cur - 1); });
    lb.querySelector('.lb__nav--next').addEventListener('click', function () { open(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    lb.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.open) return;
      if (e.key === 'ArrowLeft') open(cur + 1);
      if (e.key === 'ArrowRight') open(cur - 1);
    });
    // سحب يمين/يسار على الجوال
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) < 60) return;
      open(dx < 0 ? cur + 1 : cur - 1);
    }, { passive: true });
  })();

  /* ------------------------------------------------------------------ */
  /* المساعد الذكي: نافذة دردشة تتكلم مع الـWorker (SSE)، ولها وضع تجريبي   */
  /* ------------------------------------------------------------------ */
  (function chat() {
    var root = document.querySelector('[data-chat]'); if (!root) return;
    var endpoint = (window.YL_CHAT && window.YL_CHAT.endpoint) || root.getAttribute('data-chat-endpoint') || '';
    var fab = root.querySelector('[data-chat-open]'), panel = root.querySelector('#chat-panel'), closeBtn = root.querySelector('[data-chat-close]');
    var log = root.querySelector('[data-chat-log]'), form = root.querySelector('[data-chat-form]'), input = form.querySelector('input'), send = form.querySelector('button');
    var chips = root.querySelector('[data-chat-chips]'), wa = root.querySelector('[data-chat-wa]');
    var history = [], busy = false;
    try { var saved = sessionStorage.getItem('yl.chat'); if (saved) { history = JSON.parse(saved); history.forEach(function (m) { add(m.role === 'user' ? 'me' : 'bot', m.content); }); } } catch (e) {}

    function add(kind, text) {
      var d = document.createElement('div'); d.className = 'chat__msg chat__msg--' + kind; d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
    }
    function persist() { try { sessionStorage.setItem('yl.chat', JSON.stringify(history.slice(-24))); } catch (e) {} }
    function updateWa() {
      var last = history.filter(function (m) { return m.role === 'user'; }).slice(-3).map(function (m) { return m.content; }).join(' / ');
      var msg = 'السلام عليكم يوسف، جاي من موقعك.' + (last ? ' سؤالي: ' + last.slice(0, 300) : '');
      wa.href = 'https://wa.me/966557774992?text=' + encodeURIComponent(msg);
    }
    function open() { panel.hidden = false; root.classList.add('is-open'); fab.setAttribute('aria-expanded', 'true'); setTimeout(function () { input.focus({ preventScroll: true }); }, 60); }
    function close() { panel.hidden = true; root.classList.remove('is-open'); fab.setAttribute('aria-expanded', 'false'); fab.focus({ preventScroll: true }); }
    fab.addEventListener('click', open); closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });

    // وضع تجريبي بدون خادم: إجابات ثابتة من المعرفة الأساسية حتى يُربط الـWorker
    var DEMO = [
      [/درون|499|تصوير/, 'تصوير الدرون داخل جدة بـ 499 ريالاً للجلسة: لقطات خام 4K عمودية وأفقية بدون مونتاج. المونتاج والريلز تُسعّر على حدة. أرسل موقع الأرض على واتساب ويوسف يرد عليك بالموعد.'],
      [/فيديو|ما انبن|خارطة|رندر|ذكاء/, 'الفيديو العقاري يُبنى من صورة الأرض الحقيقية أو رندر المهندس: الموقع والمسافات، ثم المبنى على أرضه، ثم الداخل. عمودي لتيك توك وإنستقرام وأفقي للمعرض. أرسل الرندر أو صورة الأرض على واتساب ويوسف يرد بتصوّر وسعر.'],
      [/كتيب|كتيّب|بروشور|مخطط/, 'كتيّب المبيعات 16 صفحة تقريباً: أرقام الوثائق الرسمية، مخططات بأسلوب واحد، ورقم ترخيص الهيئة في مكانه. نسخة للطباعة ونسخة خفيفة للواتساب.'],
      [/نبدأ|تحتاج|أبدأ|كيف/, 'للبداية: صورة الأرض من الجوال أو الدرون، أو رندر المهندس، وموقع المشروع ومرحلته. ترسلها على واتساب 0557774992 ويوسف يرد عليك بتصوّر واضح: وش يبان، وكم ياخذ وقت، وكم يكلّف.'],
      [/سعر|كم|تكلفة|بكم/, 'الدرون داخل جدة 499 ريالاً بدون مونتاج. باقي الخدمات تُسعّر حسب حجم المشروع، ويوسف يرد عليك بالسعر على واتساب بعد ما يشوف الرندر أو صورة الأرض.'],
    ];
    function demoReply(q) { for (var i = 0; i < DEMO.length; i++) if (DEMO[i][0].test(q)) return DEMO[i][1]; return 'ما عندي جواب جاهز لهذا السؤال، ويوسف يرد عليك بنفسه على واتساب 0557774992. أرسل له صورة الأرض أو الرندر وهو يكمل معك.'; }

    function ask(q) {
      if (busy || !q.trim()) return;
      busy = true; send.disabled = true;
      history.push({ role: 'user', content: q }); add('me', q); persist(); updateWa();
      var bot = add('bot', ''); bot.classList.add('is-typing');
      var acc = '';
      function finish(text) { bot.classList.remove('is-typing'); bot.textContent = text; history.push({ role: 'assistant', content: text }); persist(); busy = false; send.disabled = false; log.scrollTop = log.scrollHeight; }
      if (!endpoint) { setTimeout(function () { finish(demoReply(q)); }, 650); return; }
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-24) }) })
        .then(function (r) {
          if (!r.ok || !r.body) throw new Error('http ' + r.status);
          var reader = r.body.getReader(), dec = new TextDecoder(), buf = '';
          function pump() {
            return reader.read().then(function (res) {
              if (res.done) { finish(acc || '…'); return; }
              buf += dec.decode(res.value, { stream: true });
              var parts = buf.split('\n\n'); buf = parts.pop() || '';
              parts.forEach(function (p) {
                var line = p.split('\n').filter(function (l) { return l.indexOf('data:') === 0; })[0]; if (!line) return;
                try { var ev = JSON.parse(line.slice(5)); if (ev.t) { acc += ev.t; bot.textContent = acc; log.scrollTop = log.scrollHeight; } } catch (e) {}
              });
              return pump();
            });
          }
          return pump();
        })
        .catch(function () { bot.classList.remove('is-typing'); bot.className = 'chat__msg chat__msg--err'; bot.textContent = 'تعذّر الاتصال الآن. كمّل مع يوسف على واتساب من الزر تحت.'; busy = false; send.disabled = false; });
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); var q = input.value; input.value = ''; ask(q); });
    chips.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) ask(b.textContent); });
    updateWa();
  })();

  /* ------------------------------------------------------------------ */
  /* الكتيّب: كتاب عربي، الكعب على اليمين، والورقة تُقلب من اليسار لليمين  */
  /* ------------------------------------------------------------------ */
  (function flipbook() {
    var root = document.querySelector('[data-flip]'); if (!root) return;
    var stage = root.querySelector('[data-book-stage]');
    var prevBtn = root.querySelector('.flip__nav--prev');
    var nextBtn = root.querySelector('.flip__nav--next');
    var countEl = root.querySelector('[data-flip-count]');
    var totalEl = root.querySelector('[data-flip-total]');
    var picks = document.querySelectorAll('.book__pick .tab');
    var BOOKS = {
      jd: { dir: 'assets/book/jd/', n: 16, w: 1400, h: 974 },
      jl: { dir: 'assets/book/jl/', n: 16, w: 1400, h: 974 },
      es: { dir: 'assets/book/es/', n: 20, w: 798, h: 1418 }
    };
    var book = null, leaves = [], flipped = 0, single = false, pw = 0, ph = 0;

    function pad2(n) { return (n < 10 ? '0' : '') + n; }
    function src(b, p) { return p >= 1 && p <= b.n ? b.dir + pad2(p) + '.webp' : ''; }
    function face(cls, url, alt) {
      var f = document.createElement('div');
      f.className = 'face ' + cls + (url ? '' : ' face--blank');
      if (url) { var im = document.createElement('img'); im.src = url; im.alt = alt || ''; im.loading = 'lazy'; im.decoding = 'async'; f.appendChild(im); }
      return f;
    }
    function layout() {
      // نقيس عرض المسرح والكتاب مصغّر، وإلا يتمدد عمود الشبكة على مقاس الكتاب القديم
      stage.style.setProperty('--pw', '10px');
      var stageW = root.querySelector('.flip__stage').clientWidth;
      single = window.innerWidth <= 860 || stageW < 720;
      var ratio = book.w / book.h;
      var maxH = Math.min(window.innerHeight * 0.68, 620);
      if (single) { pw = Math.min(stageW, maxH * ratio); }
      else { pw = Math.min(stageW / 2, maxH * ratio); }
      ph = pw / ratio;
      stage.style.setProperty('--pw', pw.toFixed(1) + 'px');
      stage.style.setProperty('--ph', ph.toFixed(1) + 'px');
      stage.classList.toggle('is-single', single);
    }
    function build(key) {
      book = BOOKS[key]; flipped = 0; leaves = [];
      stage.innerHTML = '';
      layout();
      var spine = document.createElement('div'); spine.className = 'flip__spine'; stage.appendChild(spine);
      var count = single ? book.n : Math.ceil(book.n / 2);
      for (var i = 0; i < count; i++) {
        var leaf = document.createElement('div'); leaf.className = 'leaf';
        var front = single ? i + 1 : 2 * i + 1;
        var back = single ? 0 : 2 * i + 2;
        leaf.appendChild(face('face--front', src(book, front), 'صفحة ' + front));
        leaf.appendChild(face('face--back', src(book, back), back ? 'صفحة ' + back : ''));
        stage.appendChild(leaf); leaves.push(leaf);
      }
      totalEl.textContent = book.n;
      paint();
    }
    function paint() {
      leaves.forEach(function (l, i) {
        var isF = i < flipped;
        l.classList.toggle('is-flipped', isF);
        // المقلوب الأحدث فوق كومة اليمين، وغير المقلوب الأول فوق كومة اليسار
        l.style.zIndex = isF ? (i + 1) : (leaves.length - i + leaves.length);
      });
      var page = single ? Math.min(flipped + 1, book.n) : Math.min(flipped * 2 + 1, book.n);
      if (!single && flipped > 0) page = Math.min(flipped * 2, book.n);
      // الغلاف لوحده في البداية والصفحة الأخيرة لوحدها في النهاية: نزيح الكتاب عشان تتوسط الصفحة المفردة
      if (!single) {
        var shift = flipped === 0 ? pw / 2 : (flipped >= leaves.length ? -pw / 2 : 0);
        stage.style.transform = 'translateX(' + shift.toFixed(1) + 'px)';
      } else stage.style.transform = '';
      countEl.textContent = page;
      prevBtn.disabled = flipped === 0;
      nextBtn.disabled = flipped >= leaves.length - (single ? 1 : 0);
    }
    function next() { if (flipped < leaves.length - (single ? 1 : 0)) { flipped++; paint(); } }
    function prev() { if (flipped > 0) { flipped--; paint(); } }
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);
    root.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') next(); if (e.key === 'ArrowRight') prev(); });
    root.setAttribute('tabindex', '0');

    // السحب: تسحب الورقة اليسرى لليمين تتقلب، أو اليمنى لليسار ترجع
    var drag = null;
    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      var r = stage.getBoundingClientRect();
      var onLeft = single ? true : (e.clientX < r.left + pw);
      var leaf = onLeft ? leaves[flipped] : leaves[flipped - 1];
      if (!leaf) return;
      if (single && !onLeft) return;
      drag = { x0: e.clientX, leaf: leaf, fwd: onLeft, moved: false, w: pw };
      stage.setPointerCapture(e.pointerId);
      stage.classList.add('is-drag');
      leaf.style.zIndex = leaves.length * 3;
      e.preventDefault();
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x0;
      if (Math.abs(dx) > 4) drag.moved = true;
      var k = drag.fwd ? Math.min(Math.max(dx / drag.w, 0), 1) : Math.min(Math.max(-dx / drag.w, 0), 1);
      var deg = drag.fwd ? k * 180 : 180 - k * 180;
      drag.k = k;
      drag.leaf.style.transform = 'rotateY(' + deg.toFixed(2) + 'deg)';
    });
    function endDrag(e) {
      if (!drag) return;
      stage.classList.remove('is-drag');
      var d = drag; drag = null;
      d.leaf.style.transform = '';
      if (!d.moved) { // ضغطة: يسار = التالي، يمين = السابق
        var r = stage.getBoundingClientRect();
        if (single || e.clientX < r.left + pw) next(); else prev();
        return;
      }
      if ((d.k || 0) > 0.35) { if (d.fwd) next(); else prev(); } else paint();
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('dragstart', function (e) { e.preventDefault(); });

    picks.forEach(function (t) {
      t.addEventListener('click', function () {
        picks.forEach(function (o) { o.classList.remove('is-on'); o.setAttribute('aria-selected', 'false'); });
        t.classList.add('is-on'); t.setAttribute('aria-selected', 'true');
        build(t.getAttribute('data-book'));
      });
    });
    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { var was = single; layout(); if (was !== single) build(document.querySelector('.book__pick .tab.is-on').getAttribute('data-book')); }, 120); });
    build('jl');
  })();
})();
