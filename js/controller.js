/*
 * controller.js
 * Controller layer — all event listeners and orchestration.
 * Reads input, validates, calls algorithm, passes to view, updates state.
 */

import { fifoSimulate, fifoCheckBeladys } from './algorithms/page_replacement/fifo.js';
import { lruSimulate }     from './algorithms/page_replacement/lru.js';
import { lfuSimulate }     from './algorithms/page_replacement/lfu.js';
import { optimalSimulate } from './algorithms/page_replacement/optimal.js';
import { clockSimulate }   from './algorithms/page_replacement/clock.js';

import { makeMemoryMap, firstFitAllocate, firstFitFree, firstFitStats } from './algorithms/allocation/first_fit.js';
import { bestFitAllocate,  bestFitFree,  bestFitStats  } from './algorithms/allocation/best_fit.js';
import { worstFitAllocate, worstFitFree, worstFitStats } from './algorithms/allocation/worst_fit.js';
import { nextFitAllocate,  nextFitFree,  nextFitStats  } from './algorithms/allocation/next_fit.js';

import { pageTableInit, translateAddress, loadPage, tlbInit, tlbFlush, tlbHitRatio } from './algorithms/paging/page_table.js';
import { segmentationInit, segmentationAddSegment, segmentationTranslate } from './algorithms/segmentation/segmentation.js';
import { workingSetSimulate } from './algorithms/virtual_memory/working_set.js';
import { mlPtInit, mlPtMap, mlPtTranslate } from './algorithms/virtual_memory/multi_level_page_table.js';
import { iptInit, iptLoad, iptTranslate }   from './algorithms/virtual_memory/inverted_page_table.js';
import { thrashingSimulate } from './algorithms/virtual_memory/thrashing.js';

import * as MemMapView  from './views/memory_map_view.js';
import * as PRView      from './views/page_replacement_view.js';
import * as PagingView  from './views/paging_view.js';
import * as SegView     from './views/segmentation_view.js';
import * as VMView      from './views/virtual_memory_view.js';
import * as Analytics   from './views/analytics_view.js';

import { state }        from './state.js';

/* ===== Helpers ===== */
function showError(containerId, msg) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="result-block error"><strong>Error:</strong> ${msg}</div>`;
}

function getInt(id, label, min) {
  const v = parseInt(document.getElementById(id).value, 10);
  if (isNaN(v) || (min !== undefined && v < min)) throw new Error(`${label} must be ≥ ${min}.`);
  return v;
}

function parseRefString(id, label) {
  const raw = document.getElementById(id).value.trim();
  if (!raw) throw new Error(`${label} cannot be empty.`);
  const arr = raw.split(/\s+/).map(Number);
  if (arr.some(isNaN)) throw new Error(`${label} must contain only integers.`);
  return arr;
}

function getAllocFn(algo) {
  switch (algo) {
    case 'best_fit':  return { alloc: bestFitAllocate,  free: bestFitFree,  stats: bestFitStats };
    case 'worst_fit': return { alloc: worstFitAllocate, free: worstFitFree, stats: worstFitStats };
    case 'next_fit':  return { alloc: nextFitAllocate,  free: nextFitFree,  stats: nextFitStats };
    default:          return { alloc: firstFitAllocate, free: firstFitFree, stats: firstFitStats };
  }
}

function getPRFn(algo) {
  switch (algo) {
    case 'lru':     return lruSimulate;
    case 'lfu':     return lfuSimulate;
    case 'optimal': return optimalSimulate;
    case 'clock':   return clockSimulate;
    default:        return fifoSimulate;
  }
}

/* ===== Tab Navigation ===== */
function initTabNav() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const section = document.getElementById(`tab-${target}`);
      if (section) section.classList.add('active');

      if (target === 'analytics') {
        Analytics.renderAllCharts(state);
      }
    });
  });
}

/* ===== Allocation Module ===== */
function initAllocationModule() {
  state.memoryMap = makeMemoryMap(1024);
  state.processTable = { list: [], count: 0, nextPid: 1 };
  renderAlloc();

  document.getElementById('btn-alloc-add').addEventListener('click', () => {
    try {
      const algo   = document.getElementById('alloc-algo').value;
      const total  = getInt('alloc-mem-size', 'Memory size', 64);
      const size   = getInt('alloc-proc-size', 'Process size', 1);
      const algoFn = getAllocFn(algo);

      if (!state.memoryMap || state.memoryMap.totalSize !== total) {
        state.memoryMap = makeMemoryMap(total);
        state.processTable = { list: [], count: 0, nextPid: 1 };
      }

      const pid = state.processTable.nextPid;
      const base = algoFn.alloc(state.memoryMap, pid, size);

      if (base === -1) {
        showError('alloc-stats-table', `Cannot allocate ${size} KB — insufficient contiguous memory.`);
        return;
      }

      state.processTable.list.push({ pid, size, allocatedSize: size, baseAddress: base, isActive: true });
      state.processTable.nextPid++;
      state.processTable.count++;

      const stats = algoFn.stats(state.memoryMap);
      state.allocationHistory.push({ action: 'allocate', algorithm: algo, timestamp: Date.now(), stats });
      state.utilizationTimeline.push({ t: state.utilizationTimeline.length, value: (stats.usedSize / stats.totalSize) * 100 });
      state.fragmentationTimeline.push({ t: state.fragmentationTimeline.length, value: stats.externalFragmentation });

      renderAlloc(algoFn.stats);
    } catch (e) {
      showError('alloc-stats-table', e.message);
    }
  });

  document.getElementById('btn-alloc-free').addEventListener('click', () => {
    try {
      const algo = document.getElementById('alloc-algo').value;
      const pid  = getInt('alloc-free-pid', 'PID', 1);
      const algoFn = getAllocFn(algo);

      const proc = state.processTable.list.find(p => p.pid === pid && p.isActive);
      if (!proc) { showError('alloc-stats-table', `PID ${pid} not found or already freed.`); return; }

      algoFn.free(state.memoryMap, pid);
      proc.isActive = false;

      const stats = algoFn.stats(state.memoryMap);
      state.allocationHistory.push({ action: 'free', algorithm: algo, timestamp: Date.now(), stats });
      state.utilizationTimeline.push({ t: state.utilizationTimeline.length, value: (stats.usedSize / stats.totalSize) * 100 });
      state.fragmentationTimeline.push({ t: state.fragmentationTimeline.length, value: stats.externalFragmentation });

      renderAlloc(algoFn.stats);
    } catch (e) {
      showError('alloc-stats-table', e.message);
    }
  });

  document.getElementById('btn-alloc-compact').addEventListener('click', () => {
    if (!state.memoryMap) return;
    /* Compaction: collect all allocated blocks, rebuild map */
    const total = state.memoryMap.totalSize;
    const allocated = state.memoryMap.blocks.filter(b => !b.isFree);
    const newMap = makeMemoryMap(total);

    let offset = 0;
    const newBlocks = [];
    for (const b of allocated) {
      newBlocks.push({ id: newBlocks.length, base: offset, size: b.size, isFree: false, processId: b.processId });
      offset += b.size;
    }
    if (offset < total) newBlocks.push({ id: newBlocks.length, base: offset, size: total - offset, isFree: true, processId: -1 });
    newMap.blocks = newBlocks;
    state.memoryMap = newMap;

    /* Update process table base addresses */
    for (const p of state.processTable.list) {
      if (p.isActive) {
        const blk = newMap.blocks.find(b => !b.isFree && b.processId === p.pid);
        if (blk) p.baseAddress = blk.base;
      }
    }

    renderAlloc(firstFitStats);
  });

  document.getElementById('btn-alloc-reset').addEventListener('click', () => {
    const total = parseInt(document.getElementById('alloc-mem-size').value, 10) || 1024;
    state.memoryMap = makeMemoryMap(total);
    state.processTable = { list: [], count: 0, nextPid: 1 };
    document.getElementById('alloc-memory-map').innerHTML = '';
    document.getElementById('alloc-stats-table').innerHTML = '';
    document.getElementById('alloc-comparison-table').innerHTML = '';
    renderAlloc();
  });

  document.getElementById('btn-compare-alloc').addEventListener('click', () => {
    try {
      const total    = getInt('alloc-mem-size', 'Memory size', 64);
      const procSize = getInt('alloc-proc-size', 'Process size', 1);
      const numProcs = Math.min(5, Math.floor(total / procSize));

      const results = [
        { name: 'First Fit', fn: { alloc: firstFitAllocate, stats: firstFitStats } },
        { name: 'Best Fit',  fn: { alloc: bestFitAllocate,  stats: bestFitStats  } },
        { name: 'Worst Fit', fn: { alloc: worstFitAllocate, stats: worstFitStats } },
        { name: 'Next Fit',  fn: { alloc: nextFitAllocate,  stats: nextFitStats  } }
      ].map(({ name, fn }) => {
        const m = makeMemoryMap(total);
        for (let i = 1; i <= numProcs; i++) fn.alloc(m, i, procSize);
        return { name, stats: fn.stats(m) };
      });

      MemMapView.renderComparisonTable('alloc-comparison-table', results);
    } catch (e) {
      showError('alloc-comparison-table', e.message);
    }
  });
}

function renderAlloc(statsFn) {
  MemMapView.renderMemoryMap('alloc-memory-map', state.memoryMap);
  const fn = statsFn || firstFitStats;
  if (state.memoryMap) {
    const stats = fn(state.memoryMap);
    MemMapView.renderStatsTable('alloc-stats-table', stats, state.processTable);
  }
}

/* ===== Paging Module ===== */
function initPagingModule() {
  const pageSize = 4096;
  const numPages = 16;
  state.pageTable = pageTableInit(pageSize, numPages);
  state.tlb = tlbInit();

  document.getElementById('btn-translate').addEventListener('click', () => {
    try {
      const pSize  = getInt('page-size', 'Page size', 1);
      const nPages = getInt('page-count', 'Page count', 2);
      const la     = getInt('page-logical-addr', 'Logical address', 0);

      if (!state.pageTable || state.pageTable.pageSize !== pSize || state.pageTable.pageCount !== nPages) {
        state.pageTable = pageTableInit(pSize, nPages);
        state.tlb = tlbInit();
      }

      const tr = translateAddress(state.pageTable, state.tlb, la);
      state.translationHistory.push(tr);

      if (!tr.pageFault) {
        const page = tr.pageNumber;
        state.accessFrequency[page] = (state.accessFrequency[page] || 0) + 1;
      }

      const ratio = tlbHitRatio(state.tlb);
      state.tlbRatioTimeline.push({ t: state.tlbRatioTimeline.length, value: ratio });

      PagingView.renderTranslationResult('paging-translation-result', tr);
      PagingView.renderPageTable('paging-page-table', state.pageTable);
      PagingView.renderTLB('paging-tlb', state.tlb);
    } catch (e) {
      showError('paging-translation-result', e.message);
    }
  });

  document.getElementById('btn-flush-tlb').addEventListener('click', () => {
    if (state.tlb) {
      tlbFlush(state.tlb);
      PagingView.renderTLB('paging-tlb', state.tlb);
    }
  });

  /* Page Replacement */
  document.getElementById('btn-pr-run').addEventListener('click', () => {
    try {
      const algo     = document.getElementById('pr-algo').value;
      const frames   = getInt('pr-frames', 'Frames', 1);
      const refString = parseRefString('pr-ref-string', 'Reference string');

      const fn = getPRFn(algo);
      const result = fn({ frames, refString });
      result.timestamp = Date.now();
      state.prHistory.push(result);

      PRView.renderTraceTable('pr-trace-table', result);
      document.getElementById('pr-comparison-table').innerHTML = '';
      document.getElementById('pr-beladys-result').innerHTML = '';
    } catch (e) {
      showError('pr-trace-table', e.message);
    }
  });

  document.getElementById('btn-pr-compare').addEventListener('click', () => {
    try {
      const frames    = getInt('pr-frames', 'Frames', 1);
      const refString = parseRefString('pr-ref-string', 'Reference string');
      const input = { frames, refString };

      const results = [
        fifoSimulate(input),
        lruSimulate(input),
        lfuSimulate(input),
        optimalSimulate(input),
        clockSimulate(input)
      ];

      PRView.renderComparisonTable('pr-comparison-table', results);
    } catch (e) {
      showError('pr-comparison-table', e.message);
    }
  });

  document.getElementById('btn-pr-beladys').addEventListener('click', () => {
    try {
      const frames    = getInt('pr-frames', 'Frames', 1);
      const refString = parseRefString('pr-ref-string', 'Reference string');
      const min = Math.max(1, frames - 1);
      const max = frames + 3;
      const result = fifoCheckBeladys({ refString }, min, max);
      PRView.renderBeladysResult('pr-beladys-result', result);
    } catch (e) {
      showError('pr-beladys-result', e.message);
    }
  });
}

/* ===== Segmentation Module ===== */
function initSegmentationModule() {
  state.segmentTable = segmentationInit(1);

  document.getElementById('btn-seg-add').addEventListener('click', () => {
    try {
      const pid     = getInt('seg-pid', 'PID', 1);
      const name    = document.getElementById('seg-name').value.trim() || 'seg';
      const base    = getInt('seg-base', 'Base', 0);
      const limit   = getInt('seg-limit', 'Limit', 1);
      const read    = document.getElementById('seg-read').checked;
      const write   = document.getElementById('seg-write').checked;
      const exec    = document.getElementById('seg-exec').checked;

      if (state.segmentTable.processId !== pid) {
        state.segmentTable = segmentationInit(pid);
      }

      segmentationAddSegment(state.segmentTable, base, limit, read, write, exec, name);

      SegView.renderSegmentTable('seg-table', state.segmentTable);
      SegView.renderSegMemoryMap('seg-memory-map', state.segmentTable);
      document.getElementById('seg-translation-result').innerHTML = '';
    } catch (e) {
      showError('seg-table', e.message);
    }
  });

  document.getElementById('btn-seg-translate').addEventListener('click', () => {
    try {
      const segNum = getInt('seg-trans-seg', 'Segment number', 0);
      const offset = getInt('seg-trans-offset', 'Offset', 0);
      const op     = parseInt(document.getElementById('seg-trans-op').value, 10);

      if (!state.segmentTable || state.segmentTable.segments.length === 0) {
        showError('seg-translation-result', 'Add segments first.');
        return;
      }

      const tr = segmentationTranslate(state.segmentTable, segNum, offset, op);
      state.segTranslationHistory.push(tr);
      SegView.renderSegTranslation('seg-translation-result', tr);
    } catch (e) {
      showError('seg-translation-result', e.message);
    }
  });

  document.getElementById('btn-seg-reset').addEventListener('click', () => {
    const pid = parseInt(document.getElementById('seg-pid').value, 10) || 1;
    state.segmentTable = segmentationInit(pid);
    document.getElementById('seg-table').innerHTML = '';
    document.getElementById('seg-translation-result').innerHTML = '';
    document.getElementById('seg-memory-map').innerHTML = '';
  });
}

/* ===== Virtual Memory Module ===== */
function initVirtualMemoryModule() {
  state.mlPageTable = mlPtInit();
  state.invertedPageTable = iptInit(32);

  const submodule = document.getElementById('vm-submodule');
  const panels = ['ws', 'ml', 'ipt', 'thrash'];
  const panelMap = { working_set: 'ws', multilevel: 'ml', inverted: 'ipt', thrashing: 'thrash' };

  function switchSubmodule(val) {
    panels.forEach(p => {
      document.getElementById(`vm-${p}-inputs`).style.display = 'none';
    });
    const target = panelMap[val];
    if (target) document.getElementById(`vm-${target}-inputs`).style.display = 'block';
    document.getElementById('vm-output').innerHTML = '';
  }

  submodule.addEventListener('change', () => switchSubmodule(submodule.value));

  /* Working Set */
  document.getElementById('btn-ws-run').addEventListener('click', () => {
    try {
      const delta     = getInt('ws-window', 'Window size', 1);
      const refString = parseRefString('ws-ref-string', 'Reference string');
      const result    = workingSetSimulate({ windowSize: delta, refString });
      state.wsResult  = result;
      VMView.renderWorkingSet('vm-output', result);
    } catch (e) {
      showError('vm-output', e.message);
    }
  });

  /* Multi-level PT */
  document.getElementById('btn-ml-map').addEventListener('click', () => {
    try {
      const va    = getInt('ml-vaddr', 'Virtual address', 0);
      const frame = getInt('ml-frame', 'Frame', 0);
      mlPtMap(state.mlPageTable, va, frame);
      VMView.renderMLPageTable('vm-output', state.mlPageTable, null);
    } catch (e) {
      showError('vm-output', e.message);
    }
  });

  document.getElementById('btn-ml-translate').addEventListener('click', () => {
    try {
      const va = getInt('ml-vaddr', 'Virtual address', 0);
      const tr = mlPtTranslate(state.mlPageTable, va);
      VMView.renderMLPageTable('vm-output', state.mlPageTable, tr);
    } catch (e) {
      showError('vm-output', e.message);
    }
  });

  /* Inverted PT */
  document.getElementById('btn-ipt-load').addEventListener('click', () => {
    try {
      const pid    = getInt('ipt-pid', 'PID', 1);
      const page   = getInt('ipt-page', 'Page number', 0);
      const frame  = getInt('ipt-frame', 'Frame', 0);
      iptLoad(state.invertedPageTable, frame, pid, page);
      VMView.renderIPT('vm-output', state.invertedPageTable, null);
    } catch (e) {
      showError('vm-output', e.message);
    }
  });

  document.getElementById('btn-ipt-translate').addEventListener('click', () => {
    try {
      const pid    = getInt('ipt-pid', 'PID', 1);
      const page   = getInt('ipt-page', 'Page number', 0);
      const offset = getInt('ipt-offset', 'Offset', 0);
      const tr     = iptTranslate(state.invertedPageTable, pid, page, offset);
      VMView.renderIPT('vm-output', state.invertedPageTable, tr);
    } catch (e) {
      showError('vm-output', e.message);
    }
  });

  /* Thrashing */
  document.getElementById('btn-thrash-run').addEventListener('click', () => {
    try {
      const totalFrames = getInt('thrash-frames', 'Total frames', 4);
      const procCount   = getInt('thrash-procs', 'Process count', 1);
      const wsSize      = getInt('thrash-ws-size', 'WS size', 1);

      const framesPerProcess = [];
      const workingSetSizes  = [];
      const framesEach = Math.floor(totalFrames / procCount);

      for (let i = 0; i < procCount; i++) {
        framesPerProcess.push(framesEach);
        workingSetSizes.push(wsSize + i);
      }

      const result = thrashingSimulate({ processCount: procCount, framesPerProcess, workingSetSizes, totalFrames });
      state.thrashingResult = result;
      VMView.renderThrashing('vm-output', result);
    } catch (e) {
      showError('vm-output', e.message);
    }
  });
}

/* ===== Analytics Module ===== */
function initAnalyticsModule() {
  document.getElementById('btn-export-csv').addEventListener('click', () => Analytics.exportCSV(state));
  document.getElementById('btn-export-pdf').addEventListener('click', () => Analytics.exportPDF());
  document.getElementById('btn-clear-history').addEventListener('click', () => {
    state.allocationHistory = [];
    state.prHistory = [];
    state.translationHistory = [];
    state.utilizationTimeline = [];
    state.fragmentationTimeline = [];
    state.tlbRatioTimeline = [];
    state.accessFrequency = {};
    Analytics.renderAllCharts(state);
  });
}

/* ===== Main init ===== */
export function initController() {
  initTabNav();
  initAllocationModule();
  initPagingModule();
  initSegmentationModule();
  initVirtualMemoryModule();
  initAnalyticsModule();

}
