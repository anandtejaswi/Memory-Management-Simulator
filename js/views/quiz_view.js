/*
 * quiz_view.js
 * Procedural quiz engine: generates questions by running simulations,
 * checks answers, and tracks scores. No algorithm logic — calls
 * imported algorithm functions to generate scenarios.
 */

import { fifoSimulate } from '../algorithms/page_replacement/fifo.js';
import { lruSimulate }  from '../algorithms/page_replacement/lru.js';
import { optimalSimulate } from '../algorithms/page_replacement/optimal.js';
import { makeMemoryMap }   from '../algorithms/allocation/first_fit.js';
import { firstFitAllocate, firstFitStats } from '../algorithms/allocation/first_fit.js';
import { bestFitAllocate }  from '../algorithms/allocation/best_fit.js';
import { worstFitAllocate } from '../algorithms/allocation/worst_fit.js';

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function randomRefString(len, maxPage) {
  const arr = [];
  for (let i = 0; i < len; i++) arr.push(randInt(0, maxPage));
  return arr;
}

function pageReplacementQuestion(difficulty) {
  const algos = [
    { name: 'FIFO', fn: fifoSimulate },
    { name: 'LRU',  fn: lruSimulate },
    { name: 'Optimal', fn: optimalSimulate }
  ];
  const algo = algos[randInt(0, algos.length - 1)];
  const frames = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 3;
  const refLen = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 16;
  const maxPage = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 9;
  const refString = randomRefString(refLen, maxPage);

  const result = algo.fn({ frames, refString });

  let questionIdx;
  if (difficulty === 'easy') {
    questionIdx = result.steps.length - 1;
  } else if (difficulty === 'medium') {
    questionIdx = Math.floor(result.steps.length / 2);
  } else {
    questionIdx = randInt(Math.floor(result.steps.length * 0.4), result.steps.length - 1);
  }

  const stepData = result.steps[questionIdx];
  const framesAtStep = stepData.framesSnapshot.filter(v => v !== -1).sort((a, b) => a - b);
  const correctAnswer = framesAtStep.join(' ');

  const scenario = `Reference String: ${refString.join(' ')}\nFrames: ${frames}  |  Algorithm: ${algo.name}`;
  const refSlice = refString.slice(0, questionIdx + 1);
  const prompt = `After processing the first ${refSlice.length} references (${refSlice.join(' ')}), what pages are currently in the frames? (space-separated, sorted)`;

  const hint = `Run the ${algo.name} algorithm step by step. At step ${questionIdx + 1}, page ${stepData.page} was ${stepData.pageFault ? 'a fault' : 'a hit'}.`;

  const explanation = `After ${questionIdx + 1} steps, the frames contain: ${correctAnswer}. Total faults so far: ${result.steps.slice(0, questionIdx + 1).filter(s => s.pageFault).length}.`;

  return { scenario, prompt, correctAnswer, hint, explanation, topic: 'page_replacement' };
}

function allocationQuestion(difficulty) {
  const totalMem = difficulty === 'easy' ? 512 : difficulty === 'medium' ? 1024 : 2048;
  const numProcs = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
  const procSizes = [];
  for (let i = 0; i < numProcs; i++) procSizes.push(randInt(50, Math.floor(totalMem / numProcs)));

  /* Use best fit for simulation */
  const map = makeMemoryMap(totalMem);
  const pids = [];
  for (let i = 0; i < numProcs; i++) {
    const base = bestFitAllocate(map, i + 1, procSizes[i]);
    pids.push(base !== -1 ? i + 1 : null);
  }

  /* Free 2 processes */
  const toFree = [pids[1], pids[numProcs - 1]].filter(p => p !== null);
  for (const pid of toFree) {
    for (let i = 0; i < map.blocks.length; i++) {
      if (!map.blocks[i].isFree && map.blocks[i].processId === pid) {
        map.blocks[i].isFree = true; map.blocks[i].processId = -1;
      }
    }
  }

  const testSize = randInt(80, 200);
  const testBase = firstFitAllocate(map, 99, testSize);
  const stats = firstFitStats(map);

  const canAllocate = testBase !== -1;
  const correctAnswer = canAllocate ? 'yes' : 'no';

  const scenario = `Memory: ${totalMem} KB, ${numProcs} processes:\n${procSizes.map((s, i) => `P${i + 1}=${s}KB`).join(', ')}\n\nP${toFree[0]} and P${toFree[toFree.length - 1]} are freed. Using First Fit:`;
  const prompt = `Can a process of ${testSize} KB be allocated? (yes/no)`;
  const hint = `After freeing those processes, check if any contiguous free block is >= ${testSize} KB.`;
  const explanation = `${canAllocate ? `Yes, a block of ${testSize}KB fits (allocated at base ${testBase}).` : `No, no single free block is large enough for ${testSize}KB (external fragmentation: ${stats.externalFragmentation}KB).`}`;

  return { scenario, prompt, correctAnswer, hint, explanation, topic: 'allocation' };
}

function segmentationQuestion(difficulty) {
  const base = randInt(100, 5000);
  const limit = randInt(200, 1000);
  const offset = difficulty === 'easy' ? randInt(0, limit - 1) : randInt(0, limit + 100);
  const correctAnswer = offset < limit ? String(base + offset) : 'fault';
  const scenario = `Segment 0: base=${base}, limit=${limit}\nTranslate: segment=0, offset=${offset}`;
  const prompt = `What is the physical address? (or "fault" if segmentation fault)`;
  const hint = `Physical = base + offset if offset < limit, else fault.`;
  const explanation = offset < limit
    ? `${base} + ${offset} = ${base + offset}`
    : `Offset ${offset} >= limit ${limit} → Segmentation fault`;
  return { scenario, prompt, correctAnswer, hint, explanation, topic: 'segmentation' };
}

function virtualQuestion(difficulty) {
  const pageSize = 4096;
  const va = randInt(0, 0xFFFFF);
  const pageNum = Math.floor(va / pageSize);
  const offset = va % pageSize;
  const frame = randInt(0, 63);
  const pa = frame * pageSize + offset;
  const scenario = `Page size: ${pageSize} bytes\nVirtual address: ${va}\nPage ${pageNum} → Frame ${frame}`;
  const prompt = `What is the physical address?`;
  const correctAnswer = String(pa);
  const hint = `Physical = frame * page_size + offset = ${frame} * ${pageSize} + ${offset}`;
  const explanation = `VA ${va}: page=${pageNum}, offset=${offset}. Frame ${frame} → PA = ${frame}×${pageSize}+${offset} = ${pa}`;
  return { scenario, prompt, correctAnswer, hint, explanation, topic: 'virtual' };
}

function generateQuestion(topic, difficulty) {
  switch (topic) {
    case 'page_replacement': return pageReplacementQuestion(difficulty);
    case 'allocation':       return allocationQuestion(difficulty);
    case 'segmentation':     return segmentationQuestion(difficulty);
    case 'virtual':          return virtualQuestion(difficulty);
    default:                 return pageReplacementQuestion(difficulty);
  }
}

function normalise(str) {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

function checkAnswer(userAnswer, correctAnswer, topic) {
  const ua = normalise(userAnswer);
  const ca = normalise(String(correctAnswer));

  /* For page sets: order-insensitive comparison */
  if (topic === 'page_replacement') {
    const uSet = ua.split(' ').filter(Boolean).map(Number).sort((a, b) => a - b).join(' ');
    const cSet = ca.split(' ').filter(Boolean).map(Number).sort((a, b) => a - b).join(' ');
    return uSet === cSet;
  }

  return ua === ca;
}

/* ===== DOM Rendering ===== */
let currentQuestion = null;

export function initQuiz(session) {
  const startBtn = document.getElementById('btn-quiz-start');
  const submitBtn = document.getElementById('btn-quiz-submit');
  const hintBtn   = document.getElementById('btn-quiz-hint');
  const nextBtn   = document.getElementById('btn-quiz-next');

  if (!startBtn) return;

  startBtn.addEventListener('click', () => {
    const topic = document.getElementById('quiz-topic').value;
    const difficulty = document.getElementById('quiz-difficulty').value;
    currentQuestion = generateQuestion(topic, difficulty);
    renderQuestion(currentQuestion);
  });

  submitBtn.addEventListener('click', () => {
    if (!currentQuestion) return;
    const userAnswer = document.getElementById('quiz-answer').value;
    if (!userAnswer.trim()) {
      renderFeedback('Please enter an answer.', false);
      return;
    }
    const correct = checkAnswer(userAnswer, currentQuestion.correctAnswer, currentQuestion.topic);
    session.total++;
    if (correct) session.correct++;
    renderFeedback(correct ? `Correct! ${currentQuestion.explanation}` : `Incorrect. ${currentQuestion.explanation}`, correct);
    document.getElementById('btn-quiz-next').style.display = 'inline-block';
    submitBtn.disabled = true;
    renderScore(session);
  });

  hintBtn.addEventListener('click', () => {
    if (currentQuestion) renderFeedback(`Hint: ${currentQuestion.hint}`, null);
  });

  nextBtn.addEventListener('click', () => {
    const topic = document.getElementById('quiz-topic').value;
    const difficulty = document.getElementById('quiz-difficulty').value;
    currentQuestion = generateQuestion(topic, difficulty);
    renderQuestion(currentQuestion);
    document.getElementById('btn-quiz-next').style.display = 'none';
    document.getElementById('btn-quiz-submit').disabled = false;
    document.getElementById('quiz-feedback').innerHTML = '';
  });
}

function renderQuestion(q) {
  document.getElementById('quiz-setup').style.display = 'none';
  document.getElementById('quiz-question').style.display = 'block';
  document.getElementById('quiz-scenario').textContent = q.scenario;
  document.getElementById('quiz-prompt').textContent = q.prompt;
  document.getElementById('quiz-answer').value = '';
  document.getElementById('quiz-feedback').innerHTML = '';
  document.getElementById('quiz-answer').focus();
}

function renderFeedback(msg, correct) {
  const el = document.getElementById('quiz-feedback');
  if (!el) return;
  if (correct === null) {
    el.innerHTML = `<div class="result-block">${msg}</div>`;
  } else if (correct) {
    el.innerHTML = `<div class="result-block success"><strong>✓ Correct!</strong> ${msg}</div>`;
  } else {
    el.innerHTML = `<div class="result-block error"><strong>✗ Incorrect.</strong> ${msg}</div>`;
  }
}

function renderScore(session) {
  const el = document.getElementById('quiz-score');
  if (!el) return;
  const pct = session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0;
  el.innerHTML = `Score: ${session.correct} / ${session.total} (${pct}%)`;
}
