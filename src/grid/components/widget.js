import * as React from "react";

import { ThemeContext, GridConfigContext } from "../context";
import GridDropZoneController from "./dropzone";

// import { TILE } from "../constants";

export function renderWidget(tile, box, controller) {
  return <TileWidget tile={tile} box={box} controller={controller} />;
}

function WidgetTab({ controller, theme, isActive, child, index, onClick }) {
  const { TileWidgetTabWrapper, TileWidgetTabTitleContainer } = theme;
  return (
    <TileWidgetTabWrapper isActive={isActive} onClick={() => onClick(index)}>
      <TileWidgetTabTitleContainer>
        {controller.config.renderTitle(child, isActive, index)}
      </TileWidgetTabTitleContainer>
    </TileWidgetTabWrapper>
  );
}

function WidgetTabs(props) {
  const { controller, tile, theme, onClick } = props;
  const { TileWidgetTabsWrapper } = theme;

  const tabsToRender = !tile.tabs
    ? [
        <WidgetTab
          key={tile.id}
          controller={controller}
          child={tile}
          theme={theme}
          isActive
          onClick={() => {}}
        />
      ]
    : tile.tabs.map((tabChild, idx) => {
        return (
          <WidgetTab
            key={tabChild.id}
            controller={controller}
            index={idx}
            child={tabChild}
            theme={theme}
            isActive={tile.activeTab === idx}
            onClick={onClick}
          />
        );
      });

  return <TileWidgetTabsWrapper>{tabsToRender}</TileWidgetTabsWrapper>;
}

export default class TileWidget extends React.Component {
  static contextType = GridConfigContext;

  handleTabClick = activeTab => {
    const { tile } = this.props;
    tile
      .setState({
        activeTab
      })
      .commit();
  };

  render() {
    const { tile, box, controller } = this.props;
    const { tabbed } = this.context;

    const childToRender = !tile.tabs ? tile : tile.tabs[tile.activeTab || 0];

    return (
      <ThemeContext.Consumer>
        {Theme => (
          <Theme.TileWidgetWrapper>
            <Theme.TileWidgetContainer tabbed={tabbed}>
              {tabbed ? (
                <WidgetTabs
                  controller={controller}
                  theme={Theme}
                  tile={tile}
                  onClick={this.handleTabClick}
                />
              ) : (
                <Theme.TileWidgetToolbar>
                  {controller.config.renderTitle(childToRender)}
                </Theme.TileWidgetToolbar>
              )}
              <Theme.TileWidgetContent>
                {controller.config.renderTile(childToRender, box)}
              </Theme.TileWidgetContent>
            </Theme.TileWidgetContainer>
            <GridDropZoneController />
          </Theme.TileWidgetWrapper>
        )}
      </ThemeContext.Consumer>
    );
  }
}
