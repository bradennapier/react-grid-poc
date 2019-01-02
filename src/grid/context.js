import * as React from "react";
import * as theme from "./themes/dark";

/**
 * Each `grid` node is a provider and is used
 * to efficiently render a grid and its children
 * at any point in the heirarchy.
 *
 * It includes:
 *  `controller`
 *  `grid`
 *  `renderID`
 *  `parentRenderID`
 */
export const GridContext = React.createContext();

/**
 * Provides the `theme` which is used to render
 * our `styled-components`.  This will allow
 * the user to set and change the theme that is
 * used and customize the grid as they see fit.
 */
export const ThemeContext = React.createContext({
  theme
});

/**
 * Not yet used but will include information
 * about a drag and drop of a tile that is
 * in progress.
 */
export const DropZoneContext = React.createContext({
  isActive: false
});

/**
 * This is a static value used to capture the `controller.config`
 * property.  These are the properties which are provided by the
 * user via the `props` to the top-level component `DynamicGrid`.
 *
 * We separate this from the `GridContext` so that we can subscribe
 * to only these updates in cases where this is helpful and we don't
 * require the `controller` or `grid` property.
 */
export const GridConfigContext = React.createContext({});
