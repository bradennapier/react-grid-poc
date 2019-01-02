import * as React from "react";

import GridProvider from "./provider";
import TileComponent from "./tile";

import { STATE, GRID } from "../constants";

import { GridContext, ThemeContext } from "../context";

import { renderSplits } from "./split";

class GridContent extends React.PureComponent {
  static contextType = ThemeContext;

  constructor(props, theme) {
    super(props, theme);

    const { grid, controller } = props;
    grid[STATE].component = this;

    const edges = controller.getChildEdges(grid);

    this.splits = renderSplits(controller, edges, theme);
  }

  handleRef = ref => {
    const { grid } = this.props;
    grid[STATE].ref = ref;
  };

  render() {
    const { grid, controller } = this.props;
    const { GridWrapper } = this.context;

    return (
      <GridContext.Consumer>
        {({ renderID }) => (
          <GridWrapper
            id={grid.id}
            weight={grid.weight}
            direction={grid.direction}
            ref={this.handleRef}
            constraints={grid.constraints}
          >
            {grid.children.map(child =>
              child[GRID] ? (
                <GridComponent
                  key={child.id}
                  renderID={renderID}
                  controller={controller}
                  grid={child}
                />
              ) : (
                <TileComponent
                  key={child.id}
                  renderID={renderID}
                  controller={controller}
                  tile={child}
                />
              )
            )}
            {this.splits}
          </GridWrapper>
        )}
      </GridContext.Consumer>
    );
  }
}

class GridComponent extends React.Component {
  static contextType = GridContext;

  render() {
    const { grid } = this.props;
    const { renderID, controller } = this.context;
    return (
      <GridProvider
        grid={grid}
        parentRenderID={renderID}
        controller={controller}
      >
        <GridContent grid={grid} controller={controller} />
      </GridProvider>
    );
  }
}

export default GridComponent;
