import * as React from "react";

import { DropZoneContext, ThemeContext } from "../context";

import { getPositionalProperties } from "../utils";

// Completely Unfinished!

function GridDropZone({ direction, side, theme: { GridDropZoneContainer } }) {
  return (
    <GridDropZoneContainer
      direction={direction}
      {...getPositionalProperties(side, "0", "0")}
    />
  );
}

export default class GridDropZoneController extends React.PureComponent {
  static contextType = DropZoneContext;

  render() {
    const { isActive } = this.context;

    // console.log("Dropzone Controller Renders: ", this.context);

    return (
      <ThemeContext.Consumer>
        {Theme => (
          <Theme.GridDropZoneWrapper isActive={isActive}>
            <GridDropZone direction="v" side="top" theme={Theme} />
            <GridDropZone direction="v" side="bottom" theme={Theme} />
            <GridDropZone direction="h" side="left" theme={Theme} />
            <GridDropZone direction="h" side="right" theme={Theme} />
          </Theme.GridDropZoneWrapper>
        )}
      </ThemeContext.Consumer>
    );
  }
}
