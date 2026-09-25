/* ==========================================================================
   Bumi Bernapas - Data & Visualisasi Chart.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCharts();
});

function initCharts() {
  const lineCtx = document.getElementById('monthlyTrendChart');
  const doughnutCtx = document.getElementById('energyDistChart');
  const barCtx = document.getElementById('surveyChart');

  if (!lineCtx && !doughnutCtx && !barCtx) return;

  // Primary Theme Colors
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  // Chart 1: Tren Konsumsi Listrik vs Emisi CO2 (Line Chart)
  if (lineCtx) {
    const ctx = lineCtx.getContext('2d');
    
    // Gradients
    const gradKwh = ctx.createLinearGradient(0, 0, 0, 300);
    gradKwh.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradKwh.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    const gradCo2 = ctx.createLinearGradient(0, 0, 0, 300);
    gradCo2.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
    gradCo2.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'],
        datasets: [
          {
            label: 'Konsumsi Listrik (kWh)',
            data: [380, 350, 320, 290, 265, 240],
            borderColor: '#10b981',
            backgroundColor: gradKwh,
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#10b981',
            pointRadius: 5,
            pointHoverRadius: 8
          },
          {
            label: 'Emisi CO₂ (kg)',
            data: [323, 297.5, 272.0, 246.5, 225.25, 204.0],
            borderColor: '#06b6d4',
            backgroundColor: gradCo2,
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#06b6d4',
            pointRadius: 5,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } }
          },
          tooltip: {
            padding: 12,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleFont: { family: 'Plus Jakarta Sans', size: 14, weight: 'bold' },
            bodyFont: { family: 'Plus Jakarta Sans', size: 13 }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } }
          }
        }
      }
    });
  }

  // Chart 2: Proporsi Konsumsi Energi Rumah Tangga (Doughnut Chart)
  if (doughnutCtx) {
    new Chart(doughnutCtx, {
      type: 'doughnut',
      data: {
        labels: [
          'Pendingin Ruangan (AC)',
          'Kulkas & Lemari Es',
          'Penerangan (Lampu)',
          'Elektronik & Hiburan',
          'Lain-lain (Pompa Air, dll)'
        ],
        datasets: [{
          data: [42, 22, 15, 13, 8],
          backgroundColor: [
            '#10b981',
            '#06b6d4',
            '#3b82f6',
            '#8b5cf6',
            '#f59e0b'
          ],
          borderWidth: 3,
          borderColor: isDark ? '#09131a' : '#ffffff',
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } }
          }
        },
        cutout: '65%'
      }
    });
  }

  // Chart 3: Hasil Angket Kesadaran Hemat (Bar Chart)
  if (barCtx) {
    new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: [
          'Matikan Listrik Standby',
          'Bawa Botol Tumblr',
          'Jalan Kaki / Sepeda',
          'Memilah Sampah',
          'Suhu AC Ideal 24-26°C'
        ],
        datasets: [
          {
            label: 'Selalu (%)',
            data: [68, 75, 45, 52, 61],
            backgroundColor: '#10b981',
            borderRadius: 6
          },
          {
            label: 'Kadang-kadang (%)',
            data: [24, 18, 38, 33, 29],
            backgroundColor: '#06b6d4',
            borderRadius: 6
          },
          {
            label: 'Jarang (%)',
            data: [8, 7, 17, 15, 10],
            backgroundColor: '#f59e0b',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' }, max: 100 }
          }
        }
      }
    });
  }
}
