/* @flow */

import * as React from "react";

import { getPositionalProperties } from "../utils";

const DIRECTION_MAP = {
  left: "h",
  right: "h",
  top: "v",
  bottom: "v"
};

const RESIZE_THROTTLE_MS = 1000 / 30;

const POSITION_VAR = "calc(-1 * (var(--dg-split-area) / 2))";

export function renderSplits(controller, edges, theme) {
  return Object.keys(edges).reduce((splits, side) => {
    const edge = edges[side];
    if (edge.resizable) {
      const id = `split-${edge.child.id}-${side}`;
      return (
        <Split
          id={id}
          key={id}
          edge={edge}
          side={side}
          theme={theme}
          direction={DIRECTION_MAP[side]}
          controller={controller}
        />
      );
    }
    return splits;
  }, []);
}

export default class Split extends React.PureComponent {
  state = {
    isDragging: false
  };

  monitorProp = undefined;
  rectProp = undefined;
  lastEvent = 0;

  constructor(props) {
    super(props);
    this.positionalProperties = getPositionalProperties(
      props.side,
      POSITION_VAR,
      "var(--dg-tile-padding)"
    );
    if (props.direction === "v") {
      this.monitorProp = "pageY";
      this.rectProp = "top";
    } else {
      this.monitorProp = "pageX";
      this.rectProp = "left";
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  startResize = e => {
    if (e) e.preventDefault();
    this.mousePosition = e[this.monitorProp];
    this.dragState = {
      weights: {}
    };
    if (!this.isDragging) {
      // notify
    }
    this.addListeners();
  };

  endResize = e => {
    if (e) e.preventDefault();
    this.dragState = undefined;
    this.lastEvent = 0;
    if (this.state.isDragging) {
      this.removeListeners();
      // notify
    }
  };

  addListeners = () => {
    document.addEventListener("mousemove", this.handleMouseMove, true);
    document.addEventListener("mouseup", this.handleMouseUp, true);
    this.setState({
      isDragging: true
    });
  };

  removeListeners = () => {
    document.removeEventListener("mousemove", this.handleMouseMove, true);
    document.removeEventListener("mouseup", this.handleMouseUp, true);
    this.setState({
      isDragging: false
    });
  };

  handleMouseDown = e => {
    if (e.button !== 0) return;
    if (!this.state.isDragging) this.startResize(e);
  };

  handleMouseUp = e => this.endResize(e);

  /**
   * When the split is being dragged we need to calculate
   * the change that must be rendered.
   *
   * We do this by first seeing how far the mouse has
   * moved from the split element in pixels
   * (and in what direction).
   *
   * Once we have done that, we capture the size of the
   * element that is being dragged into and finally determine
   * what % must be given to the neighboring element and
   * taken from the child element.
   *
   * This is then rendered as a change to the `flex-basis`
   * property on the appropriate containers.
   *
   * @see [../controller.js] controller.resizeFromSplit
   */
  handleMouseMove = e => {
    e.preventDefault();
    e.stopPropagation();

    const now = Date.now();

    if (now - this.lastEvent >= RESIZE_THROTTLE_MS) {
      const { direction, edge, controller } = this.props;

      const mouse = e[this.monitorProp];
      const mouseMovedPx = mouse - this.mousePosition;
      this.mousePosition = e[this.monitorProp];

      const mouseMovedAbs = Math.abs(mouseMovedPx);

      if (mouseMovedPx === 0) return;

      const hoveredChildType = mouseMovedPx > 0 ? "neighbor" : "child";

      if (!this.dragState.originalType) {
        this.dragState.originalType = hoveredChildType;
      }

      const hoveredChild = edge[hoveredChildType];
      const hoveredBox = hoveredChild.ref.getBoundingClientRect();

      const pctMoved =
        direction === "v"
          ? mouseMovedAbs / hoveredBox.height
          : mouseMovedAbs / hoveredBox.width;

      /* Now we need to calculate what this means
         in terms of the "weight" of the value */
      const weightChange = hoveredChild.weight * pctMoved;

      controller.resizeFromSplit(
        edge,
        hoveredChildType,
        weightChange,
        this.dragState
      );
    }
  };

  render() {
    const {
      id,
      direction,
      side,
      theme: { GridSplit }
    } = this.props;

    return (
      <GridSplit
        ref={ref => {
          this.splitElement = ref;
        }}
        id={id}
        side={side}
        direction={direction}
        isDragging={this.state.isDragging}
        onMouseDown={this.handleMouseDown}
        {...this.positionalProperties}
      />
    );
  }
}
