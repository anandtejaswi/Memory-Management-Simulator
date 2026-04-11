/*
 * tlb.js
 * Re-exports TLB functions from page_table.js for clean import paths.
 * JS port of c/algorithms/paging/tlb.c
 */

export { tlbInit, tlbLookup, tlbInsert, tlbFlush, tlbHitRatio } from './page_table.js';
