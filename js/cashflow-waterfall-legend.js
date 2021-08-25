class CashflowWaterfallLegend {
  constructor({ el, isLegendVisible, dispatch }) {
    this.el = el;
    this.isLegendVisible = isLegendVisible;
    this.dispatch = dispatch;
    this.init();
  }

  init() {
    this.container = d3.select(this.el);
    this.container.select(".btn-close").on("click", () => {
      this.hide();
      this.dispatch.call("legendhide");
    });
    this.svg = this.container
      .select(".waterfall-legend-body-svg")
      .attr("width", 140)
      .attr("height", 100);
    this.render();
    this.updateVisibility(this.isLegendVisible);
  }

  render() {
    const width = 40;
    const xLabel = 56;
    // Income
    this.svg
      .append("g")
      .attr("transform", `translate(0,${DIMS.ROW_HEIGHT * 0.5})`)
      .call((g) =>
        g
          .append("line")
          .attr("class", "waterfall-arrow is-positive")
          .attr("marker-end", "url(#arrow-marker-positive)")
          .attr("x2", width)
          .attr("stroke-width", DIMS.WATERFALL_ARROW_STROKE_WIDTH)
      )
      .call((g) =>
        g
          .append("text")
          .attr("dy", "0.32em")
          .attr("class", "legend-label")
          .attr("x", xLabel)
          .text("income")
      );

    // Expense
    this.svg
      .append("g")
      .attr("transform", `translate(0,${DIMS.ROW_HEIGHT * 1.5})`)
      .call((g) =>
        g
          .append("line")
          .attr("class", "waterfall-arrow is-negative")
          .attr("marker-end", "url(#arrow-marker-negative)")
          .attr("x2", width)
          .attr("stroke-width", DIMS.WATERFALL_ARROW_STROKE_WIDTH)
      )
      .call((g) =>
        g
          .append("text")
          .attr("dy", "0.32em")
          .attr("class", "legend-label")
          .attr("x", xLabel)
          .text("expense")
      );

    // Sum +,-
    this.svg
      .append("g")
      .attr("transform", `translate(0,${DIMS.ROW_HEIGHT * 2.5})`)
      .call((g) =>
        g
          .append("rect")
          .attr("class", "waterfall-rect is-summary")
          .attr("y", -DIMS.WATERFALL_RECT_HEIGHT / 2)
          .attr("height", DIMS.WATERFALL_RECT_HEIGHT)
          .attr("width", width)
      )
      .call((g) =>
        g
          .append("text")
          .attr("dy", "0.32em")
          .attr("class", "legend-label")
          .attr("x", xLabel)
          .text("sum +,−")
      );

    // Net income (profit)
    this.svg
      .append("g")
      .attr(
        "transform",
        `translate(0,${DIMS.ROW_HEIGHT * 3 + DIMS.NET_ROW_HEIGHT * 0.5})`
      )
      .call((g) =>
        g
          .append("rect")
          .attr("class", "waterfall-rect is-net-income is-positive")
          .attr("y", -DIMS.WATERFALL_RECT_HEIGHT / 2)
          .attr("height", DIMS.WATERFALL_RECT_HEIGHT)
          .attr("width", width - 4)
      )
      .call((g) =>
        g
          .append("line")
          .attr("class", "waterfall-link is-net-income is-positive")
          .attr("marker-end", "url(#arrow-marker-positive)")
          .attr("stroke-width", DIMS.WATERFALL_ARROW_STROKE_WIDTH)
          .attr("x1", width - 4)
          .attr("x2", width - 4)
          .attr("y2", 12)
      )
      .call((g) =>
        g
          .append("text")
          .attr("dy", "0.32em")
          .attr("class", "legend-label")
          .attr("x", xLabel)
          .text("net income (profit)")
      );

    // Nex income (loss)
    this.svg
      .append("g")
      .attr(
        "transform",
        `translate(0,${DIMS.ROW_HEIGHT * 3 + DIMS.NET_ROW_HEIGHT * 1.5})`
      )
      .call((g) =>
        g
          .append("rect")
          .attr("class", "waterfall-rect is-net-income is-negative")
          .attr("y", -DIMS.WATERFALL_RECT_HEIGHT / 2)
          .attr("height", DIMS.WATERFALL_RECT_HEIGHT)
          .attr("x", 4)
          .attr("width", width - 4)
      )
      .call((g) =>
        g
          .append("line")
          .attr("class", "waterfall-link is-net-income is-negative")
          .attr("marker-end", "url(#arrow-marker-negative)")
          .attr("stroke-width", DIMS.WATERFALL_ARROW_STROKE_WIDTH)
          .attr("x1", 4)
          .attr("x2", 4)
          .attr("y2", 12)
      )
      .call((g) =>
        g
          .append("text")
          .attr("dy", "0.32em")
          .attr("class", "legend-label")
          .attr("x", xLabel)
          .text("net income (loss)")
      );
  }

  hide() {
    this.container.style("display", "none");
  }

  show() {
    this.container.style("display", null);
  }

  updateVisibility(isLegendVisible) {
    this.isLegendVisible = isLegendVisible;
    if (isLegendVisible) {
      this.show();
    } else {
      this.hide();
    }
  }
}
