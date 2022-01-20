import createDom from '@antv/dom-util/lib/create-dom';
import modifyCSS from '@antv/dom-util/lib/modify-css';

import Base from '../base';

type Matrix = number[];

interface GridConfig {
  img?: string;
}

interface ViewPortEventParam {
  action: string;
  matrix: Matrix;
}

const GRID =
  'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj4NCiAgPGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZWFlYWVhIiBzdHJva2Utd2lkdGg9IjEiPg0KICAgIDxyZWN0IHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgc3Ryb2tlPSJub25lIi8+DQogICAgPHJlY3QgeD0iMC41IiB5PSIwLjUiIHdpZHRoPSI0OS41IiBoZWlnaHQ9IjQ5LjUiIGZpbGw9Im5vbmUiLz4NCiAgPC9nPg0KPC9zdmc+DQo=)';

class Grid extends Base {
  public getDefaultCfgs(): GridConfig {
    return {
      img: GRID,
    };
  }

  init() {
    const graph = this.get('graph');
    const minZoom = graph.get('minZoom');
    const graphContainer = graph.get('container');
    const canvas = graph.get('canvas').get('el');
    const width = graph.get('width');
    const height = graph.get('height');
    const container = createDom(
      `<div class='g6-grid-container' style="position: absolute; left:0;top:0;right:0;bottom:0;overflow: hidden;z-index: -1;"></div>`,
    );
    const gridContainer = createDom(
      `<div 
        class='g6-grid' 
        style='position:absolute;
        transform-origin: 0% 0% 0px;
        background-image: ${GRID};
        user-select: none
      '></div>`,
    );

    container.appendChild(gridContainer);

    modifyCSS(container, {
      width: `${width}px`,
      height: `${height}px`,
      left: `${graphContainer.offsetLeft}px`,
      top: `${graphContainer.offsetTop}px`,
    });
    modifyCSS(gridContainer, {
      width: `${width / minZoom}px`,
      height: `${height / minZoom}px`,
      left: `0px`,
      top: `0px`,
    });

    graphContainer.insertBefore(container, canvas);

    this.set('container', container);
    this.set('gridContainer', gridContainer);
  }

  getEvents() {
    return {
      containersizechange: 'updateContainer',
      viewportchange: 'updateGrid',
    };
  }

  updateContainer() {
    const graph = this.get('graph');
    const width = graph.get('width');
    const height = graph.get('height');
    const container = this.get('container');

    modifyCSS(container, {
      width: `${width}px`,
      height: `${height}px`,
    });
  }

  updateGrid(e: ViewPortEventParam) {
    const gridContainer = this.get('gridContainer');
    let { matrix } = e;
    if (!matrix) matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];

    const transform = `matrix(${matrix[0]}, ${matrix[1]}, ${matrix[3]}, ${matrix[4]}, 0, 0)`;

    modifyCSS(gridContainer, {
      transform,
    });
  }

  getContainer() {
    return this.get('container');
  }

  destroy() {
    const graph = this.get('graph');
    const graphContainer = graph.get('container');
    const container: HTMLDivElement = this.get('container');

    graphContainer.removeChild(container);
  }
}

export default Grid;
