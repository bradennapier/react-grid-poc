import * as React from "react";

import { GridContext } from "../context";

import { STATE } from "../constants";

// Sanity Check in case renderID reaches MAX_SAFE_INTEGER
// so that we can reset to 1.
function getNextRenderID(prevRenderID) {
  return prevRenderID >= Number.MAX_SAFE_INTEGER ? 1 : prevRenderID + 1;
}

export default class GridProvider extends React.Component {
  static contextType = GridContext;

  static getDerivedStateFromProps(props, state) {
    /* Check if root renderID Changed */
    if (
      props.parentRenderID > state.parentRenderID ||
      /* in the very unlikely case we reach max integer, 
         we need to reset to 1 */
      (props.parentRenderID === 1 && state.parentRenderID > 1)
    ) {
      return {
        parentRenderID: props.parentRenderID,
        renderID: getNextRenderID(state.renderID)
      };
    }
    return null;
  }

  constructor(props) {
    super(props);

    const { isRoot, controller, grid } = props;

    grid[STATE].provider = this;

    this.state = {
      controller,
      grid,
      renderID: 0,
      parentRenderID: isRoot ? 0 : props.parentRenderID
    };
  }

  updateProviderState(nextState = {}) {
    const { isRoot } = this.props;

    const nextRenderID = getNextRenderID(this.state.renderID);

    this.setState({
      parentRenderID: isRoot ? nextRenderID : this.state.parentRenderID,
      renderID: nextRenderID,
      ...nextState
    });
  }

  render() {
    // console.log("Provider Updates: ", this.props.grid.id, this.state);
    return (
      <GridContext.Provider value={this.state}>
        {this.props.children}
      </GridContext.Provider>
    );
  }
}
