/* @flow */
import type { RDG$TileID, RDG$CommitID, RDG$GridID } from "./utils";

export type RDG$ChildID = RDG$TileID | RDG$GridID;

export type RDG$Node = {|
  id: RDG$TileID
|};

export type RDG$Grid = {|
  id: RDG$GridID,
  direction: "h" | "v",
  children: Array<RDG$Node | RDG$Grid>
|};

export type RDG$Child = RDG$Grid | RDG$Grid;

export type RDG$DynamicGrid = {|
  utils: {|
    getNodeByID(id: RDG$NodeID): void | RDG$Node,
    getGridByID(id: RDG$GridID): void | RDG$Grid
  |},
  +grid: RDG$Grid
|};

export type RDG$Commit = {
  [commitSymbol: Symbol]: true,
  id: RDG$CommitID,
  complete: boolean,
  changes: {
    changedGrids: Set<RDG$Grid>
  },
  commit(renderCommit?: boolean): RDG$Commit
};

export type RDG$Directions = "top" | "bottom" | "left" | "right";

// export type RDG$SerializedNode = {
//   weight: void | number,
//   componentID: string
// };

// export type RDG$SerializedGrid = {
//   direction: "v" | "h",
//   children: Array<RDG$SerializedGrid | RDG$SerializedNode>,
//   weight: void | number
// };

// export type RDG$ComponentMap = {
//   [componentID: string]: React.Node
// };

export type RDG$InitialConfig = {
  components: RDG$ComponentMap,
  grid: RDG$SerializedGrid
};
