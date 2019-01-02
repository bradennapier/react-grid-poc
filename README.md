# React Dynamic Grid (Proof of Concept)

This is a proof of concept `heavily` inspired by [react-mosaic](https://github.com/palantir/react-mosaic).

This is currently a research project into what a grid that works nearly identical to `VSCode`, which has implemented a great grid style for their tabs/windows.

### Why not PR?

Simply because I wasn't sure how this would be done in the first place and it was a fun challenge. I also use Flow over Typescript so there's the learning curve there to deal with for now.

### Benefits / Changes over `react-mosaic`

- Tree vs Binary Tree Format (fixes [react-mosaic#31](https://github.com/palantir/react-mosaic/issues/31))
- Provides optional context to children for more performant rendering (fixes [react-mosaic#79](https://github.com/palantir/react-mosaic/issues/79) among other things).
  - For example, `isDragging`, `height`, `width`, `position`, and more are planned (with the latter 3 currently implemented) (fixes [react-mosaic#69](https://github.com/palantir/react-mosaic/issues/69)).

* Stateful Resizing which is how VSCode works. Resizing will move sibling elements further than one step in the tree if needed and if dragged back again the windows return to their original sizes.
  - This is customizable with options `stateful`, `push`, `passive`. [More Info](https://github.com/bradennapier/react-grid-poc/blob/master/src/grid/controller.js#L110-L154)

![](./docs/DG-StatefulResize.gif)

- Utilizes `styled-components` and CSS Variables for extremely simple theming capabilities. Best to just read the [defaultTheme](./src/grid/themes/dark/index.js) comments to see how this works. Makes dynamic styling extremely efficient but is also not technically dependent on `styled-components`. The components exported could be provided by another means if desired.

* Tabbed windows opt-in (fixes [react-mosaic#50](https://github.com/palantir/react-mosaic/issues/50)).

<img src="./docs/DG-Tabbed.png" width="400px" />

- Extremely simple to serialize, similar to `react-mosaic` by simply `JSON.stringify(grid)`.

### Currently Missing

- Drag & Drop (have to learn React DnD still :-P).
- Flow Typing is not finished or really implemented aside from basic structure for it. Won't be hard to get 100% coverage here though as the overall structures are simple.
