class CashflowTimesBody {
  constructor({ el, isAnnualData, isWaterfallChart, isGrowthVisible }) {
    this.el = el;
    this.isAnnualData = isAnnualData;
    this.isWaterfallChart = isWaterfallChart;
    this.isGrowthVisible = isGrowthVisible;
    this.init();
  }

  init() {
    this.y = (d, i) =>
      i * DIMS.ROW_HEIGHT +
      (d.type === "end" ? DIMS.NET_ROW_HEIGHT / 2 : DIMS.ROW_HEIGHT / 2);

    this.svg = d3.select(this.el);
  }

  wrangleData() {
    this.step = this.isGrowthVisible
      ? DIMS.TIME_PADDING +
        DIMS.TIME_WIDTH +
        DIMS.GROWTH_PADDING +
        DIMS.GROWTH_WIDTH
      : DIMS.TIME_PADDING + DIMS.TIME_WIDTH;
    this.offset = this.isGrowthVisible
      ? DIMS.GROWTH_PADDING + DIMS.GROWTH_WIDTH
      : 0;
    this.width = this.step * this.data.length;
    this.height =
      DIMS.ROW_HEIGHT * (this.data[0].visibleItems.length - 1) +
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

    const gTime = this.svg
      .selectAll(".time-body")
      .data(this.data)
      .join((enter) =>
        enter
          .append("g")
          .attr("class", "time-body")
          .call((g) => g.append("g").attr("class", "value-texts"))
          .call((g) => g.append("g").attr("class", "growth-texts"))
      )
      .classed("is-active", (d) => d.time === this.time)
      .attr(
        "transform",
        (d, i) => `translate(${(i + 1) * this.step - 0.5 - this.offset},0)`
      );

    gTime
      .selectAll(".value-text")
      .data(
        (d) => d.visibleItems,
        (d) => d.name
      )
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("class", "value-text")
            .attr("text-anchor", "end")
            .attr("dy", "0.32em")
            .attr("fill-opacity", 0)
            .attr("transform", (d, i) => `translate(0,${this.y(d, i)})`),
        (update) => update,
        (exit) =>
          exit.call((exit) =>
            exit.transition(t).attr("fill-opacity", 0).remove()
          )
      )
      .classed("is-net-income", (d) => d.type === "end")
      .text((d) => FORMAT.VALUE(d.value))
      .transition(t)
      .attr("fill-opacity", 1)
      .attr("transform", (d, i) => `translate(0,${this.y(d, i)})`);

    gTime
      .selectAll(".growth-text")
      .data(
        (d) => (this.isGrowthVisible ? d.visibleItems : []),
        (d) => d.name
      )
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("class", "growth-text")
            .attr("dy", "0.32em")
            .attr("x", DIMS.GROWTH_PADDING)
            .attr("fill-opacity", 0)
            .attr("transform", (d, i) => `translate(0,${this.y(d, i)})`),
        (update) => update,
        (exit) =>
          exit.call((exit) =>
            exit.transition(t).attr("fill-opacity", 0).remove()
          )
      )
      .classed("is-positive", (d) => d.growth > 0)
      .classed("is-negative", (d) => d.growth < 0)
      .text((d) => FORMAT.GROWTH(d.growth))
      .transition(t)
      .attr("fill-opacity", 1)
      .attr("transform", (d, i) => `translate(0,${this.y(d, i)})`);
  }

  updateTime(time) {
    this.time = time;
    this.render();
  }

  updateDataType(isAnnualData) {
    this.isAnnualData = isAnnualData;
  }

  updateChartType(isWaterfallChart) {
    this.isWaterfallChart = isWaterfallChart;
    this.wrangleData();
    this.render();
  }

  updateGrowthVisibility(isGrowthVisible) {
    this.isGrowthVisible = isGrowthVisible;
    this.wrangleData();
    this.render();
  }

  updateData(data) {
    this.data = data;
    this.wrangleData();
    this.render();
  }
}
