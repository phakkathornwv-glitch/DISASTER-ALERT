// ========================================================
// CHART MANAGER: TELEMETRY & CRISIS ANALYTICS (CHART.JS)
// ========================================================

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export class ChartManager {
  constructor() {
    this.waterChart = null;
    this.rainChart = null;
    this.typeChart = null;
    this.pm25Chart = null;
  }

  initAllCharts(incidents = []) {
    this.initWaterLevelChart();
    this.initRainfallChart();
    this.initDisasterTypeChart(incidents);
    this.initPm25Chart();
  }

  initWaterLevelChart() {
    const ctx = document.getElementById('waterLevelChart');
    if (!ctx) return;
    if (this.waterChart) this.waterChart.destroy();

    const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '23:00'];

    this.waterChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hours,
        datasets: [
          {
            label: 'แม่น้ำสาย (อ.แม่สาย) - ระดับตลิ่ง 5.00 ม.',
            data: [3.8, 4.1, 4.5, 4.9, 5.2, 5.5, 5.7, 5.8, 5.85],
            borderColor: '#ff334b',
            backgroundColor: 'rgba(255, 51, 75, 0.15)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#ff334b'
          },
          {
            label: 'แม่น้ำปิง (P.1 นวรัฐ เชียงใหม่) - ระดับวิกฤต 3.70 ม.',
            data: [2.9, 3.0, 3.1, 3.3, 3.45, 3.55, 3.62, 3.65, 3.68],
            borderColor: '#ff9100',
            backgroundColor: 'transparent',
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 3
          },
          {
            label: 'เขื่อนเจ้าพระยา (อัตราปล่อยน้ำ x1000 ลบ.ม./วิ)',
            data: [1.8, 1.85, 1.9, 1.95, 2.0, 2.05, 2.1, 2.15, 2.18],
            borderColor: '#00d2ff',
            backgroundColor: 'transparent',
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { family: 'Prompt', size: 11 } }
          },
          tooltip: {
            titleFont: { family: 'Prompt' },
            bodyFont: { family: 'Prompt' }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } }
          }
        }
      }
    });
  }

  initRainfallChart() {
    const ctx = document.getElementById('rainfallChart');
    if (!ctx) return;
    if (this.rainChart) this.rainChart.destroy();

    const stations = ['อ.แม่สาย (ชร)', 'อ.เมือง (ชร)', 'อ.ปาย (มห)', 'อ.เวียงป่าเป้า', 'อ.แม่วาง (ชม)'];
    const rainfallMm = [142.5, 98.2, 76.0, 115.4, 64.2];

    this.rainChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: stations,
        datasets: [{
          label: 'ปริมาณฝนสะสม 24 ชม. (มม.)',
          data: rainfallMm,
          backgroundColor: [
            '#ff334b', // > 120 mm (Extreme)
            '#ff9100', // Heavy
            '#00d2ff',
            '#ff9100',
            '#00e5a3'
          ],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            titleFont: { family: 'Prompt' },
            bodyFont: { family: 'Prompt' }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#cbd5e1', font: { family: 'Prompt', size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } }
          }
        }
      }
    });
  }

  initDisasterTypeChart(incidents = []) {
    const ctx = document.getElementById('disasterTypeChart');
    if (!ctx) return;
    if (this.typeChart) this.typeChart.destroy();

    const counts = { flood: 0, landslide: 0, earthquake: 0, chemical: 0, storm: 0, pm25: 0, other: 0 };
    incidents.forEach(inc => {
      if (counts[inc.type] !== undefined) counts[inc.type]++;
      else counts.other++;
    });

    this.typeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['อุทกภัย (น้ำท่วม)', 'ดินโคลนถล่ม', 'แผ่นดินไหว', 'สารเคมี / ไฟไหม้', 'วาตภัย', 'ฝุ่น PM2.5'],
        datasets: [{
          data: [
            counts.flood || 4,
            counts.landslide || 2,
            counts.earthquake || 1,
            counts.chemical || 1,
            counts.storm || 1,
            counts.pm25 || 1
          ],
          backgroundColor: [
            '#0070f3',
            '#8d6e63',
            '#ffd600',
            '#ff334b',
            '#00d2ff',
            '#94a3b8'
          ],
          borderWidth: 2,
          borderColor: '#0d1527'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#cbd5e1', font: { family: 'Prompt', size: 11 }, boxWidth: 12 }
          }
        }
      }
    });
  }

  initPm25Chart() {
    const ctx = document.getElementById('pm25Chart');
    if (!ctx) return;
    if (this.pm25Chart) this.pm25Chart.destroy();

    const provinces = ['เชียงใหม่', 'เชียงราย', 'น่าน', 'แม่ฮ่องสอน', 'ลำปาง', 'กทม.'];
    const pmValues = [88, 115, 128, 92, 74, 38];

    this.pm25Chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: provinces,
        datasets: [{
          label: 'ค่า PM2.5 (µg/m³)',
          data: pmValues,
          backgroundColor: pmValues.map(v => v >= 75 ? '#ff334b' : v >= 50 ? '#ff9100' : v >= 37.5 ? '#ffd600' : '#00e676'),
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `PM2.5: ${context.raw} µg/m³ (${context.raw >= 75 ? 'มีผลกระทบต่อสุขภาพ (สีแดง)' : 'เริ่มมีผลกระทบ (สีส้ม)'})`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#cbd5e1', font: { family: 'Prompt', size: 11 } },
            grid: { display: false }
          },
          y: {
            ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  }
}
