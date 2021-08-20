class CashflowValues {
  constructor({ el }) {
    this.el = el;
    this.init();
  }

  init() {
    this.y = (d, i) =>
      i * DIMS.ROW_HEIGHT +
      (d.type === "end" ? DIMS.NET_ROW_HEIGHT / 2 : DIMS.ROW_HEIGHT / 2);

    this.g = d3.select(this.el);
  }

  render() {
    const t = this.g.transition();

    this.g
      .selectAll(".chart-value")
      .data(this.data, (d) => d.name)
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("class", "chart-value")
            .attr("text-anchor", "end")
            .attr("dy", "0.32em")
            .classed("is-summary", (d) => d.type === "summary")
            .classed("is-positive", (d) =>
              d.type === "end" ? d.value > 0 : d.type === "plus"
            )
            .classed("is-negative", (d) =>
              d.type === "end" ? d.value < 0 : d.type === "minus"
            )
            .classed("is-net-income", (d) => d.type === "end")
            .attr("transform", (d, i) => `translate(0,${this.y(d, i)})`)
            .attr("fill-opacity", 0),
        (update) => update,
        (exit) =>
          exit.call((exit) =>
            exit.transition(t).attr("fill-opacity", 0).remove()
          )
      )
      .text((d) => FORMAT.VALUE(d.value))
      .transition(t)
      .attr("fill-opacity", 1)
      .attr("transform", (d, i) => `translate(0,${this.y(d, i)})`);
  }

  updateData(data) {
    this.data = data;
    this.render();
  }
}
