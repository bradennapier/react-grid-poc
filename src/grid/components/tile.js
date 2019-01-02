import * as React from "react";

import { STATE } from "../constants";

import { ThemeContext } from "../context";

import { renderSplits } from "./split";

export default class GridTile extends React.PureComponent {
  static contextType = ThemeContext;

  constructor(props, context) {
    super(props, context);
    const { controller, tile } = props;
    tile[STATE].component = this;

    const edges = controller.getChildEdges(props.tile);
    // When implementing drag and drop we will likely
    // need to consider this and re-render as-needed.
    this.splits = renderSplits(controller, edges, context);
  }

  handleRef = ref => {
    const { tile } = this.props;
    if (tile[STATE].ref !== ref) {
      tile[STATE].ref = ref;
      this.forceUpdate();
    }
  };

  render() {
    const { tile, controller } = this.props;
    const { TileWrapper } = this.context;

    const box = tile.ref ? tile.ref.getBoundingClientRect() : null;

    return (
      <TileWrapper
        weight={tile.weight}
        box={box}
        ref={this.handleRef}
        constraints={tile.constraints}
      >
        {controller.renderTile(tile, box)}
        {this.splits}
      </TileWrapper>
    );
  }
}
