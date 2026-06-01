/* ============================================
   Whit's Birthday Gate — main.js
   ============================================ */

/* ── Falling petals ────────────────────────── */
(function spawnPetals() {
  const container = document.getElementById('petals');
  if (!container) return;

  for (let i = 0; i < 20; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.style.left             = Math.random() * 100 + 'vw';
    petal.style.animationDuration = (9 + Math.random() * 10) + 's';
    petal.style.animationDelay   = (Math.random() * 18) + 's';
    petal.style.opacity           = String(0.25 + Math.random() * 0.55);
    petal.style.transform         = `scale(${0.5 + Math.random()})`;
    container.appendChild(petal);
  }
})();


/* ── Countdown timer ───────────────────────── */
(function initCountdown() {
  // ⚙️  Change this date to match the real event
  const TARGET = new Date('2026-06-07T10:00:00');

  const els = {
    days:    document.getElementById('days'),
    hours:   document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
  };

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = TARGET - Date.now();

    if (diff <= 0) {
      Object.values(els).forEach(el => { if (el) el.textContent = '00'; });
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    if (els.days)    els.days.textContent    = pad(d);
    if (els.hours)   els.hours.textContent   = pad(h);
    if (els.minutes) els.minutes.textContent = pad(m);
    if (els.seconds) els.seconds.textContent = pad(s);
  }

  tick();
  setInterval(tick, 1000);
})();


/* ── Form validation & success state ──────── */
function submitForm() {
  let valid = true;

  /* Full name */
  const name   = document.getElementById('fullname').value.trim();
  const nameHint = document.getElementById('nameHint');
  if (!name) {
    nameHint.classList.add('visible');
    valid = false;
  } else {
    nameHint.classList.remove('visible');
  }

  /* Email */
  const email    = document.getElementById('email').value.trim();
  const emailHint = document.getElementById('emailHint');
  const emailRe  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    emailHint.classList.add('visible');
    valid = false;
  } else {
    emailHint.classList.remove('visible');
  }

  /* Birthday wish */
  const wish    = document.getElementById('wish').value.trim();
  const wishHint = document.getElementById('wishHint');
  if (!wish) {
    wishHint.classList.add('visible');
    valid = false;
  } else {
    wishHint.classList.remove('visible');
  }

  if (!valid) return;

  /* Show success */
  document.getElementById('formCard').style.display = 'none';
  document.getElementById('successCard').classList.add('visible');
  window.scrollTo({
    top: document.getElementById('rsvp').offsetTop,
    behavior: 'smooth',
  });
}
