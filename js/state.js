/*
 * state.js
 * Global application state store. Single source of truth for all
 * simulation data across modules. No logic — pure data.
 */

export const state = {
  // Allocation
  memoryMap: null,
  processTable: { list: [], count: 0, nextPid: 1 },
  allocationHistory: [],   // [{ action, algorithm, stats }]

  // Paging
  pageTable: null,
  tlb: null,
  translationHistory: [],  // [AddressTranslation]

  // Page replacement
  prHistory: [],           // [PRResult]

  // Segmentation
  segmentTable: null,
  segTranslationHistory: [],

  // Virtual memory
  wsResult: null,
  mlPageTable: null,
  invertedPageTable: null,
  thrashingResult: null,

  // Analytics
  utilizationTimeline: [],      // [{ t, value }]
  fragmentationTimeline: [],
  tlbRatioTimeline: [],
  accessFrequency: {},           // { pageNumber: count }

  // Quiz
  quizSession: { correct: 0, total: 0, questions: [] }
};
