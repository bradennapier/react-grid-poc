/*
  These utilities have been written in 
  anticipation of needing them for planned 
  features in the future.  They generally 
  belong as part of `controller`

  They have been moved here for now to reduce 
  the cognitive overhead with the current 
  working utilities.
*/

/*

getChildByID: (id: RDG$ChildID) => {
  const type = typeofChildID(id);
  if (type === "grid") {
    return controller.getGridByID(id);
  }
  return controller.getNodeByID(id);
},

getChildAncestors(child: RDG$Child) {
  if (child[STATE].ancestors) return child[STATE].ancestors;
  child[STATE].ancestors = new Set();
  let ancestor = child[STATE].parent;
  while (ancestor) {
    child[STATE].ancestors.add(ancestor);
    ancestor = ancestor[STATE].parent;
  }
  return child[STATE].ancestors;
},

childHasAncestor(child: RDG$Child, gridID: RDG$GridID) {
  const grid = controller.getGridByID(gridID);
  return controller.getAncestors(child).has(grid);
},

childHasSibling(child: RDG$Child, childID: RDG$ChildID) {
  if (!child[STATE].parent) return false;
  return controller.hasChild(child[STATE].parent, childID);
},

getChildNearestSibling(child: RDG$Child, n: -1 | 1) {
  const sibling = child.parent.children[child.childIndex + n];
  if (sibling) return sibling;
  return null;
},

getChildNeighbors(child: RDG$Child) {
  return Object.freeze({
    top: controller.getNeighborInDirection(child, "top"),
    bottom: controller.getNeighborInDirection(child, "bottom"),
    left: controller.getNeighborInDirection(child, "left"),
    right: controller.getNeighborInDirection(child, "right")
  });
},

getChildNeighborInDirection(child: RDG$Child, direction: RDG$Directions) {
  return controller.getEdgeInDirection(child, direction).neighbor;
},

// Note that this will likely need to be updated 
// to work similar to resizing from a `Split` works.
resizeFromDirection(
  child: RDG$Child,
  direction: RDG$Directions,
  amount: number,
  _commit
) {
  const commit = controller.create.commit(_commit);

  const edge = controller.getEdgeInDirection(child, direction);

  edge.child[STATE].weight += amount;
  edge.neighbor[STATE].weight -= amount;

  commit.changed(edge.child);
  commit.changed(edge.neighbor);
  commit.changed(edge.parent);

  return commit;
},

unshiftChild(
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

  parent[STATE][prop].unshift(child);

  commit.changed(parent);

  return commit;
},
*/

// no longer required as we use prototype and
// defineProperty to provide this automatically
// via JSON.stringify(grid);
export function serializeGrid(grid: RDG$Grid) {
  return {
    direction: grid.direction,
    weight: grid.weight,
    children: grid.children.map(child => {
      return child.children
        ? serializeGrid(child)
        : {
            weight: child.weight,
            componentID: child.componentID
          };
    })
  };
}
