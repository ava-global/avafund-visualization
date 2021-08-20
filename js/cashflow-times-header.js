class CashflowTimesHeader {
  constructor({ el, isGrowthVisible, isAnnualData, dispatch }) {
    this.el = el;
    this.isGrowthVisible = isGrowthVisible;
    this.isAnnualData = isAnnualData;
    this.dispatch = dispatch;
    this.init();
  }

  init() {
    this.height = this.el.clientHeight;
    this.svg = d3.select(this.el).attr("height", this.height);
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
    this.boxWidth = this.isAnnualData
      ? DIMS.TIME_BOX_ANNUAL_WIDTH
      : DIMS.TIME_BOX_QUARTER_WIDTH;
    this.svg.attr("width", this.width);
  }

  render() {
    this.svg
      .selectAll(".time-box")
      .data(this.data, (d) => d)
      .join((g) =>
        g
          .append("g")
          .attr("class", "time-box")
          .call((g) =>
            g
              .append("rect")
              .attr("class", "time-box__rect")
              .attr("y", -DIMS.TIME_BOX_HEIGHT / 2)
              .attr("height", DIMS.TIME_BOX_HEIGHT)
              .attr("rx", DIMS.TIME_BOX_CORNER_RADIUS)
          )
          .call((g) =>
            g
              .append("text")
              .attr("class", "time-box__text")
              .attr("text-anchor", "end")
              .attr("dx", -DIMS.TIME_BOX_CORNER_RADIUS)
              .attr("dy", "0.32em")
              .text((d) => d)
          )
          .on("click", (event, d) => {
            this.dispatch.call("timechange", null, d);
          })
      )
      .classed("is-active", (d) => d === this.time)
      .attr(
        "transform",
        (d, i) =>
          `translate(${(i + 1) * this.step - 0.5 - this.offset},${
            DIMS.TIME_Y_CENTER
          })`
      )
      .call((g) =>
        g
          .select(".time-box__rect")
          .attr("x", -this.boxWidth)
          .attr("width", this.boxWidth)
      );
  }

  updateTime(time) {
    this.time = time;
    this.render();
  }

  updateDataType(isAnnualData) {
    this.isAnnualData = isAnnualData;
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
