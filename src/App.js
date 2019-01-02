import React, { Component } from "react";
import { css } from "styled-components/macro";

import "./App.css";

import DynamicGrid from "./grid";
import * as theme from "./grid/themes/dark";

const CSS_OVERRIDES = css`
  --dg-tile-padding: 1px;

  --dg-widget-border-radius: 2px;
  --dg-widget-content-background: whitesmoke;
`;

const GRID_CONSTRAINTS = {
  width: {
    minPx: 200,
    minPct: 10
  }
};

const INITIAL_GRID = {
  direction: "h",
  children: [
    {
      componentID: "A",
      weight: 30
    },
    {
      direction: "v",
      weight: 30,
      children: [
        {
          weight: 20,
          direction: "h",
          children: [
            {
              weight: 50,
              activeTab: 1,
              tabs: [
                {
                  title: "Tab One",
                  componentID: "B"
                },
                {
                  title: "Tab Two",
                  componentID: "Z"
                }
              ]
            },
            {
              componentID: "C",
              weight: 50
            }
          ]
        },
        {
          direction: "h",
          weight: 80,
          children: [
            {
              direction: "v",
              weight: 50,
              children: [
                {
                  direction: "h",
                  weight: 50,
                  children: [
                    {
                      componentID: "D",
                      weight: 50,
                      constraints: {
                        width: {
                          minPx: 350
                        }
                      }
                    },
                    {
                      componentID: "E",
                      weight: 50
                    }
                  ]
                },
                {
                  componentID: "F",
                  weight: 50
                }
              ]
            },
            {
              componentID: "G",
              weight: 50
            }
          ]
        }
      ]
    },
    {
      componentID: "H",
      weight: 20
    },
    {
      componentID: "I",
      weight: 20
    }
  ]
};

class GridRoot extends React.Component {
  gridProps = {
    theme,
    cssVariables: CSS_OVERRIDES,
    initialGrid: INITIAL_GRID,
    constraints: GRID_CONSTRAINTS,
    defaults: {},
    tabbed: true,
    widgets: true,
    resizeStyle: "stateful",
    // resizeStyle: "push",
    // resizeStyle: "passive",
    debug: {
      size: true
    },
    renderTile(tile, box) {
      // console.log("Render Tile: ", tile.componentID);
      return tile.componentID;
    }
  };
  // componentDidMount() {
  //   setTimeout(() => {
  //     this.gridProps.tabbed = false;
  //     this.forceUpdate();
  //   }, 1000);
  // }
  render() {
    return (
      <div
        style={{
          backgroundColor: "whitesmoke",
          position: "fixed",
          top: 10,
          bottom: 10,
          left: 10,
          right: 10
        }}
      >
        <DynamicGrid {...this.gridProps} />
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <GridRoot />
      </div>
    );
  }
}

export default App;
