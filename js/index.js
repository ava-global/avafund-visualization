Promise.all([
  d3.json("data/waterfall_-_year.json"),
  d3.json("data/waterfall_-_quarter.json"),
]).then(([annualData, quarterData]) => {
  let isAnnualData = true;
  let isWaterfallChart = true;
  let isLegendVisible = false;
  let isGrowthVisible = false;

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
  });
  document
    .querySelector("#legend-visibility")
    .addEventListener("change", function () {
      isLegendVisible = this.checked;
      cashflowGrid.updateLegendVisibility(isLegendVisible);
    });
  document
    .querySelector("#growth-visibility")
    .addEventListener("change", function () {
      isGrowthVisible = this.checked;
      cashflowGrid.updateGrowthVisibility(isGrowthVisible);
    });
});
