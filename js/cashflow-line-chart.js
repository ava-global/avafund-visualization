class CashFlowLineChart {
  constructor({ el }) {
    this.el = el;
    this.init();
  }

  init() {
    this.x = d3.scalePoint().range([0, DIMS.LINE_CHART_WIDTH]);
    this.y = (d, i) =>
      i * DIMS.ROW_HEIGHT +
      (d.type === "end" ? DIMS.NET_ROW_HEIGHT / 2 : DIMS.ROW_HEIGHT / 2);

    this.g = d3.select(this.el);
  }

  wrangleData() {
    this.rowData = this.calculateRowData();

    this.height =
      (this.rowData.length - 1) * DIMS.ROW_HEIGHT + DIMS.NET_ROW_HEIGHT;

    this.x.domain(this.rowData[0].map((d) => d.time));

    this.z = new Map(
      this.rowData.map((d) => {
        const z = d3
          .scaleLinear()
          .domain(d3.extent(d, (e) => e.value))
          .range([DIMS.LINE_CHART_HEIGHT / 2, -DIMS.LINE_CHART_HEIGHT / 2]);
        return [d.id, z];
      })
    );
  }

  render() {
    const t = this.g.transition();
    this.renderRows(t);
  }

  renderRows(t) {
    // Row
    const row = this.g
      .selectAll(".line-row")
      .data(this.rowData, (d) => d.id)
      .join(
        (enter) =>
          enter
            .append("g")
            .attr("class", "line-row")
            .attr("opacity", 0)
            .attr("transform", (d, i) => `translate(0,${this.y(d, i)})`)
            .call((g) =>
              g
                .append("clipPath")
                .attr("class", "up-clip")
                .attr("id", (d) => `up-clip-${d.id}`)
                .append("rect")
                .attr("width", DIMS.LINE_CHART_WIDTH)
                .attr("height", DIMS.LINE_CHART_HEIGHT)
            )
            .call((g) =>
              g
                .append("clipPath")
                .attr("class", "down-clip")
                .attr("id", (d) => `down-clip-${d.id}`)
                .append("rect")
                .attr("width", DIMS.LINE_CHART_WIDTH)
                .attr("height", DIMS.LINE_CHART_HEIGHT)
            )
            .call((g) =>
              g
                .append("g")
                .attr("class", "row-up")
                .attr("clip-path", (d) => `url(#up-clip-${d.id})`)
                .call((g) => g.append("path").attr("class", "line-path-fill"))
                .call((g) =>
                  g
                    .append("path")
                    .attr("class", "line-path-stroke")
                    .attr("stroke-width", DIMS.LINE_CHART_STROKE_WIDTH)
                )
            )
            .call((g) =>
              g
                .append("g")
                .attr("class", "row-down")
                .attr("clip-path", (d) => `url(#down-clip-${d.id})`)
                .call((g) => g.append("path").attr("class", "line-path-fill"))
                .call((g) =>
                  g
                    .append("path")
                    .attr("class", "line-path-stroke")
                    .attr("stroke-width", DIMS.LINE_CHART_STROKE_WIDTH)
                )
            )
            .call((g) => g.append("g").attr("class", "row-windows"))
            .call((g) => g.append("g").attr("class", "line-dots")),
        (update) => update,
        (exit) =>
          exit.call((exit) => exit.transition(t).attr("opacity", 0).remove())
      );
    row
      .transition(t)
      .attr("opacity", 1)
      .attr("transform", (d, i) => `translate(0,${this.y(d, i)})`);

    // Up clip
    row
      .select(".up-clip rect")
      .attr("y", -DIMS.LINE_CHART_HEIGHT / 2 - DIMS.LINE_CHART_DOT_RADIUS)
      .attr(
        "height",
        (d) =>
          this.z.get(d.id)(0) -
          (-DIMS.LINE_CHART_HEIGHT / 2 - DIMS.LINE_CHART_DOT_RADIUS)
      );

    // Down clip
    row
      .select(".down-clip rect")
      .attr("y", (d) => this.z.get(d.id)(0))
      .attr(
        "height",
        (d) =>
          DIMS.LINE_CHART_HEIGHT / 2 +
          DIMS.LINE_CHART_DOT_RADIUS -
          this.z.get(d.id)(0)
      );

    // Up path
    row
      .select(".row-up")
      .select(".line-path-fill")
      .classed("is-positive", (d) =>
        CLASSED.IS_POSITIVE({ value: 1, type: d.type })
      )
      .classed("is-negative", (d) =>
        CLASSED.IS_NEGATIVE({ value: 1, type: d.type })
      )
      .attr(
        "d",
        d3
          .area()
          .x((d) => this.x(d.time))
          .y1((d) => this.z.get(d.id)(d.value))
          .y0((d) => this.z.get(d.id)(0))
          .defined((d) => d.value !== null)
      );
    row
      .select(".row-up")
      .select(".line-path-stroke")
      .classed("is-positive", (d) =>
        CLASSED.IS_POSITIVE({ value: 1, type: d.type })
      )
      .classed("is-negative", (d) =>
        CLASSED.IS_NEGATIVE({ value: 1, type: d.type })
      )
      .attr(
        "d",
        d3
          .line()
          .x((d) => this.x(d.time))
          .y((d) => this.z.get(d.id)(d.value))
          .defined((d) => d.value !== null)
      );

    // Down path
    row
      .select(".row-down")
      .select(".line-path-fill")
      .classed("is-positive", (d) =>
        CLASSED.IS_POSITIVE({ value: -1, type: d.type })
      )
      .classed("is-negative", (d) =>
        CLASSED.IS_NEGATIVE({ value: -1, type: d.type })
      )
      .attr(
        "d",
        d3
          .area()
          .x((d) => this.x(d.time))
          .y1((d) => this.z.get(d.id)(0))
          .y0((d) => this.z.get(d.id)(d.value))
          .defined((d) => d.value !== null)
      );
    row
      .select(".row-down")
      .select(".line-path-stroke")
      .classed("is-positive", (d) =>
        CLASSED.IS_POSITIVE({ value: -1, type: d.type })
      )
      .classed("is-negative", (d) =>
        CLASSED.IS_NEGATIVE({ value: -1, type: d.type })
      )
      .attr(
        "d",
        d3
          .line()
          .x((d) => this.x(d.time))
          .y((d) => this.z.get(d.id)(d.value))
          .defined((d) => d.value !== null)
      );

    // Row windows
    row
      .select(".row-windows")
      .selectAll(".row-window")
      .data((d) => d.slice(1))
      .join((enter) =>
        enter
          .append("rect")
          .attr("class", "row-window")
          .attr(
            "height",
            DIMS.LINE_CHART_HEIGHT + DIMS.LINE_CHART_STROKE_WIDTH * 2
          )
          .attr("y", -DIMS.LINE_CHART_HEIGHT / 2 - DIMS.LINE_CHART_STROKE_WIDTH)
      )
      .attr("width", this.x.step())
      .attr("x", (d) => this.x(d.time) - this.x.step())
      .classed("is-sub-category", (d) => d.level > 0)
      .classed("is-selected", (d) => d.time === this.time);

    // Line dots
    row
      .select(".line-dots")
      .selectAll(".line-dot")
      .data((d) => d)
      .join((enter) =>
        enter
          .append("circle")
          .attr("class", "line-dot")
          .attr("r", DIMS.LINE_CHART_DOT_RADIUS)
      )
      .attr("cx", (d) => this.x(d.time))
      .attr("cy", (d) => this.z.get(d.id)(d.value))
      .classed("is-positive", CLASSED.IS_POSITIVE)
      .classed("is-negative", CLASSED.IS_NEGATIVE)
      .classed("is-selected", (d) => d.time === this.time);
  }

  calculateRowData() {
    const rows = [];
    for (let i = 0; i < this.data[0].visibleItems.length; i++) {
      const row = [];
      for (let j = 0; j < this.data.length; j++) {
        const time = this.data[j].time;
        const item = this.data[j].visibleItems[i];
        row.push({
          id: item.id,
          time,
          value: item.value,
          type: item.type,
          level: item.level,
        });
        if (j === 0) {
          row.id = item.id;
          row.name = item.name;
          row.type = item.type;
        }
      }
      rows.push(row);
    }
    return rows;
  }

  updateData(data) {
    this.data = data;
    this.wrangleData();
    this.render();
  }

  updateTime(time) {
    this.time = time;
    this.render();
  }
}
