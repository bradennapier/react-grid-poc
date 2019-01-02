/* @flow */

import type {
  RDG$Grid,
  RDG$Node,
  RDG$Child,
  RDG$Commit,
  RDG$Directions
} from "./types";

import { TILE, GRID, STATE, COMMIT, EMPTY_OBJECT } from "./constants";

import { hasProp, getTileConstraints, reduceChildConstraints } from "./utils";

import { nextTileID, nextGridID, nextCommitID } from "./identity";

import { renderWidget } from "./components/widget";

import createGridCommit from "./commit";
import createGridNode from "./createGridNode";

export default function createGridController(rootProvider) {
  const maps = Object.freeze({
    childByID: new Map()
  });

  const refs = {
    dg: rootProvider.identity.id,
    grid: 0,
    tile: 0,
    commitID: 0
  };

  const controller = {
    get config() {
      return rootProvider.config;
    },

    rootProvider,

    create: Object.freeze({
      tile: (parent: RDG$Grid, props: RDG$NodeCreationProps, ...args: any[]) =>
        createGridNode(controller, "tile", parent, props, ...args),
      grid: (
        parent: void | RDG$Grid,
        props: RDG$GridCreationProps,
        ...args: any[]
      ) => createGridNode(controller, "grid", parent, props, ...args),
      commit: commit =>
        commit && commit[COMMIT] && !commit[COMMIT].complete
          ? commit
          : createGridCommit(controller)
    }),

    setChild(child) {
      maps.childByID.set(child.id, child);
    },

    unsetChild(child) {
      maps.childByID.delete(child.id);
    },

    getTileByID: (id: RDG$NodeID) => maps.tileByID.get(id),
    getGridByID: (id: RDG$GridID) => maps.gridByID.get(id),

    getNextGridID: () => nextGridID(refs),
    getNextTileID: () => nextTileID(refs),
    getNextCommitID: () => nextCommitID(refs),

    getChildEdges(child: RDG$Child) {
      return Object.freeze({
        top: controller.getEdgeInDirection(child, "top"),
        bottom: controller.getEdgeInDirection(child, "bottom"),
        left: controller.getEdgeInDirection(child, "left"),
        right: controller.getEdgeInDirection(child, "right")
      });
    },

    getChildDepth(child: RDG$Child): number {
      if (child[STATE].depth) return child[STATE].depth;
      let ancestor = child[STATE].parent;
      child[STATE].depth = 0;
      while (ancestor) {
        child[STATE].depth += 1;
        ancestor = ancestor[STATE].parent;
      }
      return child[STATE].depth;
    },

    getChildConstraints(child: RDG$Child, props = {}) {
      if (child[TILE]) {
        child[STATE].constraints = getTileConstraints(
          controller.config,
          props.constraints || child[STATE].constraints
        );
      } else {
        child[STATE].constraints = reduceChildConstraints(controller, child);
      }
      return child[STATE].constraints;
    },

    hasChild(grid: RDG$Grid, child: RDG$Child) {
      return grid[STATE].children.some(c => child === c);
    },

    hasChildID(grid: RDG$Grid, childID: RDG$ChildID) {
      return grid[STATE].children.some(child => child.id === childID);
    },

    /**
     * A significantly more efficient handling for
     * resizing when resizing from the UI.  This will
     * iterate and find an appropriate child that we
     * can take the needed space from (if any) based
     * upon the constraints that each widget provides.
     *
     * Space is only taken from siblings within the same
     * grid and not from ancestors higher in the grid
     * heirarchy.  This prevents undesirable effects where
     * we would be affecting other detached grid members.
     *
     * There are three styles of resizing that can be
     * chosen between by specifying the `resizeStyle`
     * property:
     *
     * - `stateful` (default) -
     *    As the user drags it keeps of the original
     *    weights of changed siblings so that if the
     *    user moves their mouse inverse to the
     *    default position it will restore the weights
     *     - This is how VSCode's Graph operates
     * - `passive` -
     *    Attempts will only be made to resize until
     *    the nearest sibling hits its constraints
     *    at which point the other sibling will need
     *    to be adjusted before allowing the tile
     *    to be resized any further.
     *     - This is the most performant but most
     *       annoying method.
     *  - `push` -
     *    This works similar to 'stateful' except it
     *    will not attempt to restore original weights
     *    when the user moves inverse.  This may be
     *    preferrable in some situations but 'stateful'
     *    is generally the best method.
     *
     * `Notes:`
     *
     *  - `self` is the region that is getting larger
     *      due to the resize action.
     *  - `nextSibling` is the region currently being
     *      shrunk.  When it hits its constraints it
     *      moves to the next sibling (if any).
     */
    resizeFromSplit(
      edge,
      type: "neighbor" | "client",
      amount: number,
      dragState
    ) {
      if (amount === 0) return;
      const isInverse = type !== dragState.originalType;
      const { resizeStyle } = controller.config;

      const self =
        resizeStyle === "stateful" &&
        isInverse &&
        typeof dragState.indexToCompare === "number"
          ? edge.parent.children[dragState.indexToCompare]
          : edge[type === "child" ? "neighbor" : "child"];

      let nextSelfWeight = Number(
        Number(self[STATE].weight + amount).toFixed(2)
      );

      let currentIndex =
        type === "child" ? edge.childIndex : edge.neighborIndex;

      let nextSibling = edge.parent.children[currentIndex];

      while (nextSibling) {
        let nextSiblingWeight = Number(
          Number(nextSibling[STATE].weight - amount).toFixed(2)
        );
        if (
          nextSibling.constraints[edge.axis].minPct > nextSiblingWeight ||
          self.constraints[edge.axis].minPct > nextSelfWeight ||
          nextSibling.constraints[edge.axis].minPx ===
            nextSibling[STATE].ref.getBoundingClientRect()[edge.axis]
        ) {
          if (resizeStyle === "passive") return;
          currentIndex =
            type === "child"
              ? currentIndex - edge.nextIndexOp
              : currentIndex + edge.nextIndexOp;
          nextSibling = edge.parent.children[currentIndex];
        } else {
          if (resizeStyle === "stateful") {
            if (!isInverse) {
              if (typeof dragState.weights[nextSibling.id] !== "number") {
                dragState.weights[nextSibling.id] = nextSibling[STATE].weight;
                dragState.indexToCompare = currentIndex;
              }
            } else if (nextSelfWeight >= dragState.weights[self.id]) {
              nextSiblingWeight =
                nextSiblingWeight +
                (nextSelfWeight % dragState.weights[self.id]);
              nextSelfWeight = dragState.weights[self.id];

              delete dragState.weights[self.id];

              if (Object.keys(dragState.weights).length === 0) {
                /* We need to reset the state when this 
                   happens so that we can handle if the 
                   user now moves in the other direction */
                delete dragState.originalType;
                delete dragState.indexToCompare;
              } else {
                dragState.indexToCompare =
                  type === "child"
                    ? self.childIndex - edge.nextIndexOp
                    : self.childIndex + edge.nextIndexOp;
              }
            }
          }

          self[STATE].weight = nextSelfWeight;
          nextSibling[STATE].weight = nextSiblingWeight;

          if (edge.parent[STATE].provider) {
            edge.parent[STATE].provider.updateProviderState();
          }
          break;
        }
      }
    },

    getEdgeInDirection(childToGet: RDG$Child, direction: RDG$Directions) {
      if (hasProp(childToGet[STATE].neighbors, direction)) {
        return childToGet[STATE].neighbors[direction];
      }

      const childToGetParent = childToGet[STATE].parent;

      if (!childToGet[STATE].parent) {
        childToGet[STATE].neighbors[direction] = {
          resizable: false,
          childIndex: 0,
          nextIndexOp: null,
          neighborIndex: null,
          parent: childToGetParent,
          child: childToGetParent,
          neighbor: childToGetParent
        };
        return childToGet[STATE].neighbors[direction];
      }

      const checkDirection =
        direction === "top" || direction === "bottom" ? "v" : "h";

      const axis = checkDirection === "v" ? "height" : "width";

      const nextIndexOp = direction === "left" || direction === "top" ? -1 : 1;

      let child = childToGet;
      let parent = childToGetParent;

      function getIndexToCompare() {
        return direction === "left" || direction === "top"
          ? 0
          : parent[STATE].children.length - 1;
      }

      while (
        parent &&
        (parent.direction !== checkDirection ||
          child.childIndex === getIndexToCompare())
      ) {
        child = parent;
        parent = parent[STATE].parent;
      }

      if (!parent) {
        childToGet[STATE].neighbors[direction] = {
          resizable: false,
          childIndex: 0,
          nextIndexOp: null,
          neighborIndex: null,
          parent,
          child: parent,
          neighbor: parent
        };
        return childToGet[STATE].neighbors[direction];
      }

      const childIndex = child.childIndex;
      const neighborIndex = childIndex + nextIndexOp;

      const neighbor = parent[STATE].children[neighborIndex];

      const resizable =
        neighbor.depth >= childToGet.depth && neighbor.index > child.index;

      childToGet[STATE].neighbors[direction] = {
        resizable,
        axis,
        nextIndexOp,
        childIndex,
        neighborIndex,
        parent,
        child,
        neighbor
      };

      return childToGet[STATE].neighbors[direction];
    },

    getChildIndex(grid: RDG$Grid, child: RDG$Child) {
      if (hasProp(grid[STATE].childIndexByID, child.id)) {
        return grid[STATE].childIndexByID[child.id];
      }
      for (const [idx, gridChild] of grid[STATE].children.entries()) {
        grid[STATE].childIndexByID[gridChild.id] = idx;
        if (gridChild === child) {
          return idx;
        }
      }
      return -1;
    },

    pushChild(
      parent: RDG$Child,
      type: "grid" | "tile",
      childProps?: Object = EMPTY_OBJECT,
      _child?: RDG$Child,
      _commit
    ) {
      const prop = parent[GRID] ? "children" : "tabs";
      const commit = controller.create.commit(_commit);

      if (_child) {
        controller.removeChildFromParent(_child, commit);
        _child[STATE].parent = parent;
        controller.setChild(_child);
      }

      const child =
        _child || controller.create[type](parent, childProps, commit);

      parent[STATE][prop].push(child);

      commit.changed(parent);

      return commit;
    },

    removeChildFromParent(child: RDG$Child, _commit) {
      const commit = controller.create.commit(_commit);
      controller.removeChild(child[STATE].parent, child, commit);
      child[STATE].weight = undefined;
      child[STATE].parent = undefined;
      return commit;
    },

    removeChild(grid: RDG$Grid, child: RDG$Child, _commit) {
      const commit = controller.create.commit(_commit);
      if (controller.hasChild(grid, child)) {
        grid[STATE].children = grid[STATE].children.reduce(
          (children, gridChild) => {
            if (gridChild === child) {
              controller.unsetChild(child);
              commit.changed(grid);
            } else {
              children.push(child);
            }
            return children;
          },
          []
        );
      }
      return commit;
    },

    deserializeChildren(grid: RDG$Grid, _commit: RDG$Commit) {
      const { children } = grid;
      const newChildren = [];
      grid[STATE].children = newChildren;

      const commit = controller.create.commit(_commit);

      for (const child of children) {
        if (!child) continue;
        if (child[GRID] || child[TILE]) {
          newChildren.push(child);
        } else if (Array.isArray(child.children)) {
          controller.pushChild(grid, "grid", child, undefined, commit);
        } else {
          controller.pushChild(grid, "tile", child, undefined, commit);
        }
      }

      return commit;
    },

    deserializeTabs(tile: RDG$Node, _commit: RDG$Commit) {
      const { tabs } = tile;
      const newTabs = [];
      tile[STATE].tabs = newTabs;

      const commit = controller.create.commit(_commit);

      for (const child of tabs) {
        if (!child) continue;
        if (child[GRID] || child[TILE]) {
          newTabs.push(child);
        } else if (child.componentID) {
          controller.pushChild(tile, "tile", child, undefined, commit);
        }
      }

      return commit;
    },

    renderTile(tile, box) {
      // we wait until we have the ref for the
      // tile before rendering
      if (!box) return null;
      if (!controller.config.widgets) {
        if (controller.config.renderTile) {
          return controller.config.renderTile(tile, box);
        }
        return tile.componentID;
      }
      return renderWidget(tile, box, controller);
    }
  };

  controller.grid = createGridNode(
    controller,
    "grid",
    null,
    rootProvider.config.initialGrid
  );

  return Object.freeze(controller);
}
