import { COMMIT, GRID, STATE } from "./constants";

import { resetChildState } from "./utils";

let timeoutID;

const Queue = new Set();

function flushQueue() {
  timeoutID = undefined;
  Queue.forEach(commit => commit.commit(false));
  Queue.clear();
}

/**
 * A grid commit provides a means to make multiple
 * updates to the grid then flush them (render) in
 * bulk rather than every change generating a render
 * along the way.
 *
 * Commits are automatically queued then flushed on
 * the nextTick (implemented as setTimeout of 0) if
 * the commit was not yet rendered (with commit.commit()).
 *
 * In most cases this is for internal use but it is exposed
 * if the `setState` call is ever called directly upon a
 * grid node by the user (it is unclear if that will be
 * at all useful at this time and may be removed in the
 * future).
 */
export default function createGridCommit(controller) {
  if (!timeoutID) {
    timeoutID = setTimeout(flushQueue);
  }
  const id = controller.getNextCommitID();
  // console.log("Commit: ", id);
  const commit = {
    [COMMIT]: true,
    id,
    complete: false,
    rendered: false,
    dirty: false,
    changes: {
      changedGrids: new Set(),
      changedTiles: new Set()
    },
    changed(child) {
      if (child[GRID]) {
        commit.changes.changedGrids.add(child);
      } else {
        commit.changes.changedTiles.add(child);
      }
      commit.dirty = true;
      resetChildState(child);
    },
    commit(removeFromQueue = true) {
      if (commit.complete) return commit;
      commit.complete = true;
      if (commit.dirty) {
        commit.render();
      }
      if (removeFromQueue) {
        Queue.delete(commit);
      }
      return commit;
    },
    render() {
      commit.changes.changedGrids.forEach(grid => {
        if (grid[STATE].provider) {
          grid[STATE].provider.updateProviderState();
        }
      });
      commit.changes.changedTiles.forEach(tile => {
        if (commit.changes.changedGrids.has(tile[STATE].parent)) {
          return;
        }
        if (tile[STATE].component) {
          tile[STATE].component.forceUpdate();
        }
      });
    }
  };

  Queue.add(commit);

  return commit;
}
