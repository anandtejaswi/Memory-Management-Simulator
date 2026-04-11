/*
 * virtual_memory_view.js
 * View functions for all virtual memory sub-modules:
 * working set, multi-level page table, inverted PT, thrashing.
 * No algorithm logic.
 */

export function renderWorkingSet(containerId, result) {
  const el = document.getElementById(containerId);
  if (!el || !result) return;

  let html = `<div class="stats-row">
    <div class="stat-item">Total Steps: <span>${result.stepCount}</span></div>
    <div class="stat-item">Page Faults: <span>${result.totalFaults}</span></div>
    <div class="stat-item">Max WS Size: <span>${result.maxWsSize}</span></div>
    <div class="stat-item">Avg WS Size: <span>${result.avgWsSize.toFixed(2)}</span></div>
  </div>`;
  html += '<h3 style="margin-top:16px">Working Set Trace</h3>';
  html += '<div class="table-scroll"><table><thead><tr><th>t</th><th>Page</th><th>Working Set</th><th>WS Size</th><th>Fault?</th></tr></thead><tbody>';

  for (const s of result.steps) {
    const cls = s.pageFault ? 'fault' : '';
    html += `<tr class="${cls}">
      <td>${s.timeStep}</td>
      <td><strong>${s.page}</strong></td>
      <td>${s.workingSet.join(', ')}</td>
      <td>${s.wsSize}</td>
      <td>${s.pageFault ? '✗' : '✓'}</td>
    </tr>`;
  }

  html += '</tbody></table></div>';
  el.innerHTML = html;
}

export function renderMLPageTable(containerId, pt, translation) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const overhead = mlOverhead(pt);
  let html = `<div class="stats-row">
    <div class="stat-item">Faults: <span>${pt.faultCount}</span></div>
    <div class="stat-item">L2 Tables Allocated: <span>${Object.keys(pt.l1).length}</span></div>
    <div class="stat-item">Memory Overhead: <span>${overhead} bytes</span></div>
  </div>`;

  if (translation) {
    const cls = translation.fault ? 'error' : 'success';
    html += `<div class="result-block ${cls}" style="margin-top:12px">`;
    if (translation.fault) {
      html += `<strong>Page Fault</strong><p>VA: ${translation.virtualAddress}, L1[${translation.l1Index}] L2[${translation.l2Index}] — not mapped</p>`;
    } else {
      html += `<strong>Translation Successful</strong>
        <p>VA: <strong>${translation.virtualAddress}</strong> → PA: <strong>${translation.physicalAddress}</strong></p>
        <p>L1[${translation.l1Index}] → L2[${translation.l2Index}] Offset: ${translation.offset}</p>`;
    }
    html += '</div>';
  }

  /* Show mapped entries */
  html += '<h3 style="margin-top:16px">Mapped Pages</h3>';
  html += '<div class="table-scroll"><table><thead><tr><th>L1 Index</th><th>L2 Index</th><th>Frame</th><th>Physical Base</th></tr></thead><tbody>';

  let count = 0;
  for (const l1k of Object.keys(pt.l1)) {
    const l1e = pt.l1[l1k];
    for (const l2k of Object.keys(l1e.table)) {
      const l2e = l1e.table[l2k];
      if (l2e.valid) {
        const physBase = (l2e.frameNumber << 12);
        html += `<tr><td>${l1k}</td><td>${l2k}</td><td>${l2e.frameNumber}</td><td>${physBase}</td></tr>`;
        count++;
      }
    }
  }
  if (count === 0) html += '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">No pages mapped yet</td></tr>';
  html += '</tbody></table></div>';
  el.innerHTML = html;
}

export function renderIPT(containerId, ipt, translation) {
  const el = document.getElementById(containerId);
  if (!el || !ipt) return;

  let html = `<div class="stats-row">
    <div class="stat-item">Frame Count: <span>${ipt.frameCount}</span></div>
    <div class="stat-item">Used Frames: <span>${ipt.table.filter(e => e.valid).length}</span></div>
  </div>`;

  if (translation) {
    const cls = translation.fault ? 'error' : 'success';
    html += `<div class="result-block ${cls}" style="margin-top:12px">`;
    if (translation.fault) {
      html += `<strong>Page Fault</strong><p>PID ${translation.pid}, Page ${translation.pageNumber} not in memory (searched ${translation.searchSteps} entries)</p>`;
    } else {
      html += `<strong>Translation Successful</strong>
        <p>PID ${translation.pid}, Page ${translation.pageNumber} → Frame ${translation.frameNumber} → PA: <strong>${translation.physicalAddress}</strong></p>
        <p>Search steps: ${translation.searchSteps}</p>`;
    }
    html += '</div>';
  }

  html += '<h3 style="margin-top:16px">Inverted Page Table</h3>';
  html += '<div class="table-scroll"><table><thead><tr><th>Frame</th><th>PID</th><th>Page</th><th>Valid</th></tr></thead><tbody>';
  for (let i = 0; i < ipt.frameCount; i++) {
    const e = ipt.table[i];
    html += `<tr>
      <td>${i}</td>
      <td>${e.valid ? e.pid : '—'}</td>
      <td>${e.valid ? e.pageNumber : '—'}</td>
      <td>${e.valid ? '✓' : '✗'}</td>
    </tr>`;
  }
  html += '</tbody></table></div>';
  el.innerHTML = html;
}

export function renderThrashing(containerId, result) {
  const el = document.getElementById(containerId);
  if (!el || !result) return;

  const onsetMsg = result.thrashingOnsetStep !== -1
    ? `Thrashing onset at process #${result.thrashingOnsetStep}`
    : 'No thrashing detected';

  let html = `<div class="stats-row">
    <div class="stat-item">Steps: <span>${result.stepCount}</span></div>
    <div class="stat-item">Peak Fault Rate: <span>${result.peakFaultRate}</span></div>
    <div class="stat-item">Onset: <span>${onsetMsg}</span></div>
  </div>`;

  html += '<h3 style="margin-top:16px">CPU Utilisation by Process Count</h3>';
  html += '<div class="table-scroll"><table><thead><tr><th>Processes</th><th>CPU Util %</th><th>Page Faults</th><th>Thrashing?</th></tr></thead><tbody>';

  for (const s of result.steps) {
    const cls = s.thrashing ? 'fault' : '';
    html += `<tr class="${cls}">
      <td>${s.activeProcesses}</td>
      <td>${s.cpuUtilization}%</td>
      <td>${s.totalPageFaults}</td>
      <td>${s.thrashing ? '⚠ Yes' : 'No'}</td>
    </tr>`;
  }

  html += '</tbody></table></div>';
  el.innerHTML = html;
}

function mlOverhead(pt) {
  const L1_SIZE = 1024, L2_SIZE = 1024;
  const entrySize = 8;
  let overhead = L1_SIZE * entrySize;
  for (const k of Object.keys(pt.l1)) {
    if (pt.l1[k].present) overhead += L2_SIZE * entrySize;
  }
  return overhead;
}
