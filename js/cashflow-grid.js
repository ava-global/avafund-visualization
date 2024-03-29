class CashflowGrid {
  constructor({
    el,
    annualData,
    quarterData,
    isAnnualData,
    isWaterfallChart,
    isLegendVisible,
    isGrowthVisible,
  }) {
    this.el = el;
    this.annualData = annualData;
    this.quarterData = quarterData;
    this.isAnnualData = isAnnualData;
    this.isWaterfallChart = isWaterfallChart;
    this.isLegendVisible = isLegendVisible;
    this.isGrowthVisible = isGrowthVisible;
    this.init();
  }

  init() {
    this.dispatch = d3
      .dispatch("timechange", "itemchange", "legendhide")
      .on("timechange", (time) => {
        this.updateTime(time);
      })
      .on("itemchange", ({ id, toExpand }) => {
        this.updateItem({ id, toExpand });
      })
      .on("legendhide", () => {
        this.el.dispatchEvent(new Event("legendhide"));
      });

    this.container = d3.select(this.el);

    // Sync scrolls
    this.timesHeaderArea = this.container.select(".times-header-area");
    this.timesBodyArea = this.container.select(".times-body-area");
    this.chartBodyArea = this.container.select(".chart-body-area");
    syncScroll({
      el1: this.timesHeaderArea.node(),
      el2: this.timesBodyArea.node(),
      direction: "x",
    });
    syncScroll({
      el1: this.chartBodyArea.node(),
      el2: this.timesBodyArea.node(),
      direction: "y",
    });

    // Chart header
    this.nameText = this.container.select(".name-text");
    this.descriptionText = this.container.select(".description-text");

    // Times header
    this.timesHeader = new CashflowTimesHeader({
      el: this.container.select(".times-header-svg").node(),
      isAnnualData: this.isAnnualData,
      isGrowthVisible: this.isGrowthVisible,
      dispatch: this.dispatch,
    });

    // Chart body
    this.chartBody = new CashflowChartBody({
      el: this.container.select(".chart-body-svg").node(),
      isWaterfallChart: this.isWaterfallChart,
      dispatch: this.dispatch,
    });

    // Times body
    this.timesBody = new CashflowTimesBody({
      el: this.container.select(".times-body-svg").node(),
      isAnnualData: this.isAnnualData,
      isWaterfallChart: this.isWaterfallChart,
      isGrowthVisible: this.isGrowthVisible,
    });

    // Legend
    this.legend = new CashflowWaterfallLegend({
      el: this.container.select(".waterfall-legend").node(),
      isLegendVisible: this.isLegendVisible,
      dispatch: this.dispatch,
    });

    this.wrangleData();
    this.render();
  }

  wrangleData() {
    this.accessor = {
      symbolName: (d) => d.name,
      symbolDescription: (d) => d.description,
      values: (d) => d.itemPerPeriod,
      time: (d) => d.period,
      items: (d) => d.items,
      id: (d) => d.id,
      parentId: (d) => d.parentId,
      name: (d) => d.name,
      value: (d) => (isNaN(+d.value) ? null : d.value),
      type: (d) => d.type,
    };

    const data = this.isAnnualData ? this.annualData : this.quarterData;

    this.name = this.accessor.symbolName(this.annualData);
    this.description = this.accessor.symbolDescription(data);

    this.values = this.accessor.values(data).map((d, i) => {
      const time = this.accessor.time(d);
      let prevItems;
      if (i > 0) {
        prevItems = this.accessor.items(this.accessor.values(data)[i - 1]);
      }
      const items = this.accessor.items(d).map((e, j) => ({
        id: this.accessor.id(e),
        parentId: this.accessor.parentId(e),
        name: this.accessor.name(e),
        value: this.accessor.value(e),
        type: this.accessor.type(e),
        growth: (() => {
          if (i === 0) return null;
          const present = this.accessor.value(e);
          const past = this.accessor.value(prevItems[j]);
          if (present === null || past === null) return null;
          return (present - past) / Math.abs(past);
        })(),
      }));
      return {
        time,
        items,
      };
    });

    this.times = this.values.map((d) => d.time);

    this.hierarchy = new CashflowHierarchy({
      items: this.accessor.items(this.values[0]),
    });

    this.values.forEach((v) => {
      v.items.forEach((d) => {
        d.level = this.hierarchy.itemLevel(d.id);
        d.descendants = this.hierarchy.itemDescendants(d.id);
        if (d.descendants) {
          d.descendantsVisible = false;
          this.hierarchy.collapseItem(d.id);
        }
        d.children = this.hierarchy.itemChildren(d.id);
      });
      v.visibleItems = v.items.filter((d) =>
        this.hierarchy.visibleItems.has(d.id)
      );
    });

    // Get abs max net income to determine the CURRENT_VALUE_WIDTH
    DIMS.CURRENT_VALUE_WIDTH = (() => {
      const value = d3.max(this.values, (d) =>
        Math.abs(d.visibleItems.find((e) => e.type === "end").value)
      );
      const charCount = FORMAT.SIGNED_VALUE(value).length;
      return d3.max([
        charCount * DIMS.CURRENT_VALUE_CHAR_WIDTH,
        DIMS.CURRENT_VALUE_MIN_WIDTH,
      ]);
    })();
  }

  render() {
    this.nameText.text(this.name);
    this.descriptionText.text(this.description);

    this.timesHeader.updateData(this.times);
    this.timesBody.updateData(this.values);
    this.chartBody.updateData(this.values);

    this.dispatch.call("timechange", null, this.times[this.times.length - 1]);
    this.timesHeaderArea.node().scrollLeft =
      this.timesHeaderArea.node().scrollWidth;
    this.timesBodyArea.node().scrollLeft =
      this.timesBodyArea.node().scrollWidth;
  }

  updateTime(time) {
    this.time = time;
    this.timesHeader.updateTime(time);
    this.timesBody.updateTime(time);
    this.chartBody.updateTime(time);
  }

  updateItem({ id, toExpand }) {
    if (toExpand) {
      this.hierarchy.expandItem(id);
    } else {
      this.hierarchy.collapseItem(id);
    }

    this.values.forEach((v) => {
      v.items.find((d) => d.id === id).descendantsVisible = toExpand;
      v.visibleItems = v.items.filter((d) =>
        this.hierarchy.visibleItems.has(d.id)
      );
    });

    this.timesBody.updateData(this.values);
    this.chartBody.updateData(this.values);
  }

  updateDataType(isAnnualData) {
    this.isAnnualData = isAnnualData;
    this.wrangleData();
    this.timesHeader.updateDataType(isAnnualData);
    this.timesHeader.updateData(this.times);
    this.timesBody.updateData(this.values);
    this.chartBody.updateData(this.values);

    this.dispatch.call("timechange", null, this.times[this.times.length - 1]);

    this.timesHeaderArea.node().scrollLeft =
      this.timesHeaderArea.node().scrollWidth;
    this.timesBodyArea.node().scrollLeft =
      this.timesBodyArea.node().scrollWidth;
  }

  updateChartType(isWaterfallChart) {
    this.isWaterfallChart = isWaterfallChart;
    this.timesBody.updateChartType(isWaterfallChart);
    this.chartBody.updateChartType(isWaterfallChart);
  }

  updateLegendVisibility(isLegendVisible) {
    this.isLegendVisible = isLegendVisible;
    this.legend.updateVisibility(isLegendVisible);
  }

  updateGrowthVisibility(isGrowthVisible) {
    this.isGrowthVisible = isGrowthVisible;
    this.timesHeader.updateGrowthVisibility(isGrowthVisible);
    this.timesBody.updateGrowthVisibility(isGrowthVisible);
    this.timesHeaderArea.node().scrollLeft =
      this.timesHeaderArea.node().scrollWidth;
    this.timesBodyArea.node().scrollLeft =
      this.timesBodyArea.node().scrollWidth;
  }
}
