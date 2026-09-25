/* ==========================================================================
   Bumi Bernapas - Main JavaScript (Liquid Glass Jelly & Article Magazine Engine)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initTheme();
  initJellyNavbarPhysics();
  initEarthBreathSimulator();
  init3DTiltCards();
  initBackgroundParticles();
  initChecklistAndCalculator();
  initReadingProgressBar();
  initArticleMagazineSystem();
});

/* Helper function to get clean filename without .html for robust routing */
function getCleanFilename(pathStr) {
  if (!pathStr) return 'index';
  let clean = pathStr.split('?')[0].split('#')[0].split('/').pop() || 'index';
  clean = clean.replace(/\.html$/i, '');
  if (clean === '' || clean === '/') clean = 'index';
  return clean.toLowerCase();
}

/* --------------------------------------------------------------------------
   1. LIQUID GLASS JELLY NAVBAR INDICATOR ENGINE
   -------------------------------------------------------------------------- */
function initJellyNavbarPhysics() {
  const navLinksContainer = document.getElementById('nav-links');
  if (!navLinksContainer) return;

  let jellyPill = document.getElementById('nav-jelly-pill');
  if (!jellyPill) {
    jellyPill = document.createElement('div');
    jellyPill.className = 'nav-jelly-pill';
    jellyPill.id = 'nav-jelly-pill';
    navLinksContainer.insertBefore(jellyPill, navLinksContainer.firstChild);
  }

  const navLinks = navLinksContainer.querySelectorAll('.nav-link');
  if (navLinks.length === 0) return;

  function getActiveLink() {
    return navLinksContainer.querySelector('.nav-link.active') || navLinks[0];
  }

  let currentTargetLink = getActiveLink();
  let lastHoveredLink = null;

  // Spring Physics State Variables
  let currentX = 0;
  let currentY = 0;
  let currentW = 0;
  let currentH = 0;

  let targetX = 0;
  let targetY = 0;
  let targetW = 0;
  let targetH = 0;

  let vx = 0;
  let vw = 0;
  let wobbleEnergy = 0;

  let isInitialized = false;

  function updateTarget(element) {
    if (!element || window.innerWidth <= 768) {
      jellyPill.style.opacity = '0';
      return;
    }

    targetX = element.offsetLeft;
    targetY = element.offsetTop;
    targetW = element.offsetWidth;
    targetH = element.offsetHeight;
    jellyPill.style.opacity = '1';

    if (!isInitialized) {
      currentX = targetX;
      currentY = targetY;
      currentW = targetW;
      currentH = targetH;
      isInitialized = true;
    }
  }

  updateTarget(getActiveLink());

  const navbar = document.querySelector('.navbar');
  if (navbar) {
    navbar.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 768) return;

      let closestLink = null;
      let minDistance = Infinity;

      navLinks.forEach(link => {
        const rect = link.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

        if (dist < minDistance && dist < 120) {
          minDistance = dist;
          closestLink = link;
        }
      });

      if (closestLink) {
        if (closestLink !== lastHoveredLink) {
          lastHoveredLink = closestLink;
          wobbleEnergy = 1.4;
          playSoftPopSound(580, 0.02);
        }
        currentTargetLink = closestLink;
        updateTarget(closestLink);
      }
    });

    navbar.addEventListener('mouseleave', () => {
      if (window.innerWidth <= 768) return;
      lastHoveredLink = null;
      currentTargetLink = getActiveLink();
      wobbleEnergy = 1.0;
      updateTarget(currentTargetLink);
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      if (window.innerWidth <= 768) return;
      wobbleEnergy = 1.5;
      currentTargetLink = link;
      updateTarget(link);
    });
  });

  const stiffness = 0.24;
  const damping = 0.68;

  function liquidLoop(time) {
    if (isInitialized && window.innerWidth > 768) {
      if (currentTargetLink) {
        targetX = currentTargetLink.offsetLeft;
        targetY = currentTargetLink.offsetTop;
        targetW = currentTargetLink.offsetWidth;
        targetH = currentTargetLink.offsetHeight;
      }

      const dx = targetX - currentX;
      vx += dx * stiffness;
      vx *= damping;
      currentX += vx;

      const dw = targetW - currentW;
      vw += dw * stiffness;
      vw *= damping;
      currentW += vw;

      currentY = targetY;
      currentH = targetH;

      wobbleEnergy *= 0.93;

      const idleBreathingX = Math.sin(time * 0.006) * 0.04;
      const idleBreathingY = Math.cos(time * 0.006) * 0.04;
      const jiggleOscillation = Math.sin(time * 0.022) * (wobbleEnergy * 0.14);
      const rotateOscillation = Math.sin(time * 0.012) * (wobbleEnergy * 3.5 + 1) + (vx * 0.2);
      const skewOscillation = Math.cos(time * 0.018) * (wobbleEnergy * 4);

      const velocityStretch = Math.abs(vx) * 0.016;

      const scaleX = 1 + velocityStretch + jiggleOscillation + idleBreathingX;
      const scaleY = Math.max(1 - velocityStretch * 0.5 - jiggleOscillation * 0.7 + idleBreathingY, 0.65);

      const r1 = Math.round(20 + Math.sin(time * 0.008) * 5 + wobbleEnergy * 3);
      const r2 = Math.round(20 + Math.cos(time * 0.008) * 5 - wobbleEnergy * 3);

      jellyPill.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)}) rotate(${rotateOscillation.toFixed(2)}deg) skewX(${skewOscillation.toFixed(2)}deg)`;
      jellyPill.style.width = `${currentW.toFixed(2)}px`;
      jellyPill.style.height = `${currentH.toFixed(2)}px`;
      jellyPill.style.borderRadius = `${r1}px ${r2}px ${r1}px ${r2}px`;
    }

    requestAnimationFrame(liquidLoop);
  }

  requestAnimationFrame(liquidLoop);

  window.addEventListener('resize', () => {
    currentTargetLink = getActiveLink();
    updateTarget(currentTargetLink);
  });
}

/* --------------------------------------------------------------------------
   2. Dark Mode / Theme Handler
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
    playSoftPopSound(600, 0.04);
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#theme-toggle i');
  if (!icon) return;
  icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

/* --------------------------------------------------------------------------
   3. Mobile Navigation Menu & Active Route Highlighting
   -------------------------------------------------------------------------- */
function initNavigation() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = menuBtn.querySelector('i');
      if (icon) {
        icon.className = navLinks.classList.contains('active') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
      playSoftPopSound(450, 0.03);
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = menuBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      });
    });
  }

  const currentClean = getCleanFilename(window.location.pathname);

  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    const linkClean = getCleanFilename(href);

    if (linkClean === currentClean) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* --------------------------------------------------------------------------
   4. Top Reading Progress Bar Indicator
   -------------------------------------------------------------------------- */
function initReadingProgressBar() {
  const progressBar = document.getElementById('reading-progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      const pct = (scrollTop / docHeight) * 100;
      progressBar.style.width = `${Math.min(pct, 100)}%`;
    }
  });
}

/* --------------------------------------------------------------------------
   5. Editorial Eco-Magazine Article System (Feed, Modal Reader, Audio Simulation)
   -------------------------------------------------------------------------- */
const defaultArticleDataset = [
  {
    id: 101,
    judul: "Mengapa Menghemat Listrik Rumah Tangga Adalah Kunci Utama Menyelamatkan Suhu Bumi?",
    kategori: "Riset & Energetika",
    subkategori: "Laporan Utama",
    penulis: "Tim Peneliti Bumi Bernapas",
    tanggal: "24 Sep 2026",
    waktu_baca: "5 Min Baca",
    gambar: "assets/images/article_eco_tech.png",
    suka_count: 142,
    ringkasan: "Konsumsi energi bahan bakar fosil di sektor rumah tangga menyumbang lebih dari 40% emisi karbon perkotaan. Pelajari bagaimana aksi kecil di rumah membawa dampak langsung terhadap pemulihan ekosistem.",
    konten_lengkap: "<p class='lead-text'>Perubahan iklim global bukan lagi sekadar prediksi masa depan, melainkan kenyataan yang dampaknya sudah dirasakan langsung dalam kehidupan kita sehari-hari. Mulai dari gelombang panas ekstrem hingga cuaca yang tidak menentu, semua berakar dari peningkatan konsentrasi Gas Rumah Kaca (GRK) di atmosfer.</p><h3>Mengapa Rumah Tangga Menjadi Kunci Utama?</h3><p>Banyak dari kita menganggap bahwa emisi karbon terbesar berasal dari industri berat dan pabrik manufaktur. Namun, data observasi terbaru menunjukkan bahwa sektor pemukiman dan rumah tangga memberikan kontribusi akumulatif yang sangat masif terhadap total konsumsi daya nasional.</p><blockquote class='article-quote'>\"Setiap 1 kWh listrik yang dihemat dari pemakaian rumah tangga menyetarai pengurangan emisi sebesar 0.85 kg CO₂ di atmosfer.\"</blockquote><h3>Tiga Langkah Sederhana Memulai Efisiensi Energi:</h3><ul><li><strong>Stop Vampire Power:</strong> Cabut semua alat elektronik yang sedang berada pada mode standby saat tidak digunakan.</li><li><strong>Optimalkan Suhu AC:</strong> Menyetel suhu pada 24°C - 26°C dapat menghemat beban kompresor hingga 25%.</li><li><strong>Transisi ke Lampu LED:</strong> Lampu LED mengonsumsi energi 80% lebih sedikit dibanding lampu pijar konvensional.</li></ul><p>Dengan menerapkan tiga kebiasaan di atas secara konsisten, satu keluarga dapat menurunkan jejak karbon bulanan hingga puluhan kilogram sekaligus menekan tagihan listrik bulanan secara signifikan.</p>"
  },
  {
    id: 102,
    judul: "Panduan Zero Waste: Cara Praktis Mengurangi Sampah Plastik dari Dapur",
    kategori: "Gaya Hidup",
    subkategori: "Panduan Praktis",
    penulis: "Tim UX & Environment",
    tanggal: "22 Sep 2026",
    waktu_baca: "4 Min Baca",
    gambar: "assets/images/article_zero_waste.jpg",
    suka_count: 98,
    ringkasan: "Dapur adalah penyumbang terbesar sampah plastik sekali pakai. Temukan tips mudah beralih ke wadah daur ulang dan kantong belanja ramah lingkungan.",
    konten_lengkap: "<p class='lead-text'>Setiap tahun, jutaan ton sampah plastik sekali pakai berakhir di tempat pembuangan akhir dan mencemari lautan. Kebanyakan dari sampah ini berasal dari pembungkus makanan dan kantong belanja harian.</p><h3>Langkah Praktis Menuju Dapur Ramah Lingkungan</h3><p>Beralih ke gaya hidup minim sampah (zero waste) tidak harus dilakukan secara drastis dalam semalam. Anda bisa memulainya dari dapur rumah dengan langkah-langkah bertahap:</p><ul><li><strong>Siapkan Tas Belanja Kain:</strong> Selalu simpan 2-3 kantong belanja lipat di dalam tas atau kendaraan Anda.</li><li><strong>Gunakan Wadah Kaca & Stainless:</strong> Hindari pembungkus plastik tipis untuk menyimpan bahan makanan di kulkas.</li><li><strong>Pilah Sampah Organik:</strong> Sisa sayuran dan buah dapat diolah menjadi kompos alami bagi tanaman rumah.</li></ul>"
  },
  {
    id: 103,
    judul: "Misteri Standby Power: Mengapa Alat Elektronik Mati Tetap Menyedot Daya?",
    kategori: "Teknologi Hijau",
    subkategori: "Edukasi Daya",
    penulis: "Analis Daya Listrik",
    tanggal: "20 Sep 2026",
    waktu_baca: "3 Min Baca",
    gambar: "assets/images/lamp.jpg",
    suka_count: 85,
    ringkasan: "Mode standby pada TV, AC, dan charger laptop menyedot daya tersembunyi yang menambah beban tagihan listrik Anda hingga 10% setiap bulan.",
    konten_lengkap: "<p class='lead-text'>Apakah Anda sering membiarkan kabel steker kulkas, TV, atau charger laptop tetap terpasang di stopkontak meskipun perangkat dalam kondisi mati? Fenomena ini dikenal dalam dunia kelistrikan sebagai <em>Vampire Draw</em> atau <em>Standby Power</em>.</p><p>Meskipun lampu indikator perangkat tampak mati, trafo internal tetap menyerap arus listrik mikro untuk mempertahankan fungsi remote control atau clock display. Jika diakumulasikan selama satu tahun, energi yang terbuang sia-sia ini setara dengan menyalakan lampu penerangan nonstop selama berbulan-bulan!</p>"
  },
  {
    id: 104,
    judul: "Laporan Observasi 6 Bulan: Kampanye Gaya Hemat Turunkan Emisi 36.8%",
    kategori: "Data & Observasi",
    subkategori: "Laporan Riset",
    penulis: "Tim Data & Analytics",
    tanggal: "18 Sep 2026",
    waktu_baca: "6 Min Baca",
    gambar: "assets/images/earth.jpg",
    suka_count: 164,
    ringkasan: "Hasil pengumpulan data dari 250 rumah tangga membuktikan bahwa edukasi dan monitoring aksi harian efektif menekan emisi CO₂ bulanan dari 323 kg menjadi 204 kg.",
    konten_lengkap: "<p class='lead-text'>Program partisipatif Bumi Bernapas yang berlangsung dari Januari hingga Juni 2026 mencatat pencapaian positif dalam tren konsumsi listrik dan pengurangan sampah masyarakat.</p><p>Berdasarkan grafik observasi bulanan, rerata konsumsi listrik rumah tangga peserta berhasil turun dari 380 kWh pada bulan Januari menjadi 240 kWh pada bulan Juni. Hal ini berdampak langsung pada reduksi emisi karbon akumulatif sebesar 1.42 ton CO₂.</p>"
  }
];

function initArticleMagazineSystem() {
  let articles = defaultArticleDataset;
  const homepageGrid = document.getElementById('homepage-article-grid');
  const feedGrid = document.getElementById('article-feed-grid');
  const modal = document.getElementById('article-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  // Try fetching from data-dummy.json if available
  fetch('data/data-dummy.json')
    .then(res => res.json())
    .then(data => {
      if (data.artikel && data.artikel.length > 0) {
        articles = data.artikel;
      }
      renderArticles();
    })
    .catch(() => {
      renderArticles();
    });

  function renderArticles(filterCategory = 'semua', searchQuery = '') {
    let filtered = articles;

    if (filterCategory !== 'semua') {
      filtered = filtered.filter(a => a.kategori.toLowerCase() === filterCategory.toLowerCase());
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => a.judul.toLowerCase().includes(q) || a.ringkasan.toLowerCase().includes(q));
    }

    // Render Homepage Grid (top 3)
    if (homepageGrid) {
      homepageGrid.innerHTML = '';
      articles.slice(1, 4).forEach(article => {
        homepageGrid.appendChild(createArticleCardEl(article));
      });
    }

    // Render Full Feed Grid (artikel.html)
    if (feedGrid) {
      feedGrid.innerHTML = '';
      if (filtered.length === 0) {
        feedGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem;" class="text-muted"><i class="fa-solid fa-magnifying-glass fa-2x mb-2"></i><p>Tidak ada artikel yang cocok dengan pencarian Anda.</p></div>`;
      } else {
        filtered.forEach(article => {
          feedGrid.appendChild(createArticleCardEl(article));
        });
      }
    }
  }

  function createArticleCardEl(article) {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.innerHTML = `
      <div class="article-card-thumb">
        <img src="${article.gambar}" alt="${article.judul}" loading="lazy">
      </div>
      <div class="article-card-body">
        <span class="category-badge">${article.kategori}</span>
        <h3 class="article-card-title">${article.judul}</h3>
        <p class="article-card-excerpt">${article.ringkasan}</p>
        <div class="article-card-footer">
          <span><i class="fa-regular fa-clock me-1"></i> ${article.waktu_baca}</span>
          <button class="like-btn" data-id="${article.id}">
            <i class="fa-regular fa-heart"></i> ${article.suka_count}
          </button>
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      // If clicked inside like btn, don't open modal
      if (e.target.closest('.like-btn')) return;
      openArticleModal(article);
    });

    // Like button handling inside card
    const likeBtn = card.querySelector('.like-btn');
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      article.suka_count++;
      likeBtn.classList.add('liked');
      likeBtn.innerHTML = `<i class="fa-solid fa-heart text-danger"></i> ${article.suka_count}`;
      playSoftPopSound(800, 0.03);
    });

    return card;
  }

  // Filter Buttons Handler
  const filterBtns = document.querySelectorAll('#article-filter-pills .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-category');
      const searchInput = document.getElementById('article-search-input');
      const q = searchInput ? searchInput.value : '';
      renderArticles(cat, q);
    });
  });

  // Search Input Handler
  const searchInput = document.getElementById('article-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const activeBtn = document.querySelector('#article-filter-pills .filter-btn.active');
      const cat = activeBtn ? activeBtn.getAttribute('data-category') : 'semua';
      renderArticles(cat, e.target.value);
    });
  }

  // Open Article Hero Headline button
  document.querySelectorAll('.open-article-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      const article = articles.find(a => a.id === id) || articles[0];
      openArticleModal(article);
    });
  });

  // Open Article Modal Function
  function openArticleModal(article) {
    if (!modal) return;

    document.getElementById('modal-article-category').textContent = article.kategori;
    document.getElementById('modal-article-title').textContent = article.judul;
    document.getElementById('modal-article-author').textContent = article.penulis;
    document.getElementById('modal-article-date').textContent = article.tanggal;
    document.getElementById('modal-article-readtime').textContent = article.waktu_baca;
    document.getElementById('modal-article-cover').src = article.gambar;
    document.getElementById('modal-article-body').innerHTML = article.konten_lengkap;
    document.getElementById('modal-like-count').textContent = article.suka_count;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    playSoftPopSound(500, 0.03);

    // Simulated Narration Audio Player Reset
    resetAudioPlayer();
  }

  // Close Article Modal
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    stopAudioPlayer();
  }

  // Like Button inside Modal
  const modalLikeBtn = document.getElementById('modal-like-btn');
  if (modalLikeBtn) {
    modalLikeBtn.addEventListener('click', () => {
      const countEl = document.getElementById('modal-like-count');
      let count = parseInt(countEl.textContent, 10) || 0;
      count++;
      countEl.textContent = count;
      modalLikeBtn.style.color = 'var(--danger)';
      playSoftPopSound(850, 0.04);
    });
  }

  // Simulated Audio Narration Player
  let isPlaying = false;
  let audioTimer = null;
  let audioProgress = 0;

  const audioBtn = document.getElementById('modal-audio-btn');
  const progressFill = document.getElementById('modal-audio-progress');
  const audioTimeText = document.getElementById('modal-audio-time');

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        audioBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        startAudioTimer();
      } else {
        audioBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        clearInterval(audioTimer);
      }
    });
  }

  function startAudioTimer() {
    clearInterval(audioTimer);
    audioTimer = setInterval(() => {
      audioProgress += 1;
      if (audioProgress > 100) {
        stopAudioPlayer();
        return;
      }
      if (progressFill) progressFill.style.width = `${audioProgress}%`;
      const currentSec = Math.floor((audioProgress / 100) * 150);
      const m = Math.floor(currentSec / 60);
      const s = String(currentSec % 60).padStart(2, '0');
      if (audioTimeText) audioTimeText.textContent = `${m}:${s} / 2:30`;
    }, 300);
  }

  function stopAudioPlayer() {
    isPlaying = false;
    audioProgress = 0;
    clearInterval(audioTimer);
    if (audioBtn) audioBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    if (progressFill) progressFill.style.width = '0%';
    if (audioTimeText) audioTimeText.textContent = '0:00 / 2:30';
  }

  function resetAudioPlayer() {
    stopAudioPlayer();
  }

  // Initial render
  renderArticles();
}

/* --------------------------------------------------------------------------
   6. Indikator Napas Bumi Simulator
   -------------------------------------------------------------------------- */
function initEarthBreathSimulator() {
  const slider = document.getElementById('breath-slider');
  const statusBadge = document.getElementById('breath-status');
  const scoreText = document.getElementById('breath-score');
  const breathRing = document.getElementById('breath-ring');
  const breathImg = document.getElementById('breath-img');

  if (!slider || !statusBadge || !scoreText || !breathRing) return;

  function updateSimulator(score) {
    scoreText.textContent = `${score}/100`;

    if (score >= 70) {
      statusBadge.className = 'breath-status-badge status-sehat';
      statusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Napas Bumi: SEHAT';
      breathRing.style.animationDuration = '6s';
      breathRing.style.background = 'radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(6, 182, 212, 0.12) 70%, transparent 100%)';
      if (breathImg) breathImg.style.filter = 'brightness(1) hue-rotate(0deg)';
    } else if (score >= 40) {
      statusBadge.className = 'breath-status-badge status-waspada';
      statusBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Napas Bumi: WASPADA';
      breathRing.style.animationDuration = '3.2s';
      breathRing.style.background = 'radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(245, 158, 11, 0.12) 70%, transparent 100%)';
      if (breathImg) breathImg.style.filter = 'brightness(0.9) hue-rotate(-20deg)';
    } else {
      statusBadge.className = 'breath-status-badge status-kritis';
      statusBadge.innerHTML = '<i class="fa-solid fa-radiation"></i> Napas Bumi: KRITIS';
      breathRing.style.animationDuration = '1.6s';
      breathRing.style.background = 'radial-gradient(circle, rgba(239, 68, 68, 0.55) 0%, rgba(239, 68, 68, 0.15) 70%, transparent 100%)';
      if (breathImg) breathImg.style.filter = 'brightness(0.75) hue-rotate(-50deg)';
    }
  }

  slider.addEventListener('input', (e) => {
    updateSimulator(parseInt(e.target.value, 10));
    playSoftPopSound(300 + parseInt(e.target.value, 10) * 4, 0.015);
  });

  updateSimulator(parseInt(slider.value, 10));
}

/* --------------------------------------------------------------------------
   7. 3D Card Physics
   -------------------------------------------------------------------------- */
function init3DTiltCards() {
  const cards = document.querySelectorAll('.card, .feature-card, .breath-card, .article-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

/* --------------------------------------------------------------------------
   8. Background Floating Organic Particles Canvas
   -------------------------------------------------------------------------- */
function initBackgroundParticles() {
  let canvas = document.getElementById('particle-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor(width / 35), 35);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 2,
      speedY: -(Math.random() * 0.5 + 0.2),
      speedX: Math.sin(Math.random() * Math.PI) * 0.3,
      opacity: Math.random() * 0.4 + 0.15,
      color: Math.random() > 0.5 ? '#10b981' : '#06b6d4'
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += Math.sin(p.y * 0.01) * 0.3;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
}

/* --------------------------------------------------------------------------
   9. Interactive Checklist & Eco Calculator (Halaman Aksi)
   -------------------------------------------------------------------------- */
const dummyChecklistData = [
  { id: 1, judul: "Matikan Colokan & Standby Power", kategori: "Energi", deskripsi: "Cabut charger HP, laptop, dan TV saat tidak dipakai.", poin: 15, co2_saved_kg: 1.5, icon: "fa-plug" },
  { id: 2, judul: "Atur Suhu AC Optimal 25°C", kategori: "Energi", deskripsi: "Setiap kenaikan 1°C pada AC hemat energi hingga 8%.", poin: 25, co2_saved_kg: 3.2, icon: "fa-snowflake" },
  { id: 3, judul: "Bawa Botol & Wadah Sendiri", kategori: "Sampah", deskripsi: "Hindari pembelian botol plastik sekali pakai saat bepergian.", poin: 20, co2_saved_kg: 2.0, icon: "fa-bottle-water" },
  { id: 4, judul: "Gunakan Lampu LED Hemat Energi", kategori: "Energi", deskripsi: "Ganti bohlam pijar dengan lampu LED efisiensi tinggi.", poin: 30, co2_saved_kg: 4.5, icon: "fa-lightbulb" },
  { id: 5, judul: "Jalan Kaki / Sepeda Jarak Dekat", kategori: "Transportasi", deskripsi: "Kurangi penggunaan kendaraan bermotor untuk jarak dekat.", poin: 20, co2_saved_kg: 2.8, icon: "fa-person-walking" },
  { id: 6, judul: "Gunakan Ventilasi & Udara Alami", kategori: "Energi", deskripsi: "Buka jendela pagi hari untuk pencahayaan dan sirkulasi alami.", poin: 15, co2_saved_kg: 1.8, icon: "fa-wind" }
];

function initChecklistAndCalculator() {
  const container = document.getElementById('checklist-items');
  if (container) {
    let savedState = JSON.parse(localStorage.getItem('bumi_checklist_completed') || '[]');

    function renderChecklist() {
      container.innerHTML = '';
      dummyChecklistData.forEach(item => {
        const isCompleted = savedState.includes(item.id);
        const el = document.createElement('div');
        el.className = `checklist-item ${isCompleted ? 'completed' : ''}`;
        el.innerHTML = `
          <div class="custom-checkbox">
            ${isCompleted ? '<i class="fa-solid fa-check"></i>' : ''}
          </div>
          <div class="checklist-info">
            <div class="checklist-title"><i class="fa-solid ${item.icon} me-1" style="color: var(--primary);"></i> ${item.judul}</div>
            <div class="checklist-desc">${item.deskripsi}</div>
          </div>
          <div class="checklist-badge">+${item.poin} Poin</div>
        `;

        el.addEventListener('click', () => {
          if (savedState.includes(item.id)) {
            savedState = savedState.filter(id => id !== item.id);
          } else {
            savedState.push(item.id);
            playSoftPopSound(750, 0.03);
          }
          localStorage.setItem('bumi_checklist_completed', JSON.stringify(savedState));
          renderChecklist();
          updateChecklistSummary();
        });

        container.appendChild(el);
      });
      updateChecklistSummary();
    }

    function updateChecklistSummary() {
      const progressBar = document.getElementById('checklist-progress-bar');
      const progressText = document.getElementById('checklist-progress-text');
      const totalCo2Text = document.getElementById('total-co2-saved');
      const totalPointsText = document.getElementById('total-points');

      let totalPoints = 0;
      let totalCo2 = 0;

      dummyChecklistData.forEach(item => {
        if (savedState.includes(item.id)) {
          totalPoints += item.poin;
          totalCo2 += item.co2_saved_kg;
        }
      });

      const pct = Math.round((savedState.length / dummyChecklistData.length) * 100);

      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressText) progressText.textContent = `${pct}% Selesai`;
      if (totalCo2Text) totalCo2Text.textContent = `${totalCo2.toFixed(1)} kg`;
      if (totalPointsText) totalPointsText.textContent = `${totalPoints} Poin`;
    }

    renderChecklist();
  }

  // Eco Calculator
  const acInput = document.getElementById('calc-ac-hours');
  const lampInput = document.getElementById('calc-lamp-count');
  const motorInput = document.getElementById('calc-motor-km');

  const resCost = document.getElementById('calc-res-cost');
  const resCo2 = document.getElementById('calc-res-co2');

  if (acInput && lampInput && motorInput && resCost && resCo2) {
    function calculateImpact() {
      const acHours = parseFloat(acInput.value) || 0;
      const lamps = parseFloat(lampInput.value) || 0;
      const motorKm = parseFloat(motorInput.value) || 0;

      const monthlyKwhSaved = (acHours * 0.75 * 30) + (lamps * 0.03 * 5 * 30);
      const monthlyCostSaved = Math.round(monthlyKwhSaved * 1444 + motorKm * 30 * 450);
      const monthlyCo2Saved = (monthlyKwhSaved * 0.85) + (motorKm * 30 * 0.12);

      resCost.textContent = `Rp ${monthlyCostSaved.toLocaleString('id-ID')}`;
      resCo2.textContent = `${monthlyCo2Saved.toFixed(1)} kg`;
    }

    [acInput, lampInput, motorInput].forEach(inp => {
      inp.addEventListener('input', calculateImpact);
    });

    calculateImpact();
  }
}

/* --------------------------------------------------------------------------
   Helper Synthesizer Sound Safe Instance
   -------------------------------------------------------------------------- */
function playSoftPopSound(freq = 440, duration = 0.03) {
  try {
    if (!window._audioCtx) {
      window._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (window._audioCtx.state === 'suspended') {
      window._audioCtx.resume();
    }
    const osc = window._audioCtx.createOscillator();
    const gain = window._audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, window._audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, window._audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, window._audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, window._audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(window._audioCtx.destination);

    osc.start();
    osc.stop(window._audioCtx.currentTime + duration);
  } catch (e) {
    // Silent fallback
  }
}
