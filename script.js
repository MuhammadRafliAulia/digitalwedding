/**
 * THE WEDDING OF RAFLI & KAY - JAVASCRIPT
 * Interactive digital wedding invitation engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initGuestName();
  initCountdown();
  initMusicPlayer();
  initOpenInvitation();
  initRSVPAndWishes();
  initScrollSpy();
  initPetalsAnimation();
});

/* ==========================================================================
   1. GUEST NAME FROM URL PARAMETER (?to=Nama+Tamu)
   ========================================================================== */
function initGuestName() {
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to') || urlParams.get('u') || urlParams.get('nama');
  
  const guestDisplay = document.getElementById('guest-name-display');
  const rsvpNameInput = document.getElementById('rsvp-name');

  if (guestName && guestName.trim() !== '') {
    // Sanitize string
    const decodedName = decodeURIComponent(guestName.replace(/\+/g, ' '));
    if (guestDisplay) guestDisplay.textContent = decodedName;
    if (rsvpNameInput) rsvpNameInput.value = decodedName;
  }
}

/* ==========================================================================
   2. COUNTDOWN TIMER
   ========================================================================== */
function initCountdown() {
  // Target: 12 Desember 2026, 08:00:00 WIB
  const targetDate = new Date('2026-12-12T08:00:00+07:00').getTime();

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = days < 10 ? '0' + days : days;
    if (hoursEl) hoursEl.textContent = hours < 10 ? '0' + hours : hours;
    if (minutesEl) minutesEl.textContent = minutes < 10 ? '0' + minutes : minutes;
    if (secondsEl) secondsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   3. AUDIO / BACKGROUND MUSIC PLAYER (with Web Audio Fallback)
   ========================================================================== */
let audioCtx = null;
let synthInterval = null;
let isPlayingSynth = false;

function initMusicPlayer() {
  const musicAudio = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-btn');

  if (!musicBtn) return;

  musicBtn.addEventListener('click', () => {
    if (musicAudio && !musicAudio.paused) {
      pauseMusic();
    } else if (isPlayingSynth) {
      stopSynthMusic();
      musicBtn.classList.add('paused');
    } else {
      playMusic();
    }
  });
}

function playMusic() {
  const musicAudio = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-btn');

  if (musicAudio) {
    const playPromise = musicAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (musicBtn) musicBtn.classList.remove('paused');
        })
        .catch(() => {
          // If external audio source blocked or offline, use gentle romantic Web Audio Synth!
          startSynthMusic();
          if (musicBtn) musicBtn.classList.remove('paused');
        });
    }
  } else {
    startSynthMusic();
    if (musicBtn) musicBtn.classList.remove('paused');
  }
}

function pauseMusic() {
  const musicAudio = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-btn');

  if (musicAudio) musicAudio.pause();
  stopSynthMusic();
  if (musicBtn) musicBtn.classList.add('paused');
}

// Gentle offline romantic piano/harp arpeggio synthesizer
function startSynthMusic() {
  if (isPlayingSynth) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioCtx = new AudioContext();

    const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 392.00, 329.63, 293.66]; // C-E-G-C-A-G-E-D
    let noteIdx = 0;

    isPlayingSynth = true;
    synthInterval = setInterval(() => {
      if (!isPlayingSynth || !audioCtx) return;
      playSoftChime(notes[noteIdx % notes.length]);
      noteIdx++;
    }, 600);
  } catch (e) {
    console.warn('Web Audio not supported');
  }
}

function playSoftChime(freq) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 1.25);
}

function stopSynthMusic() {
  isPlayingSynth = false;
  if (synthInterval) clearInterval(synthInterval);
  if (audioCtx && audioCtx.state !== 'closed') {
    audioCtx.suspend().catch(() => {});
  }
}

/* ==========================================================================
   4. OPEN INVITATION INTERACTION
   ========================================================================== */
function initOpenInvitation() {
  const btnOpen = document.getElementById('btn-open-invitation');
  const coverSection = document.getElementById('cover');
  const mainContent = document.getElementById('main-content');
  const bottomNav = document.getElementById('bottom-nav');

  if (!btnOpen) return;

  btnOpen.addEventListener('click', () => {
    // 1. Play Background Music
    playMusic();

    // 2. Unlock main content
    if (mainContent) mainContent.classList.remove('locked');

    // 3. Animate cover slide away
    if (coverSection) coverSection.classList.add('opened');

    // 4. Reveal bottom navigation
    if (bottomNav) bottomNav.classList.remove('hidden');

    // 5. Smooth scroll down to first content section
    setTimeout(() => {
      const homeEl = document.getElementById('home');
      if (homeEl) {
        homeEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 400);
  });
}

/* ==========================================================================
   5. RSVP & WISHES SYSTEM (LocalStorage + Initial Seeds)
   ========================================================================== */
const DEFAULT_WISHES = [
  {
    name: "Dimas Pratama & Istri",
    attendance: "Hadir",
    message: "Selamat menempuh hidup baru Rafli & Kay! Semoga senantiasa sakinah, mawaddah, warahmah sampai kakek nenek. Aamiin!",
    time: "Baru saja"
  },
  {
    name: "Alissa Qonita",
    attendance: "Hadir",
    message: "Masya Allah terharu banget melihat perjalanan cinta kalian dari jaman kuliah dulu. Lancar sampai hari H ya Kay dan Rafli!",
    time: "1 jam yang lalu"
  },
  {
    name: "Bagas Wicaksono",
    attendance: "Hadir",
    message: "Barakallahu lakum wa baraka alaikum wa jama'a bainakuma fii khoir. Selamat brother Rafli!",
    time: "3 jam yang lalu"
  },
  {
    name: "Fauzan & Keluarga",
    attendance: "Hadir",
    message: "Selamat berbahagia Rafli & Kay! Semoga selalu dilimpahkan keberkahan dan kebahagiaan dalam rumah tangga.",
    time: "5 jam yang lalu"
  }
];

function initRSVPAndWishes() {
  const rsvpForm = document.getElementById('rsvp-form');
  const wishesList = document.getElementById('wishes-list');
  const wishesCount = document.getElementById('wishes-count');

  // Load from localStorage or defaults
  let storedWishes = JSON.parse(localStorage.getItem('wedding_wishes_rafli_kay') || 'null');
  if (!storedWishes || !Array.isArray(storedWishes) || storedWishes.length === 0) {
    storedWishes = DEFAULT_WISHES;
    localStorage.setItem('wedding_wishes_rafli_kay', JSON.stringify(storedWishes));
  }

  function renderWishes() {
    if (!wishesList) return;
    wishesList.innerHTML = '';
    
    storedWishes.forEach(item => {
      const wishDiv = document.createElement('div');
      wishDiv.className = 'wish-item';

      let badgeClass = 'hadir';
      if (item.attendance === 'Tidak Hadir') badgeClass = 'tidak-hadir';
      else if (item.attendance === 'Ragu-ragu') badgeClass = 'ragu';

      wishDiv.innerHTML = `
        <div class="wish-meta">
          <span class="wish-sender">${escapeHtml(item.name)}</span>
          <span class="wish-badge ${badgeClass}">${escapeHtml(item.attendance)}</span>
        </div>
        <p class="wish-content">${escapeHtml(item.message)}</p>
        <span class="wish-time"><i class="fa-regular fa-clock"></i> ${escapeHtml(item.time)}</span>
      `;
      wishesList.appendChild(wishDiv);
    });

    if (wishesCount) wishesCount.textContent = storedWishes.length;
  }

  renderWishes();

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('rsvp-name').value.trim();
      const attendance = document.getElementById('rsvp-attendance').value;
      const guests = document.getElementById('rsvp-guests').value;
      const message = document.getElementById('rsvp-message').value.trim();

      if (!name || !attendance || !message) {
        showToast('Mohon lengkapi semua data konfirmasi.');
        return;
      }

      const newWish = {
        name: name,
        attendance: attendance,
        message: message,
        time: "Baru saja"
      };

      storedWishes.unshift(newWish);
      localStorage.setItem('wedding_wishes_rafli_kay', JSON.stringify(storedWishes));
      renderWishes();

      // Reset textarea and message
      document.getElementById('rsvp-message').value = '';
      showToast('Terima kasih! Doa dan konfirmasi kehadiran Anda berhasil dikirim.');
    });
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

/* ==========================================================================
   6. COPY TO CLIPBOARD & TOAST NOTIFICATION
   ========================================================================== */
function copyToClipboard(text, customMessage = 'Berhasil disalin ke clipboard!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(customMessage);
    }).catch(() => {
      fallbackCopy(text, customMessage);
    });
  } else {
    fallbackCopy(text, customMessage);
  }
}

function fallbackCopy(text, message) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(message);
  } catch (err) {
    showToast('Gagal menyalin teks.');
  }
  document.body.removeChild(textArea);
}

let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ==========================================================================
   7. LIGHTBOX MODAL
   ========================================================================== */
function openLightbox(imgSrc, captionText) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');

  if (lightbox && lightboxImg) {
    lightboxImg.src = imgSrc;
    if (lightboxCaption) lightboxCaption.textContent = captionText || '';
    lightbox.classList.add('active');
  }
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) lightbox.classList.remove('active');
}

/* ==========================================================================
   8. SCROLL SPY FOR FLOATING BOTTOM NAV
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.bottom-nav .nav-item');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 220;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos <= sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   9. CANVASES - FALLING ROSE PETALS / GOLDEN DUST
   ========================================================================== */
function initPetalsAnimation() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petalsCount = 28;
  const petals = [];

  const colors = [
    'rgba(180, 40, 60, 0.45)',  // Deep maroon petal
    'rgba(215, 60, 80, 0.40)',  // Rose petal
    'rgba(212, 175, 55, 0.45)', // Golden sparkle
    'rgba(240, 200, 120, 0.35)' // Champagne flake
  ];

  for (let i = 0; i < petalsCount; i++) {
    petals.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 6,
      speedX: Math.random() * 1.5 - 0.75,
      speedY: Math.random() * 1.2 + 0.6,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, 0, 0, p.size);
    ctx.bezierCurveTo(-p.size, 0, -p.size / 2, -p.size / 2, 0, 0);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.y += p.speedY;
      p.x += Math.sin(p.y / 30) * 0.8 + p.speedX;
      p.rotation += p.rotationSpeed;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x > width + 20) p.x = -20;
      if (p.x < -20) p.x = width + 20;

      drawPetal(p);
    }

    requestAnimationFrame(animate);
  }

  animate();
}
