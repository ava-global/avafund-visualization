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
            .classed("is-summary", CLASSED.IS_SUMMARY)
            .classed("is-net-income", CLASSED.IS_NET_INCOME)
            .attr("transform", (d, i) => `translate(0,${this.y(d, i)})`)
            .attr("fill-opacity", 0),
        (update) => update,
        (exit) =>
          exit.call((exit) =>
            exit.transition(t).attr("fill-opacity", 0).remove()
          )
      )
      .classed("is-positive", CLASSED.IS_POSITIVE)
      .classed("is-negative", CLASSED.IS_NEGATIVE)
      .text((d) =>
        d.type === "end" ? FORMAT.SIGNED_VALUE(d.value) : FORMAT.VALUE(d.value)
      )
      .transition(t)
      .attr("fill-opacity", 1)
      .attr("transform", (d, i) => `translate(0,${this.y(d, i)})`);
  }

  updateData(data) {
    this.data = data;
    this.render();
  }
}
