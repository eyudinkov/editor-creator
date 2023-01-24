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
  'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UwZTBlMCIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=)';

class Grid extends Base {
  public getDefaultCfgs(): GridConfig {
    return {
      img: GRID,
    };
  }

  init() {
    const graph = this.get('graph');
    const graphContainer = graph.get('container');
    const canvas = graph.get('canvas').get('el');
    let img = this.get('img') || GRID;
    if (!img.includes('url(')) {
      img = `url("${img}")`;
    }
    const container = createDom(
      `<div class='g6-grid-container' style="position:absolute;overflow:hidden;z-index: -1;"></div>`,
    );
    const gridContainer = createDom(
      `<div 
        class='g6-grid' 
        style='position:absolute;
        background-image: ${GRID};
        user-select: none
      '></div>`,
    );

    this.set('container', container);
    this.set('gridContainer', gridContainer);

    this.positionInit();

    container.appendChild(gridContainer);
    graphContainer.insertBefore(container, canvas);
  }

  positionInit() {
    const graph = this.get('graph');
    const minZoom = graph.get('minZoom');
    const width = graph.get('width');
    const height = graph.get('height');

    modifyCSS(this.get('container'), {
      width: `${width}px`,
      height: `${height}px`,
    });

    const gridContainerWidth = (width * 80) / minZoom;
    const gridContainerHeight = (height * 80) / minZoom;
    modifyCSS(this.get('gridContainer'), {
      width: `${gridContainerWidth}px`,
      height: `${gridContainerHeight}px`,
      left: `-${gridContainerWidth / 2}px`,
      top: `-${gridContainerHeight / 2}px`,
    });
  }

  getEvents() {
    return {
      containersizechange: 'positionInit',
      viewportchange: 'updateGrid',
    };
  }

  updateGrid(e: ViewPortEventParam) {
    const gridContainer = this.get('gridContainer');
    let { matrix } = e;
    if (!matrix) matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];

    const transform = `matrix(${matrix[0]}, ${matrix[1]}, ${matrix[3]}, ${matrix[4]}, ${matrix[6]}, ${matrix[7]})`;

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
