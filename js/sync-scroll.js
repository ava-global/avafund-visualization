function syncScroll({ el1, el2, direction }) {
  let isSyncingEl1Scroll = false;
  let isSyncingEl2Scroll = false;

  let scrollProperty =
    direction === "x" ? "scrollLeft" : direction === "y" ? "scrollTop" : "";

  el1.addEventListener("scroll", function () {
    if (!isSyncingEl1Scroll) {
      isSyncingEl2Scroll = true;
      el2[scrollProperty] = this[scrollProperty];
    }
    isSyncingEl1Scroll = false;
  });

  el2.addEventListener("scroll", function () {
    if (!isSyncingEl2Scroll) {
      isSyncingEl1Scroll = true;
      el1[scrollProperty] = this[scrollProperty];
    }
    isSyncingEl2Scroll = false;
  });
}
