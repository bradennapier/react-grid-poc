import styled from "styled-components/macro";

/**
 * THEMES
 *
 * We have intentionally designed the themeing system
 * in a way that makes it easy to cascade and control
 * every aspect of the styling for the grid.
 *
 * Our top-level grid implements css variables for the
 * key customizable aspects.  This makes it simple to
 * provide overrides dynamically and efficiently by
 * either simply setting the var on the element itself
 * or by providing the `cssVariables` property
 * on the root level or tile level elements.
 *
 * Custom themes may be provided by using the below
 * as a template and importing them.
 *
 * In the setup below we can do `import * as theme from './themes/dark'`.
 * Providing the `theme` prop to the `DynamicGrid` will use the
 * given `theme` (and can be changed dynamically if needed).
 *
 * Using variables this way also means that changing the `cssVariables`
 * prop itself does not need to actually re-render any components since
 * we are simply changing the style for a single element.
 *
 * The best way to build and provide css overrides for the
 * variables is to build them using the `css` property from
 * `styled-components`.  This way we get syntax highlighting
 * as well - sweet!
 *
 * import { css } from "styled-components/macro";
 *
 * const CSS_OVERRIDES = css`
 *    --dg-tile-padding: 1px;
 *    --dg-widget-border-radius: 2px;
 *    --dg-widget-content-background: whitesmoke;
 * `;
 *
 * `tl;dr` - CSS Variables are awesome!
 */
export const DynamicGridWrapper = styled.div`
  --dg-backdrop: ${props => (props.debug.grid ? "#aaa" : "unset")};

  --dg-grid-border: ${props => (props.debug.grid ? "1px solid red" : "0")};
  --dg-grid-margin: ${props => (props.debug.grid ? "2px" : "0px")};
  --dg-grid-padding: ${props => (props.debug.grid ? "2px" : "0px")};

  --dg-split-width: 4px;
  --dg-split-area: 10px;
  --dg-split-color: #137cbd;
  --dg-split-cursor-resize-col: col-resize;
  --dg-split-cursor-resize-row: row-resize;

  --dg-tile-padding: 0px;
  --dg-tile-margin: ${props => (props.debug.grid ? "2px" : "0px")};
  --dg-tile-background: unset;

  --dg-widget-margin: 0;
  --dg-widget-border: ${props =>
    props.debug.grid ? "1px solid blue" : "1px solid black"};
  --dg-widget-border-radius: 2px;
  --dg-widget-box-shadow: 0 1px 1px rgba(16, 22, 26, 0.4);

  --dg-widget-tabbar-height: 30px;
  --dg-widget-tabbar-background: #121519;

  --dg-widget-tab-padding: 10px;
  --dg-widget-tab-border: 1px solid black;
  --dg-widget-tab-active-border: 1px solid rgba(200, 200, 200, 0.3);
  --dg-widget-tab-background: linear-gradient(to bottom, #121519, #303641);
  --dg-widget-tab-background-hovered: linear-gradient(to top, #303641, #3d4554);
  --dg-widget-tab-active-background: #303641;

  --dg-widget-toolbar-height: 30px;
  --dg-widget-toolbar-background: linear-gradient(to bottom, #121519, #303641);
  --dg-widget-toolbar-background-hovered: linear-gradient(
    to top,
    #121519,
    #454a54
  );

  --dg-widget-content-background: transparent;

  ${props => props.cssVariables};

  display: flex;
  background: var(--dg-backdrop);

  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  padding: 0;
  margin: 0;
`;

export const GridWrapper = styled.div.attrs(props => ({
  style: {
    flexBasis: `${props.weight}%`
  }
}))`
  box-sizing: border-box;
  display: flex;
  flex-direction: ${props => (props.direction === "v" ? "column" : "row")};
  position: relative;

  min-width: ${props =>
    `calc(${props.constraints.width.minPx}px + var(--dg-tile-margin))`};
  min-height: ${props =>
    `calc(${props.constraints.height.minPx}px + var(--dg-tile-margin))`};

  width: 100%;
  height: 100%;

  border: var(--dg-grid-border);
  padding: var(--dg-grid-padding);
  margin: var(--dg-grid-margin);

  /* z-index: 1; */
`;

export const GridDropZoneWrapper = styled.div`
  user-select: none;
  box-sizing: border-box;

  pointer-events: ${props => (props.isActive ? "auto" : "none !important")};

  position: absolute;
  top: var(--dg-tile-padding);
  bottom: var(--dg-tile-padding);
  left: var(--dg-tile-padding);
  right: var(--dg-tile-padding);
`;

export const GridDropZoneContainer = styled.div`
  position: absolute;
  top: ${props => props.top};
  bottom: ${props => props.bottom};
  left: ${props => props.left};
  right: ${props => props.right};

  width: ${props => (props.direction === "v" ? "100%" : "40%")};
  height: ${props => (props.direction === "h" ? "100%" : "40%")};
  opacity: 0;

  &::after {
    content: "";
    display: flex;

    background-color: #137cbd25;

    position: absolute;
    top: ${props => props.top};
    bottom: ${props => props.bottom};
    left: ${props => props.left};
    right: ${props => props.right};

    width: ${props => (props.direction === "v" ? "100%" : "80%")};
    height: ${props => (props.direction === "h" ? "100%" : "80%")};

    opacity: 1;
    transition: opacity 0.3s ease;
  }
`;

export const TileWrapper = styled.div.attrs(props => ({
  style: {
    flexBasis: `${props.weight}%`
  }
}))`
  box-sizing: border-box;
  display: flex;

  background: var(--dg-tile-background);

  position: relative;

  min-width: ${props => `${props.constraints.width.minPx}px`};
  min-height: ${props => `${props.constraints.height.minPx}px`};

  height: 100%;
  width: 100%;

  padding: var(--dg-tile-padding);
`;

export const TileWidgetWrapper = styled.div`
  ${props => props.cssVariables};

  position: relative;

  border: var(--dg-widget-border);
  border-radius: var(--dg-widget-border-radius);
  box-shadow: var(--dg-widget-box-shadow);

  flex: 1;

  margin: var(--dg-widget-margin);
`;

export const TileWidgetContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  display: grid;
  grid-template-rows: ${props =>
    props.tabbed
      ? `var(--dg-widget-tabbar-height) auto`
      : `var(--dg-widget-toolbar-height) auto`};
`;

export const TileWidgetTabsWrapper = styled.div`
  display: flex;
  color: whitesmoke;
  align-items: flex-end;
  height: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
  background: var(--dg-widget-tabbar-background);
  background-repeat: no-repeat;
  border-bottom: 1px solid black;
  cursor: move;
`;

export const TileWidgetTabWrapper = styled.div.attrs(props => ({
  style: {
    borderTop: props.isActive
      ? "var(--dg-widget-tab-active-border)"
      : "var(--dg-widget-tab-border)",
    borderRight: props.isActive
      ? "var(--dg-widget-tab-active-border)"
      : "var(--dg-widget-tab-border)",
    borderLeft: props.isActive
      ? "var(--dg-widget-tab-active-border)"
      : "var(--dg-widget-tab-border)"
  }
}))`
  display: flex;
  height: 100%;

  align-items: center;
  justify-content: center;
  padding-left: var(--dg-widget-tab-padding);
  padding-right: var(--dg-widget-tab-padding);
  background: var(--dg-widget-tab-background);
  margin-right: 1px;
  cursor: pointer;

  position: relative;

  &::after {
    content: "";
    display: flex;
    position: absolute;

    top: 0;
    left: 0;
    right: 0;
    left: 0;
    border-top-right-radius: 3px;
    border-top-left-radius: 3px;

    background: ${props =>
      props.isActive
        ? "var(--dg-widget-tab-active-background)"
        : "transparent"};

    width: 100%;
    height: 100%;
    z-index: 1;
  }

  &:hover {
    &::after {
      background: var(--dg-widget-tab-background-hovered);
    }
  }
`;

export const TileWidgetTabTitleContainer = styled.div`
  user-select: none;
  position: relative;
  white-space: nowrap;
  z-index: 2;
`;

export const TileWidgetToolbar = styled.div`
  user-select: none;
  cursor: move;

  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  color: whitesmoke;

  background: var(--dg-widget-toolbar-background);
  background-repeat: no-repeat;

  &:hover {
    background: var(--dg-widget-toolbar-background-hovered);
    background-repeat: no-repeat;
  }
`;

export const TileWidgetContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  background: var(--dg-widget-content-background);
`;

export const GridSplit = styled.div`
  user-select: none;

  cursor: ${props =>
    props.direction === "h"
      ? "var(--dg-split-cursor-resize-col)"
      : "var(--dg-split-cursor-resize-row)"};

  display: flex;
  flex-direction: ${props => (props.direction === "v" ? "column" : "row")};
  justify-content: center;

  position: absolute;
  top: ${props => props.top};
  bottom: ${props => props.bottom};
  left: ${props => props.left};
  right: ${props => props.right};

  width: ${props =>
    props.direction === "v" ? "unset" : "var(--dg-split-area)"};
  height: ${props =>
    props.direction === "h" ? "unset" : "var(--dg-split-area)"};

  z-index: 9000;

  opacity: ${props => (props.isDragging ? 1 : 0)};
  transition: opacity 0.2s;
  will-change: opacity;

  &::after {
    content: "";
    display: flex;
    position: relative;
    box-shadow: inset 1px 0 0 var(--dg-split-width) var(--dg-split-color);

    width: ${props =>
      props.direction === "v" ? "unset" : "var(--dg-split-width)"};
    height: ${props =>
      props.direction === "h" ? "unset" : "var(--dg-split-width)"};
  }

  &:hover {
    opacity: 1;
  }
`;
