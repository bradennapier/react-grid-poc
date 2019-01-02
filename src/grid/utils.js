/* @flow */
import type { RDG$Grid } from "./types";

import { STATE, STATIC_NODE_COUNTS, DEFAULT_CONSTRAINTS } from "./constants";
import * as defaultTheme from "./themes";

export function getInitialChildState(initialState = {}) {
  return {
    tabs: undefined,
    parent: null,
    weight: undefined,
    ancestors: undefined,
    depth: undefined,
    constraints: undefined,
    children: undefined,
    ref: undefined,
    component: undefined,
    childIndexByID: {},
    neighbors: {},
    ...initialState
  };
}

export function resetChildState(child) {
  Object.assign(child[STATE], {
    depth: undefined,
    ancestors: undefined,
    childIndexByID: {},
    neighbors: {}
  });
}

function getGridDefaults(userSettings = {}) {
  return {
    direction: "h",
    ...(userSettings.defaults || {}),
    constraints: mergeConstraints(DEFAULT_CONSTRAINTS, userSettings.constraints)
  };
}

export function getGridConfig(userSettings = {}) {
  let debug = userSettings.debug || {};
  if (typeof debug === "boolean") {
    if (userSettings.debug) {
      debug = {
        size: true,
        grid: true
      };
    }
  }
  return {
    debug,
    tabbed: userSettings.tabbed || false,
    widgets: userSettings.widgets || userSettings.tabbed || false,
    renderTile: userSettings.renderTile
      ? userSettings.renderTile
      : tile => tile.componentID,
    renderTitle: userSettings.renderTitle
      ? userSettings.renderTitle
      : child => child.title || child.componentID || child.id,
    cssVariables: userSettings.cssVariables,
    resizeStyle: userSettings.resizeStyle || "stateful",
    initialGrid: userSettings.initialGrid,
    editable: userSettings.editable || false,
    defaults: getGridDefaults(userSettings),
    theme: userSettings.theme || defaultTheme,
    dropZone: {
      isActive: false
    }
  };
}

function mergeConstraints(globalConstraints, localConstraints = {}) {
  const defaultWidth = Object.create(globalConstraints.width);
  const defaultHeight = Object.create(globalConstraints.height);
  const hasLocalWidth = Boolean(localConstraints.width);
  const hasLocalHeight = Boolean(localConstraints.height);
  return Object.create(
    {},
    {
      width: {
        enumerable: hasLocalWidth,
        value: hasLocalWidth
          ? Object.create(
              {},
              {
                minPx: {
                  enumerable: Boolean(localConstraints.width.minPx),
                  value: localConstraints.width.minPx || defaultWidth.minPx
                },
                minPct: {
                  enumerable: Boolean(localConstraints.width.minPct),
                  value: localConstraints.width.minPct || defaultWidth.minPct
                }
              }
            )
          : defaultWidth
      },
      height: {
        enumerable: hasLocalHeight,
        value: hasLocalHeight
          ? Object.create(
              {},
              {
                minPx: {
                  enumerable: Boolean(localConstraints.height.minPx),
                  value: localConstraints.height.minPx || defaultHeight.minPx
                },
                minPct: {
                  enumerable: Boolean(localConstraints.height.minPct),
                  value: localConstraints.height.minPct || defaultHeight.minPct
                }
              }
            )
          : defaultHeight
      }
    }
  );
}

export function getTileConstraints(config, localConstraints) {
  const constraints = mergeConstraints(
    config.defaults.constraints,
    localConstraints
  );
  Object.defineProperty(constraints, "counts", { value: STATIC_NODE_COUNTS });
  return constraints;
}

export function reduceChildConstraints(controller, grid: RDG$Grid) {
  let highestDimension = 0;
  let highestCount = 0;
  const counts = {
    grids: 1,
    nodesWide: 0,
    nodesHigh: 0
  };
  const gridConstraints = {
    height: {
      minPx: 0,
      minPct: controller.config.defaults.constraints.height.minPct
    },
    width: {
      minPx: 0,
      minPct: controller.config.defaults.constraints.width.minPct
    }
  };
  Object.defineProperty(gridConstraints, "counts", {
    value: counts
  });
  return grid.children.reduce((constraint, child) => {
    const childConstraints = controller.getChildConstraints(child);
    if (grid.direction === "h") {
      constraint.width.minPx += childConstraints.width.minPx;
      if (highestDimension < childConstraints.height.minPx) {
        highestDimension = childConstraints.height.minPx;
        constraint.height.minPx = childConstraints.height.minPx;
      }
      constraint.counts.nodesWide += childConstraints.counts.nodesWide;
      if (highestCount < childConstraints.counts.nodesHigh) {
        highestCount = childConstraints.counts.nodesHigh;
        constraint.counts.nodesHigh = childConstraints.counts.nodesHigh;
      }
    } else {
      constraint.counts.nodesHigh += childConstraints.counts.nodesHigh;
      if (highestCount < childConstraints.counts.nodesWide) {
        highestCount = childConstraints.counts.nodesWide;
        constraint.counts.nodesWide = childConstraints.counts.nodesWide;
      }
      constraint.height.minPx += childConstraints.height.minPx;
      if (highestDimension < childConstraints.width.minPx) {
        highestDimension = childConstraints.width.minPx;
        constraint.width.minPx = childConstraints.width.minPx;
      }
    }
    constraint.counts.grids += childConstraints.counts.grids;
    return constraint;
  }, gridConstraints);
}

export function hasProp(obj: Object, prop: any) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function getPositionalProperties(side, positionVar, defaultValue) {
  return {
    left:
      side === "left"
        ? positionVar
        : side === "right"
        ? "initial"
        : defaultValue,
    right:
      side === "right"
        ? positionVar
        : side === "left"
        ? "initial"
        : defaultValue,
    bottom:
      side === "bottom"
        ? positionVar
        : side === "top"
        ? "initial"
        : defaultValue,
    top:
      side === "top"
        ? positionVar
        : side === "bottom"
        ? "initial"
        : defaultValue
  };
}
