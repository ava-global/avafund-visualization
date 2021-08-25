Promise.all([
  d3.json("data/waterfall_-_year.json"),
  d3.json("data/waterfall_-_quarter.json"),
]).then(([annualData, quarterData]) => {
  let isAnnualData = document.querySelector("#data-type").checked;
  let isWaterfallChart = document.querySelector("#chart-type").checked;
  let isLegendVisible = document.querySelector("#legend-visibility").checked;
  let isGrowthVisible = document.querySelector("#growth-visibility").checked;

  const cashflowGrid = new CashflowGrid({
    el: document.querySelector("#cashflow-grid"),
    annualData,
    quarterData,
    isAnnualData,
    isWaterfallChart,
    isLegendVisible,
    isGrowthVisible,
  });

  // Set up toolbars
  document.querySelector("#data-type").addEventListener("change", function () {
    isAnnualData = this.checked;
    cashflowGrid.updateDataType(isAnnualData);
  });
  document.querySelector("#chart-type").addEventListener("change", function () {
    isWaterfallChart = this.checked;
    cashflowGrid.updateChartType(isWaterfallChart);
    // If line chart, hide legend and disable the toggle
    if (!isWaterfallChart) {
      if (isLegendVisible) {
        isLegendVisible = false;
        cashflowGrid.updateLegendVisibility(isLegendVisible);
      }
      document.querySelector("#legend-visibility").disabled = true;
    } else {
      document.querySelector("#legend-visibility").disabled = false;
    }
  });
  document
    .querySelector("#legend-visibility")
    .addEventListener("change", function () {
      isLegendVisible = this.checked;
      cashflowGrid.updateLegendVisibility(isLegendVisible);
    });
  document.querySelector("#legend-visibility").disabled = !isWaterfallChart;
  // Keep the legend visibility checkbox in sync when the hide legend is triggered by clicking the close button of the legend
  document
    .querySelector("#cashflow-grid")
    .addEventListener("legendhide", () => {
      document.querySelector("#legend-visibility").checked = false;
    });
  document
    .querySelector("#growth-visibility")
    .addEventListener("change", function () {
      isGrowthVisible = this.checked;
      cashflowGrid.updateGrowthVisibility(isGrowthVisible);
    });
});
