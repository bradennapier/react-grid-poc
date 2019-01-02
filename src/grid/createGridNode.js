import { GRID, STATE, TILE } from "./constants";

import { getInitialChildState } from "./utils";

export default function createGridNode(
  controller,
  type: "grid" | "tile",
  parent: RDG$Grid,
  props: RDG$NodeCreationProps,
  _commit?: RDG$Commit
): RDG$Node {
  const { id, index } =
    type === "grid" ? controller.getNextGridID() : controller.getNextTileID();

  let state = getInitialChildState({
    title: props.title,
    tabs: type === "tile" ? props.tabs || [] : undefined,
    activeTab: type === "tile" ? props.activeTab || 0 : undefined,
    direction: type === "grid" ? props.direction : undefined,
    children: type === "grid" ? props.children || [] : undefined,
    weight: parent === null || parent[TILE] ? 100 : props.weight,
    parent
  });

  const child = Object.create(
    {
      setState(nextState = {}, _commit: RDG$Commit) {
        const commit = controller.create.commit(_commit);
        let changed = false;
        for (const [k, v] of Object.entries(nextState)) {
          if (state[k] !== v) {
            state[k] = v;
            changed = true;
          }
        }
        if (changed) commit.changed(child);
        return commit;
      }
    },
    {
      weight: {
        enumerable: true,
        get() {
          return state.weight;
        }
      },
      constraints: {
        enumerable: type === "tile",
        get() {
          if (!state.constraints) {
            controller.getChildConstraints(child, props);
          }
          if (Object.keys(state.constraints).length === 0) {
            return undefined;
          }
          return state.constraints;
        }
      }
    }
  );

  Object.defineProperties(child, {
    [type === "grid" ? GRID : TILE]: {
      value: true
    },
    [STATE]: {
      get() {
        return state;
      },
      set(nextState) {
        state = nextState;
      }
    },
    id: {
      value: id
    },
    index: {
      value: index
    },
    childIndex: {
      get() {
        if (!state.parent) return -1;
        return controller.getChildIndex(state.parent, child);
      }
    },
    parent: {
      get() {
        return state.parent;
      }
    },
    ref: {
      get() {
        return state.ref;
      }
    },
    depth: {
      get() {
        if (!state.parent) return 0;
        return controller.getChildDepth(child);
      }
    }
  });

  if (type === "grid") {
    Object.defineProperties(child, {
      direction: {
        enumerable: true,
        get() {
          return state.direction || controller.config.defaults.direction;
        }
      },
      children: {
        enumerable: true,
        get() {
          return state.children;
        }
      }
    });
    if (state.children.length > 0) {
      const commit = controller.deserializeChildren(child, _commit);
      if (!parent) commit.commit();
    }
  } else {
    Object.defineProperties(child, {
      title: {
        enumerable: true,
        get() {
          return state.title;
        }
      },
      tabs: {
        enumerable: true,
        get() {
          return !child.componentID && state.tabs.length > 0
            ? state.tabs
            : undefined;
        }
      },
      activeTab: {
        enumerable: true,
        get() {
          return state.activeTab;
        }
      },
      componentID: {
        enumerable: true,
        value: props.componentID
      }
    });
    if (parent[GRID] && state.tabs.length > 0) {
      controller.deserializeTabs(child, _commit);
    }
  }

  controller.getChildConstraints(child, props);

  controller.setChild(child);

  return Object.freeze(child);
}
