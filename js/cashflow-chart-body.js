class CashflowChartBody {
  constructor({ el, isWaterfallChart, dispatch }) {
    this.el = el;
    this.isWaterfallChart = isWaterfallChart;
    this.dispatch = dispatch;
    this.init();
  }

  init() {
    this.svg = d3.select(this.el);
    this.gBackgrounds = this.svg.append("g").attr("class", "chart-backgrounds");
    this.gItems = this.svg.append("g").attr("class", "chart-items");
    this.gWaterfall = this.svg
      .append("g")
      .attr("class", "chart-waterfall")
      .attr(
        "transform",
        `translate(${DIMS.ITEM_NAME_WIDTH + DIMS.ITEM_NAME_PADDING},0)`
      );
    this.gLine = this.svg
      .append("g")
      .attr("class", "chart-line")
      .attr(
        "transform",
        `translate(${DIMS.ITEM_NAME_WIDTH + DIMS.ITEM_NAME_PADDING},0)`
      );
    this.gValues = this.svg.append("g").attr("class", "chart-values");

    this.cashflowItems = new CashFlowItems({
      el: this.gItems.node(),
      dispatch: this.dispatch,
    });
    this.waterfallChart = new CashflowWaterfall({
      el: this.gWaterfall.node(),
    });
    this.chart = this.isWaterfallChart ? this.waterfallChart : "";
    this.cashflowValues = new CashflowValues({
      el: this.gValues.node(),
    });
  }

  wrangleData() {
    this.width =
      DIMS.ITEM_NAME_WIDTH +
      DIMS.ITEM_NAME_PADDING +
      (this.isWaterfallChart
        ? DIMS.WATERFALL_CHART_WIDTH
        : DIMS.LINE_CHART_WIDTH) +
      DIMS.CHART_PADDING +
      DIMS.CURRENT_VALUE_WIDTH +
      DIMS.CURRENT_VALUE_PADDING;
    this.height =
      DIMS.ROW_HEIGHT * (this.data.length - 1) +
      DIMS.NET_ROW_HEIGHT +
      (this.isWaterfallChart ? DIMS.NET_ROW_WATERFALL_EXTRA_HEIGHT : 0);
    if (!this.svg.attr("height"))
      this.svg.attr("width", this.width).attr("height", this.height);
  }

  render() {
    const t = this.svg.transition();

    this.svg
      .attr("width", this.width)
      .transition(t)
      .attr("height", this.height);

    this.gBackgrounds
      .selectAll(".background-rect")
      .data(this.data, (d) => d.name)
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("class", "background-rect")
            .classed("is-sub-category", (d) => d.level > 0)
            .attr("x", -50) // 50 is the left margin
            .attr("transform", (d, i) => `translate(0,${i * DIMS.ROW_HEIGHT})`),
        (update) => update,
        (exit) =>
          exit.call((exit) => exit.transition(t).attr("fill-opacity", 0))
      )
      .attr("width", this.width + 50)
      .attr("height", (d) =>
        d.type === "end"
          ? DIMS.NET_ROW_HEIGHT +
            (this.isWaterfallChart ? DIMS.NET_ROW_WATERFALL_EXTRA_HEIGHT : 0)
          : DIMS.ROW_HEIGHT
      )
      .transition(t)
      .attr("transform", (d, i) => `translate(0,${i * DIMS.ROW_HEIGHT})`)
      .attr("fill-opacity", 1);

    this.gValues.attr(
      "transform",
      `translate(${this.width - DIMS.CURRENT_VALUE_PADDING},0)`
    );
  }

  updateChartType(isWaterfallChart) {
    this.isWaterfallChart = isWaterfallChart;
    this.wrangleData();
    this.render();
  }

  updateData(data) {
    this.data = data;
    this.wrangleData();
    this.render();
    this.cashflowItems.updateData(this.data);
    this.cashflowValues.updateData(this.data);
    this.chart.updateData(this.data);
  }
}
