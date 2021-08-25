const DIMS = {
  ROW_HEIGHT: 18,
  NET_ROW_HEIGHT: 24,
  NET_ROW_WATERFALL_EXTRA_HEIGHT: 24,
  TIME_Y_CENTER: 26,
  TIME_WIDTH: 60,
  TIME_PADDING: 8,
  TIME_BOX_ANNUAL_WIDTH: 40,
  TIME_BOX_QUARTER_WIDTH: 60,
  TIME_BOX_HEIGHT: 20,
  TIME_BOX_CORNER_RADIUS: 4,
  GROWTH_WIDTH: 32,
  GROWTH_PADDING: 4,
  ITEM_NAME_WIDTH: 136,
  ITEM_NAME_PADDING: 16,
  WATERFALL_CHART_WIDTH: 210,
  LINE_CHART_WIDTH: 60,
  LINE_CHART_HEIGHT: 14,
  LINE_CHART_DOT_RADIUS: 1.25,
  LINE_CHART_STROKE_WIDTH: 1,
  CHART_PADDING: 8,
  CURRENT_VALUE_WIDTH: 52,
  CURRENT_VALUE_PADDING: 20,
  WATERFALL_X_AXIS_OFFSET: 16,
  WATERFALL_ARROW_STROKE_WIDTH: 2,
  WATERFALL_RECT_HEIGHT: 7,
};

const FORMAT = {
  VALUE: (d) => (d === null ? "-" : d3.format(",")(d)),
  SIGNED_VALUE: (d) => (d === null ? "-" : d3.format("+,")(d)),
  GROWTH: (d) => (d === null ? "" : d3.format("+.1~%")(d)),
};

const CLASSED = {
  IS_POSITIVE: (d) => {
    if (d.type === "end") {
      return d.value > 0;
    } else if (d.type === "plus") {
      return d.value > 0;
    } else if (d.type === "minus") {
      return d.value < 0;
    }
  },
  IS_NEGATIVE: (d) => {
    if (d.type === "end") {
      return d.value < 0;
    } else if (d.type === "plus") {
      return d.value < 0;
    } else if (d.type === "minus") {
      return d.value > 0;
    }
  },
  IS_SUMMARY: (d) => d.type === "summary",
  IS_NET_INCOME: (d) => d.type === "end",
};
