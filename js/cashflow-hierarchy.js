class CashflowHierarchy {
  constructor({ items }) {
    this.items = items;
    this.init();
  }

  init() {
    const entries = [{ id: "root", parentId: null }];
    this.items.forEach((item) => {
      entries.push({
        id: item.id,
        parentId: item.parentId || "root",
      });
    });
    this.root = d3
      .stratify()
      .id((d) => d.id)
      .parentId((d) => d.parentId)(entries);
    this.levelMap = new Map(
      this.root.descendants().map((d) => [d.data.id, d.depth - 1])
    );
    this.descendantsMap = new Map(
      this.root
        .descendants()
        .filter((d) => d.depth === 1)
        .map((d) => {
          let descendants = d
            .descendants()
            .filter((e) => e.data.id !== d.data.id)
            .map((d) => d.data.id);
          if (descendants.length === 0) descendants = undefined;
          return [d.data.id, descendants];
        })
    );
    this.childrenMap = new Map(
      this.root
        .descendants()
        .map((d) => [
          d.data.id,
          d.children ? d.children.map((d) => d.data.id) : undefined,
        ])
    );
  }

  itemLevel(id) {
    return this.levelMap.get(id);
  }

  itemDescendants(id) {
    // only for top category
    return this.descendantsMap.get(id);
  }

  itemChildren(id) {
    return this.childrenMap.get(id);
  }

  get visibleItems() {
    const visibleItems = new Set();
    this.root.eachBefore((d) => {
      if (d.data.id !== "root") visibleItems.add(d.data.id);
    });
    return visibleItems;
  }

  collapseItem(id) {
    const d = this.root.children.find((d) => d.data.id === id);
    if (d.children) {
      d._children = d.children;
      d.children = null;
    }
  }

  expandItem(id) {
    const d = this.root.children.find((d) => d.data.id === id);
    if (d._children) {
      d.children = d._children;
      d._children = null;
    }
  }
}
