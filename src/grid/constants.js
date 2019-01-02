/*
  Symbols utilized on various objects.
*/
export const TILE = Symbol.for("@@dynamic-grid/tile");
export const GRID = Symbol.for("@@dynamic-grid/grid");
export const STATE = Symbol.for("@@dynamic-grid/state");
export const COMMIT = Symbol.for("@@dynamic-grid/commit");

export const EMPTY_OBJECT = Object.freeze({});

export const DEFAULT_CONSTRAINTS = Object.create(EMPTY_OBJECT, {
  width: {
    value: Object.create(EMPTY_OBJECT, {
      minPx: { value: 200, writable: true },
      minPct: { value: 20, writable: true }
    })
  },
  height: {
    value: Object.create(EMPTY_OBJECT, {
      minPx: { value: 200, writable: true },
      minPct: { value: 20, writable: true }
    })
  }
});

export const STATIC_NODE_COUNTS = Object.freeze({
  grids: 0,
  nodesWide: 1,
  nodesHigh: 1
});
