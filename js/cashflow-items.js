class CashFlowItems {
  constructor({ el, dispatch }) {
    this.el = el;
    this.dispatch = dispatch;
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

    const item = this.g
      .selectAll(".chart-item")
      .data(this.data, (d) => d.name)
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("class", "chart-item")
            .attr("dy", "0.32em")
            .classed("is-collapsible", (d) => !!d.descendants)
            .classed("is-summary", CLASSED.IS_SUMMARY)
            .classed("is-net-income", CLASSED.IS_NET_INCOME)
            .attr("transform", (d, i) => `translate(0,${this.y(d, i)})`)
            .attr("fill-opacity", 0)
            .call((text) =>
              text
                .filter((d) => !!d.descendants)
                .on("click", (event, d) => {
                  this.dispatch.call("itemchange", null, {
                    id: d.id,
                    toExpand: !d.descendantsVisible,
                  });
                })
            ),
        (update) => update,
        (exit) =>
          exit.call((exit) =>
            exit.transition(t).attr("fill-opacity", 0).remove()
          )
      )
      .classed("is-positive", CLASSED.IS_POSITIVE)
      .classed("is-negative", CLASSED.IS_NEGATIVE)
      .html(this.itemText);

    item
      .transition(t)
      .attr("fill-opacity", 1)
      .attr("transform", (d, i) => `translate(0,${this.y(d, i)})`);
  }

  itemText(d) {
    if (!!d.descendants) {
      const sign = d.descendantsVisible ? "−" : "+";
      return `<tspan>${d.name}</tspan> <tspan class="chart-item-icon">${sign}</tspan>`;
    } else if (d.level !== 0) {
      return `<tspan dx="${
        (d.level - 1) * 8
      }" class="chart-item-icon dot-icon">·</tspan> <tspan>${d.name}</tspan>`;
    } else {
      return d.name;
    }
  }

  updateData(data) {
    this.data = data;
    this.render();
  }
}
