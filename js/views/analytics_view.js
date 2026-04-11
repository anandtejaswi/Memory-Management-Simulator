/*
 * analytics_view.js
 * Chart.js wrappers and heatmap rendering for the analytics dashboard.
 * Exports exportCSV and exportPDF helpers.
 */

let charts = {};

function getOrCreate(id, type, data, options) {
  if (charts[id]) {
    charts[id].data = data;
    charts[id].update();
    return charts[id];
  }
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  charts[id] = new Chart(canvas, { type, data, options });
  return charts[id];
}

const chartDefaults = {
  responsive: true,
  plugins: { legend: { labels: { color: '#4b5563', font: { size: 12 } } } },
  scales: {
    x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(233,213,255,0.4)' } },
    y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(233,213,255,0.4)' } }
  }
};

export function updateUtilisationChart(timeline) {
  const labels = timeline.map((_, i) => i + 1);
  const values = timeline.map(t => t.value);
  getOrCreate('chart-utilisation', 'line', {
    labels,
    datasets: [{
      label: 'Memory Utilisation %',
      data: values,
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124,58,237,0.08)',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: '#7c3aed'
    }]
  }, {
    ...chartDefaults,
    scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 0, max: 100 } }
  });
}

export function updateFaultChart(prHistory) {
  const labels = prHistory.map(r => r.algorithmName);
  const faults = prHistory.map(r => r.totalFaults);
  getOrCreate('chart-faults', 'bar', {
    labels,
    datasets: [{
      label: 'Page Faults',
      data: faults,
      backgroundColor: 'rgba(124,58,237,0.6)',
      borderColor: '#7c3aed',
      borderWidth: 1
    }]
  }, chartDefaults);
}

export function updateFragmentationChart(timeline) {
  const labels = timeline.map((_, i) => i + 1);
  const values = timeline.map(t => t.value);
  getOrCreate('chart-fragmentation', 'line', {
    labels,
    datasets: [{
      label: 'External Fragmentation KB',
      data: values,
      borderColor: '#a855f7',
      backgroundColor: 'rgba(168,85,247,0.08)',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: '#a855f7'
    }]
  }, chartDefaults);
}

export function updateTLBChart(timeline) {
  const labels = timeline.map((_, i) => i + 1);
  const values = timeline.map(t => (t.value * 100).toFixed(1));
  getOrCreate('chart-tlb', 'line', {
    labels,
    datasets: [{
      label: 'TLB Hit Ratio %',
      data: values,
      borderColor: '#6d28d9',
      backgroundColor: 'rgba(109,40,217,0.08)',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: '#6d28d9'
    }]
  }, {
    ...chartDefaults,
    scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 0, max: 100 } }
  });
}

export function updateHeatmap(containerId, accessFreq) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const pages = Object.keys(accessFreq).map(Number).sort((a, b) => a - b);
  if (pages.length === 0) { el.innerHTML = '<p style="color:var(--text-muted)">No access data yet.</p>'; return; }

  const maxFreq = Math.max(...Object.values(accessFreq), 1);
  const cols = Math.min(pages.length, 32);

  let html = `<div class="heatmap-grid" style="grid-template-columns:repeat(${cols},18px)">`;
  for (const p of pages) {
    const freq = accessFreq[p] || 0;
    const intensity = Math.round((freq / maxFreq) * 255);
    const bg = `rgb(${255 - Math.round(intensity * 0.51)},${255 - Math.round(intensity * 0.77)},${255 - Math.round(intensity * 0.08)})`;
    html += `<div class="heatmap-cell" style="background:${bg}" title="Page ${p}: ${freq} accesses"></div>`;
  }
  html += '</div>';
  html += `<div style="margin-top:8px;font-size:12px;color:var(--text-muted)">Pages: ${pages.length} | Max accesses: ${maxFreq}</div>`;
  el.innerHTML = html;
}

export function renderAllCharts(state) {
  updateUtilisationChart(state.utilizationTimeline);
  updateFaultChart(state.prHistory.slice(-10));
  updateFragmentationChart(state.fragmentationTimeline);
  updateTLBChart(state.tlbRatioTimeline);
  updateHeatmap('heatmap-canvas', state.accessFrequency);
}

export function exportCSV(state) {
  const rows = [['Type', 'Algorithm', 'Timestamp', 'Value']];
  for (const h of state.allocationHistory) {
    rows.push(['Allocation', h.algorithm, h.timestamp, JSON.stringify(h.stats)]);
  }
  for (const r of state.prHistory) {
    rows.push(['PageReplacement', r.algorithmName, r.timestamp || '', `Faults:${r.totalFaults} Hits:${r.totalHits}`]);
  }
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'simulation_history.csv'; a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF() {
  window.print();
}
