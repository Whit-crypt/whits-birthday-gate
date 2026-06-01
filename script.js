/* ═══════════════════════════════════════════════════════
   Whit's Birthday Gate — script.js
   ─ Theme toggle (persisted)
   ─ Floating petals
   ─ Countdown (single row)
   ─ Name: letters only, max 25
   ─ File upload with drag-and-drop + preview
   ─ AI message assistant (Claude API)
   ─ EmailJS submission → whitneynhelly@gmail.com
   ═══════════════════════════════════════════════════════ */

/* ══ EMAILJS CONFIG ══════════════════════════════════════
   One-time setup at https://www.emailjs.com (free):
   1. Create account → connect Gmail service
   2. Create template with variables:
        {{from_name}} {{from_email}} {{wish}} {{memory}} {{attachment_note}}
      Set "To" = whitneynhelly@gmail.com
   3. Copy your keys into the three lines below:
*/
const EJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // ← replace
const EJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // ← replace
const EJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // ← replace
const TO_EMAIL        = 'whitneynhelly@gmail.com';

/* ══ THEME ══════════════════════════════════════════════ */
const html      = document.documentElement;
const themeBtn  = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('whit-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('whit-theme', next);
});

/* ══ PETALS ══════════════════════════════════════════════ */
(function spawnPetals() {
  const container = document.getElementById('petals');
  const colors    = ['#e8a0a8','#d4a055','#c97090','#f0c070','#c0607e','#d4c0a0'];

  function makePetal() {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.left          = Math.random() * 100 + 'vw';
    p.style.top           = '-30px';
    p.style.background    = colors[Math.floor(Math.random() * colors.length)];
    p.style.width         = (6 + Math.random() * 10) + 'px';
    p.style.height        = (10 + Math.random() * 14) + 'px';
    p.style.animationDuration   = (8 + Math.random() * 12) + 's';
    p.style.animationDelay      = (Math.random() * 8) + 's';
    p.style.transform     = 'rotate(' + (Math.random() * 360) + 'deg)';
    container.appendChild(p);
    setTimeout(() => p.remove(), 22000);
  }

  // Initial burst
  for (let i = 0; i < 18; i++) setTimeout(makePetal, i * 300);
  // Continuous drip
  setInterval(makePetal, 800);
})();

/* ══ COUNTDOWN ══════════════════════════════════════════ */
(function countdown() {
  const target = new Date('2026-06-07T10:00:00');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id =>
        document.getElementById(id).textContent = '00');
      return;
    }
    document.getElementById('cd-days').textContent  = pad(Math.floor(diff / 86400000));
    document.getElementById('cd-hours').textContent = pad(Math.floor((diff % 86400000) / 3600000));
    document.getElementById('cd-mins').textContent  = pad(Math.floor((diff % 3600000) / 60000));
    document.getElementById('cd-secs').textContent  = pad(Math.floor((diff % 60000) / 1000));
  }
  tick();
  setInterval(tick, 1000);
})();

/* ══ NAME — letters only, max 25 ══════════════════════ */
const fnameEl = document.getElementById('fname');
fnameEl.addEventListener('input', () => {
  fnameEl.value = fnameEl.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 25);
});

/* ══ FILE UPLOAD ════════════════════════════════════════ */
const uploadZone    = document.getElementById('uploadZone');
const uploadIdle    = document.getElementById('uploadIdle');
const uploadPreview = document.getElementById('uploadPreview');
const fileInput     = document.getElementById('fileInput');
const uploadTrigger = document.getElementById('uploadTrigger');
const ffileErr      = document.getElementById('ffile-err');
let attachedFile    = null;

uploadTrigger.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('click', e => { if (e.target !== uploadTrigger) fileInput.click(); });

uploadZone.addEventListener('dragover',  e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', ()  => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault(); uploadZone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

function handleFile(f) {
  ffileErr.textContent = '';
  if (f.size > 10 * 1024 * 1024) { ffileErr.textContent = 'File exceeds 10 MB limit.'; return; }
  attachedFile = f;
  const isImg = f.type.startsWith('image/');
  const thumb = isImg
    ? `<img class="prev-thumb" src="${URL.createObjectURL(f)}" alt="preview">`
    : `<div class="prev-icon">📄</div>`;
  uploadPreview.innerHTML = `
    ${thumb}
    <div class="prev-info">
      <p class="prev-name">${f.name}</p>
      <p class="prev-size">${(f.size / 1024).toFixed(1)} KB</p>
    </div>
    <button class="prev-rm" id="removeFile" title="Remove">✕</button>`;
  uploadIdle.style.display    = 'none';
  uploadPreview.style.display = 'flex';
  document.getElementById('removeFile').addEventListener('click', () => {
    attachedFile = null; fileInput.value = '';
    uploadPreview.style.display = 'none'; uploadPreview.innerHTML = '';
    uploadIdle.style.display = '';
  });
}

/* ══ AI ASSISTANT ═══════════════════════════════════════ */
const aiTrigger  = document.getElementById('aiTrigger');
const aiPanel    = document.getElementById('aiPanel');
const aiClose    = document.getElementById('aiClose');
const aiGenerate = document.getElementById('aiGenerate');
const aiOutput   = document.getElementById('aiOutput');
const aiUse      = document.getElementById('aiUse');
const aiContext  = document.getElementById('aiContext');
const fwishEl    = document.getElementById('fwish');

aiTrigger.addEventListener('click',  () => aiPanel.classList.toggle('open'));
aiClose.addEventListener('click',    () => aiPanel.classList.remove('open'));

aiGenerate.addEventListener('click', async () => {
  const ctx = aiContext.value.trim();
  aiOutput.className = 'ai-output show';
  aiOutput.innerHTML = `<div class="ai-loader"><span></span><span></span><span></span></div>`;
  aiUse.style.display = 'none';
  aiGenerate.disabled = true;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a warm, creative birthday message writer. Write a sincere, personal birthday message for a young woman named Whitney (also called Whit).

Context about the sender: "${ctx || 'A friend who loves and admires her deeply'}"

Rules:
- 3 to 5 sentences, heartfelt and personal
- Use "Whitney" or "Whit" naturally
- Written in first person ("I")
- Warm but not over-the-top; genuine
- End with a joyful birthday wish
- No hashtags, no bullet points
- Return ONLY the message, nothing else`
        }]
      })
    });
    const data = await res.json();
    const msg  = (data.content || []).map(b => b.text || '').join('').trim();
    if (msg) {
      aiOutput.textContent = msg;
      aiUse.style.display  = 'inline-block';
    } else {
      aiOutput.textContent = 'Could not generate a message. Please try again.';
    }
  } catch (err) {
    aiOutput.textContent = 'Something went wrong. Check your connection and try again.';
  }
  aiGenerate.disabled = false;
});

aiUse.addEventListener('click', () => {
  const txt = aiOutput.textContent.trim();
  if (txt) { fwishEl.value = txt; aiPanel.classList.remove('open'); }
});

/* ══ VALIDATION ═════════════════════════════════════════ */
function validate() {
  let ok = true;

  const name = fnameEl.value.trim();
  const nErr = document.getElementById('fname-err');
  if (!name) {
    nErr.textContent = 'Please enter your name.'; fnameEl.classList.add('invalid'); ok = false;
  } else if (!/^[a-zA-Z\s]+$/.test(name)) {
    nErr.textContent = 'Name must contain letters only.'; fnameEl.classList.add('invalid'); ok = false;
  } else {
    nErr.textContent = ''; fnameEl.classList.remove('invalid');
  }

  const emailEl  = document.getElementById('femail');
  const emailErr = document.getElementById('femail-err');
  const emailOk  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim());
  if (!emailEl.value.trim() || !emailOk) {
    emailErr.textContent = 'Please enter a valid email.'; emailEl.classList.add('invalid'); ok = false;
  } else {
    emailErr.textContent = ''; emailEl.classList.remove('invalid');
  }

  const wishErr = document.getElementById('fwish-err');
  if (!fwishEl.value.trim()) {
    wishErr.textContent = 'Please write a birthday wish.'; fwishEl.classList.add('invalid'); ok = false;
  } else {
    wishErr.textContent = ''; fwishEl.classList.remove('invalid');
  }

  return ok;
}

/* ══ EMAILJS LOADER ════════════════════════════════════ */
function loadEmailJS() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) { resolve(); return; }
    const s = document.createElement('script');
    s.src     = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload  = () => { window.emailjs.init(EJS_PUBLIC_KEY); resolve(); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

/* ══ SUBMIT ════════════════════════════════════════════ */
const submitBtn = document.getElementById('submitBtn');
submitBtn.addEventListener('click', async () => {
  if (!validate()) return;

  submitBtn.disabled    = true;
  submitBtn.textContent = 'Sending… 🌸';

  const name   = fnameEl.value.trim();
  const email  = document.getElementById('femail').value.trim();
  const wish   = fwishEl.value.trim();
  const memory = document.getElementById('fmemory').value.trim();
  const attachmentNote = attachedFile
    ? `Attached: ${attachedFile.name} (${(attachedFile.size/1024).toFixed(1)} KB)`
    : 'No attachment';

  const params = {
    to_email        : TO_EMAIL,
    from_name       : name,
    from_email      : email,
    wish            : wish,
    memory          : memory || '—',
    attachment_note : attachmentNote,
    reply_to        : email,
  };

  try {
    await loadEmailJS();
    await window.emailjs.send(EJS_SERVICE_ID, EJS_TEMPLATE_ID, params);
    showSuccess();
  } catch (err) {
    console.error('EmailJS error:', err);
    // Graceful fallback — open mail client
    const sub  = encodeURIComponent(`Birthday Wishes from ${name} 🌸`);
    const body = encodeURIComponent(
      `From: ${name} <${email}>\n\nWish:\n${wish}\n\nMemory:\n${memory || '—'}\n\n${attachmentNote}`
    );
    window.location.href = `mailto:${TO_EMAIL}?subject=${sub}&body=${body}`;
    showSuccess();
  } finally {
    submitBtn.disabled    = false;
    submitBtn.textContent = '✦  SEND MY WISHES  ✦';
  }
});

function showSuccess() {
  document.getElementById('formCard').style.display  = 'none';
  document.querySelector('.wishes-header').style.display = 'none';
  const sc = document.getElementById('successCard');
  sc.style.display = 'flex';
  sc.scrollIntoView({ behavior:'smooth', block:'center' });
}
