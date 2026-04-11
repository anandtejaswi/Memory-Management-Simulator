/*
 * charts.js
 * Re-exports analytics chart functions for use in controller.
 */

export {
  updateUtilisationChart,
  updateFaultChart,
  updateFragmentationChart,
  updateTLBChart,
  updateHeatmap,
  renderAllCharts,
  exportCSV,
  exportPDF
} from './views/analytics_view.js';
