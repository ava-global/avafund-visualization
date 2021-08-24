class CashflowWaterfall {
  constructor({ el }) {
    this.el = el;
    this.init();
  }

  init() {
    this.x = d3.scaleLinear().range([0, DIMS.WATERFALL_CHART_WIDTH]);
    this.y = (d, i) =>
      i * DIMS.ROW_HEIGHT +
      (d.type === "end" ? DIMS.NET_ROW_HEIGHT / 2 : DIMS.ROW_HEIGHT / 2);

    this.g = d3.select(this.el);
    this.renderDefs();
    this.gXBackground = this.g
      .append("g")
      .attr("class", "axis axis-background");
    this.gX = this.g.append("g").attr("class", "axis");
    this.gLinks = this.g.append("g").attr("class", "waterfall-links");
    this.gArrows = this.g.append("g").attr("class", "waterfall-arrows");
    this.gRects = this.g.append("g").attr("class", "waterfall-rects");
    this.gNetIncome = this.g.append("g").attr("class", "waterfall-net-income");
  }

  wrangleData() {
    this.nodes = this.calculateNodesData();
    this.links = this.calculateLinksData();

    this.height =
      (this.nodes.length - 1) * DIMS.ROW_HEIGHT +
      (DIMS.NET_ROW_HEIGHT + DIMS.NET_ROW_WATERFALL_EXTRA_HEIGHT);

    this.xAxisY = this.height - DIMS.WATERFALL_X_AXIS_OFFSET;

    let min = d3.min([
      d3.min(this.nodes, (d) => d.x1),
      d3.min(this.nodes, (d) => d.x2),
    ]);
    if (min > 0) min = 0;
    const max = d3.max([
      d3.max(this.nodes, (d) => d.x1),
      d3.max(this.nodes, (d) => d.x2),
    ]);
    this.x.domain([min, max]).nice();
  }

  renderDefs() {
    this.g
      .append("defs")
      .selectAll("marker")
      .data(["positive", "negative"])
      .join("marker")
      .attr("id", (d) => `arrow-marker-${d}`)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 5)
      .attr("refY", 5)
      .attr("markerWidth", 3)
      .attr("markerHeight", 3)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z");
  }

  render() {
    const t = this.g.transition();
    this.renderXAxis(t);
    this.renderArrows(t);
    this.renderRects(t);
    this.renderLinks(t);
    this.renderNetIncome(t);
  }

  renderXAxis(t) {
    if (!this.gX.attr("transform")) {
      this.gX.attr("transform", `translate(0,${this.xAxisY})`);
      this.gXBackground.attr("transform", `translate(0,${this.xAxisY})`);
    }

    this.gX
      .transition(t)
      .attr("transform", `translate(0,${this.xAxisY})`)
      .call(d3.axisBottom(this.x).ticks(4));
    this.gX
      .selectAll(".tick line")
      .filter((d) => d === 0)
      .attr(
        "y1",
        -(
          this.xAxisY -
          DIMS.ROW_HEIGHT / 2 +
          DIMS.WATERFALL_ARROW_STROKE_WIDTH / 2
        )
      );
    this.gXBackground
      .transition(t)
      .attr("transform", `translate(0,${this.xAxisY})`)
      .call(
        d3
          .axisBottom(this.x)
          .ticks(4)
          .tickFormat(() => "")
      );
    this.gXBackground
      .selectAll(".tick line")
      .attr(
        "y1",
        -(
          this.xAxisY -
          DIMS.ROW_HEIGHT / 2 +
          DIMS.WATERFALL_ARROW_STROKE_WIDTH / 2
        )
      )
      .select(".domain")
      .remove();
  }

  renderArrows(t) {
    this.gArrows
      .selectAll(".waterfall-arrow")
      .data(
        this.nodes.filter((d) => d.type === "plus" || d.type === "minus"),
        (d) => d.name
      )
      .join((enter) =>
        enter
          .append("line")
          .attr("class", "waterfall-arrow")
          .attr("stroke-width", DIMS.WATERFALL_ARROW_STROKE_WIDTH)
          .attr("transform", (d) => `translate(0,${this.y(d, d.i)})`)
          .attr("x1", this.x(0))
          .attr("x2", this.x(0))
      )
      .classed("is-positive", CLASSED.IS_POSITIVE)
      .classed("is-negative", CLASSED.IS_NEGATIVE)
      .attr("marker-end", function () {
        return d3.select(this).classed("is-positive")
          ? "url(#arrow-marker-positive)"
          : "url(#arrow-marker-negative)";
      })
      .transition(t)
      .attr("transform", (d) => `translate(0,${this.y(d, d.i)})`)
      .attr("x1", (d) => this.x(d.x1))
      .attr("x2", (d) => this.x(d.x2));
  }

  renderRects(t) {
    this.gRects
      .selectAll(".waterfall-rect")
      .data(
        this.nodes.filter((d) => d.type === "summary"),
        (d) => d.name
      )
      .join((enter) =>
        enter
          .append("rect")
          .attr("class", "waterfall-rect is-summary")
          .attr("y", -DIMS.WATERFALL_RECT_HEIGHT / 2)
          .attr("height", DIMS.WATERFALL_RECT_HEIGHT)
          .attr("x", this.x(0))
          .attr("width", 0)
          .attr("transform", (d) => `translate(0,${this.y(d, d.i)})`)
      )
      .transition(t)
      .attr("x", (d) => Math.min(this.x(0), this.x(d.x2)))
      .attr("width", (d) => Math.abs(this.x(0) - this.x(d.x2)))
      .attr("transform", (d) => `translate(0,${this.y(d, d.i)})`);
  }

  renderLinks(t) {
    this.gLinks
      .selectAll(".waterfall-link")
      .data(this.links, (d) => d.name)
      .join((enter) =>
        enter
          .append("line")
          .attr("class", "waterfall-link")
          .attr("x1", this.x(0))
          .attr("x2", this.x(0))
          .attr("y1", (d) => this.y(d.source, d.source.i))
          .attr("y2", (d) => this.y(d.target, d.target.i))
      )
      .classed("is-secondary", (d) => d.isSecondary)
      .transition(t)
      .attr("x1", (d) =>
        d.enterChildren ? this.x(d.source.x1) : this.x(d.source.x2)
      )
      .attr("x2", (d) =>
        d.enterChildren ? this.x(d.source.x1) : this.x(d.source.x2)
      )
      .attr("y1", (d) => this.y(d.source, d.source.i))
      .attr("y2", (d) => this.y(d.target, d.target.i));
  }

  renderNetIncome(t) {
    const node = this.nodes.find((d) => d.type === "end");

    this.gNetIncome
      .selectAll(".waterfall-rect")
      .data([node])
      .join((enter) =>
        enter
          .append("rect")
          .attr("class", "waterfall-rect is-net-income")
          .attr("y", -DIMS.WATERFALL_RECT_HEIGHT / 2)
          .attr("height", DIMS.WATERFALL_RECT_HEIGHT)
          .attr("x", this.x(0))
          .attr("width", 0)
          .attr("transform", (d) => `translate(0,${this.y(d, d.i)})`)
      )
      .classed("is-positive", CLASSED.IS_POSITIVE)
      .classed("is-negative", CLASSED.IS_NEGATIVE)
      .transition(t)
      .attr("x", (d) => Math.min(this.x(0), this.x(d.x2)))
      .attr("width", (d) => Math.abs(this.x(0) - this.x(d.x2)))
      .attr("transform", (d) => `translate(0,${this.y(d, d.i)})`);

    this.gNetIncome
      .selectAll(".waterfall-link")
      .data([node])
      .join((enter) =>
        enter
          .append("line")
          .attr("class", "waterfall-link is-net-income")
          .attr("stroke-width", DIMS.WATERFALL_ARROW_STROKE_WIDTH)
          .attr("transform", (d) => `translate(0,${this.y(d, d.i)})`)
          .attr("x1", this.x(0))
          .attr("x2", this.x(0))
          .attr("y2", (d) => this.xAxisY - this.y(d, d.i) - 4)
      )
      .classed("is-positive", CLASSED.IS_POSITIVE)
      .classed("is-negative", CLASSED.IS_NEGATIVE)
      .attr("marker-end", function () {
        return d3.select(this).classed("is-positive")
          ? "url(#arrow-marker-positive)"
          : "url(#arrow-marker-negative)";
      })
      .transition(t)
      .attr("transform", (d) => `translate(0,${this.y(d, d.i)})`)
      .attr("x1", (d) => this.x(d.x2))
      .attr("x2", (d) => this.x(d.x2));
  }

  calculateNodesData() {
    const nodes = this.data.map((d, i) => {
      return Object.assign({ i }, d);
    });

    let total = 0;
    // Loop through main categories
    nodes
      .filter((d) => d.level === 0)
      .forEach((d) => {
        const isSummaryOrEnd = d.type === "summary" || d.type === "end";
        d.x1 = isSummaryOrEnd ? 0 : total;
        d.x2 = isSummaryOrEnd
          ? d.value
          : d.type === "plus"
          ? (total += d.value)
          : d.type === "minus"
          ? (total -= d.value)
          : d.x1;
      });

    // Loop through subcategories
    const withChildren = nodes.filter((d) => {
      if (d.level === 0) {
        return d.children && d.descendantsVisible;
      } else {
        return d.children;
      }
    });
    if (withChildren.length) {
      withChildren.forEach((c) => {
        let total = c.x1;
        c.children
          .map((id) => nodes.find((d) => d.id === id))
          .forEach((d) => {
            const isSummary = d.type === "summary";
            d.x1 = isSummary ? 0 : total;
            d.x2 = isSummary
              ? d.value
              : d.type === "plus"
              ? (total += d.value)
              : d.type === "minus"
              ? (total -= d.value)
              : d.x1;
          });
      });
    }

    return nodes;
  }

  calculateLinksData() {
    const links = [];
    // Loop through main categories
    d3.pairs(this.nodes.filter((d) => d.level === 0)).forEach(([s, t]) => {
      links.push({
        name: `${s.name}-${t.name}`,
        source: s,
        target: t,
        isSecondary:
          s.value === null || t.value === null || !!s.descendantsVisible,
        enterChildren: false,
      });
    });

    // Loop through subcategories
    const withChildren = this.nodes.filter((d) => {
      if (d.level === 0) {
        return d.children && d.descendantsVisible;
      } else {
        return d.children;
      }
    });
    if (withChildren.length) {
      withChildren.forEach((d) => {
        d3.pairs([
          d,
          ...d.children.map((id) => this.nodes.find((e) => e.id === id)),
        ]).forEach(([s, t], i) => {
          links.push({
            name: `${s.name}-${t.name}`,
            source: s,
            target: t,
            isSecondary: s.value === null || t.value === null,
            enterChildren: i === 0,
          });
        });

        if (d.descendantsVisible) {
          const lastDescendantId = d.descendants[d.descendants.length - 1];
          const lastDescendantIndex = this.nodes.findIndex(
            (e) => e.id === lastDescendantId
          );
          const s = this.nodes[lastDescendantIndex];
          const t = this.nodes[lastDescendantIndex + 1];
          links.push({
            name: `${s.name}-${t.name}`,
            source: s,
            target: t,
            isSecondary: s.value === null || t.value === null,
            enterChildren: false,
          });
        }
      });
    }
    return links;
  }

  updateData(data) {
    this.data = data;
    this.wrangleData();
    this.render();
  }
}
