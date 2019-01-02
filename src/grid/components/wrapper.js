import * as React from "react";

import { DragDropContextProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

import createGridController from "../controller";

import { getGridConfig } from "../utils";
import { nextDynamicGridID } from "../identity";

import GridProvider from "./provider";
import GridComponent from "./grid";

import { DropZoneContext, ThemeContext, GridConfigContext } from "../context";

export default class GridRootWrapper extends React.PureComponent {
  identity = nextDynamicGridID();

  render() {
    console.log("Grid Wrapper Renders!", this);

    this.config = getGridConfig(this.props);

    if (!this.controller) {
      this.controller = createGridController(this);
    }

    const { debug, theme, cssVariables } = this.config;
    const { grid } = this.controller;
    const { DynamicGridWrapper } = theme;

    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <GridConfigContext.Provider value={this.config}>
          <ThemeContext.Provider value={theme}>
            <DropZoneContext.Provider value={this.config.dropZone}>
              <GridProvider isRoot controller={this.controller} grid={grid}>
                <DynamicGridWrapper debug={debug} cssVariables={cssVariables}>
                  <GridComponent grid={grid} />
                </DynamicGridWrapper>
              </GridProvider>
            </DropZoneContext.Provider>
          </ThemeContext.Provider>
        </GridConfigContext.Provider>
      </DragDropContextProvider>
    );
  }
}
