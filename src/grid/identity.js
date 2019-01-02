export opaque type RDG$TileID: string = string;
export opaque type RDG$GridID: string = string;
export opaque type RDG$DGID: string = string;

export opaque type RDG$CommitID: number = number;

let currentDGID = 0;
let index = 0;

export function nextDynamicGridID(): RDG$DGID {
  currentDGID += 1;
  index += 1;
  return {
    id: `dg-${currentDGID}`,
    index
  };
}

export function nextTileID(refs): RDG$TileID {
  refs.tile += 1;
  index += 1;
  return {
    id: `${refs.dg}-tile-${refs.tile}`,
    index
  };
}

export function nextGridID(refs): RDG$GridID {
  refs.grid += 1;
  index += 1;
  return {
    id: `${refs.dg}-grid-${refs.grid}`,
    index
  };
}

export function typeofChildID(id: RDG$ChildID) {
  if (id.includes("grid")) {
    return "grid";
  } else {
    return "tile";
  }
}

export function nextCommitID(refs): RDG$CommitID {
  refs.commitID += 1;
  return refs.commitID;
}
