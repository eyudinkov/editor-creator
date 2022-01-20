import GCanvas from '@antv/g-canvas/lib/canvas';
import GSVGCanvas from '@antv/g-svg/lib/canvas';
import Base, { PluginBaseConfig } from '../base';
import isString from '@antv/util/lib/is-string';
import createDOM from '@antv/dom-util/lib/create-dom';
import modifyCSS from '@antv/dom-util/lib/modify-css';
import isNil from '@antv/util/lib/is-nil';
import each from '@antv/util/lib/each';
import { Matrix, ShapeStyle, Graph } from '@/common/interfaces';
import transform from '@antv/matrix-util/lib/transform';
import { Point } from '@antv/g-math/lib/types';
import GraphEvent from '@antv/g-base/lib/event/graph-event';
import debounce from '@antv/util/lib/debounce';

const { max } = Math;

const DEFAULT_MODE = 'default';
const KEYSHAPE_MODE = 'keyShape';
const DELEGATE_MODE = 'delegate';
const SVG = 'svg';

interface MiniMapConfig extends PluginBaseConfig {
  viewportClassName?: string;
  type?: 'default' | 'keyShape' | 'delegate';
  size?: number[];
  delegateStyle?: ShapeStyle;
  drawEdges?: boolean;
  refresh?: boolean;
  padding?: number;
}

export default class MiniMap extends Base {
  public getDefaultCfgs(): MiniMapConfig {
    return {
      container: null,
      className: 'g6-minimap',
      viewportClassName: 'g6-minimap-viewport',
      type: 'delegate',
      padding: 50,
      size: [200, 120],
      delegateStyle: {
        fill: '#40a9ff',
        stroke: '#40a9ff',
      },
      edgeStyle: {
        strokeStyle: '#40a9ff',
      },
      drawEdges: true,
      refresh: true,
    };
  }

  public getEvents() {
    return {
      beforepaint: 'updateViewport',
      beforeanimate: 'disableRefresh',
      afteranimate: 'enableRefresh',
      viewportchange: 'disableOneRefresh',
    };
  }

  protected disableRefresh() {
    this.set('refresh', false);
  }

  protected enableRefresh() {
    this.set('refresh', true);
    this.updateCanvas();
  }

  protected disableOneRefresh() {
    this.set('viewportChange', true);
  }

  private initViewport() {
    const cfgs: MiniMapConfig = this._cfgs as MiniMapConfig;
    const { size, graph } = cfgs;
    if (this.destroyed) return;
    const canvas = this.get('canvas');

    const containerDOM = canvas.get('container');
    const viewport = createDOM(`
      <div
        class=${cfgs.viewportClassName}
        style='position:absolute;
          left:0;
          top:0;
          box-sizing:border-box;
          border: 2px solid #1980ff'
        draggable=true>
      </div>`);

    let x = 0;
    let y = 0;
    let dragging = false;
    let left = 0;
    let top = 0;
    let width = 0;
    let height = 0;
    let ratio = 0;
    let zoom = 0;

    viewport.addEventListener(
      'dragstart',
      (e: GraphEvent) => {
        if ((e as any).dataTransfer) {
          const img = new Image();
          img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' %3E%3Cpath /%3E%3C/svg%3E";
          (e as any).dataTransfer.setDragImage(img, 0, 0);
          (e as any).dataTransfer.setData('text', 'view-port-minimap');
        }

        cfgs.refresh = false;
        if (e.target !== viewport) {
          return;
        }

        const { style } = viewport;
        left = parseInt(style.left, 10);
        top = parseInt(style.top, 10);
        width = parseInt(style.width, 10);
        height = parseInt(style.height, 10);

        if (width > size[0] || height > size[1]) {
          return;
        }

        zoom = graph?.getZoom();
        ratio = this.get('ratio');

        dragging = true;
        x = e.clientX;
        y = e.clientY;
      },
      false,
    );

    viewport.addEventListener(
      'drag',
      (e: GraphEvent) => {
        if (!dragging || isNil(e.clientX) || isNil(e.clientY)) {
          return;
        }

        let dx = x - e.clientX;
        let dy = y - e.clientY;

        if (left - dx < 0 || left - dx + width >= size[0]) {
          dx = 0;
        }

        if (top - dy < 0 || top - dy + height >= size[1]) {
          dy = 0;
        }

        left -= dx;
        top -= dy;

        modifyCSS(viewport, {
          left: `${left}px`,
          top: `${top}px`,
        });

        graph?.translate((dx * zoom) / ratio, (dy * zoom) / ratio);

        x = e.clientX;
        y = e.clientY;
      },
      false,
    );

    viewport.addEventListener(
      'dragend',
      () => {
        dragging = false;
        cfgs.refresh = true;
      },
      false,
    );

    this.set('viewport', viewport);
    containerDOM.appendChild(viewport);
  }

  private updateViewport() {
    if (this.destroyed) return;
    const ratio: number = this.get('ratio');
    const totaldx: number = this.get('totaldx');
    const totaldy: number = this.get('totaldy');
    const graph: Graph = this.get('graph');
    const size: number[] = this.get('size');
    const graphWidth = graph.get('width');
    const graphHeight = graph.get('height');
    const topLeft: Point = graph.getPointByCanvas(0, 0);
    const bottomRight: Point = graph.getPointByCanvas(graphWidth, graphHeight);
    const viewport: HTMLElement = this.get('viewport');
    if (!viewport) {
      this.initViewport();
    }

    let width = (bottomRight.x - topLeft.x) * ratio;
    let height = (bottomRight.y - topLeft.y) * ratio;

    let left = topLeft.x * ratio + totaldx;
    let top = topLeft.y * ratio + totaldy;

    const right = left + width;
    const bottom = top + height;

    if (left < 0) {
      width += left;
      left = 0;
    }
    if (right > size[0]) {
      width = width - (right - size[0]);
    }
    if (top < 0) {
      height += top;
      top = 0;
    }
    if (bottom > size[1]) {
      height = height - (bottom - size[1]);
    }

    this.set('ratio', ratio);

    const correctLeft: number | string = `${left}px`;
    const correctTop: number | string = `${top}px`;

    modifyCSS(viewport, {
      left: correctLeft,
      top: correctTop,
      width: `${width}px`,
      height: `${height}px`,
    });
  }

  private updateGraphShapes() {
    const { graph } = this._cfgs;
    const canvas: GCanvas = this.get('canvas');
    const graphGroup = graph?.get('group');
    if (graphGroup.destroyed) return;
    const clonedGroup = graphGroup.clone();

    clonedGroup.resetMatrix();

    canvas.clear();
    canvas.add(clonedGroup);

    const renderer = graph.get('renderer');
    if (renderer === SVG) {
      this.updateVisible(clonedGroup);
    }
  }

  private updateVisible(ele) {
    if (!ele.isGroup() && !ele.get('visible')) {
      ele.hide();
    } else {
      const children = ele.get('children');
      if (!children || !children.length) return;
      children.forEach(child => {
        if (!child.get('visible')) child.hide();
        this.updateVisible(child);
      });
    }
  }

  private updateKeyShapes() {
    const { graph } = this._cfgs;
    const drawEdges = this.get('drawEdges');

    if (drawEdges) {
      each(graph?.getEdges(), edge => {
        this.updateOneEdgeKeyShape(edge);
      });
    }
    each(graph?.getNodes(), node => {
      this.updateOneNodeKeyShape(node);
    });
    this.clearDestroyedShapes();
  }

  private updateOneNodeKeyShape(item) {
    const canvas: GCanvas = this.get('canvas');
    const group = canvas.get('children')[0] || canvas.addGroup();
    const itemMap = this.get('itemMap') || {};

    let mappedItem = itemMap[item.get('id')];
    const bbox = item.getBBox();
    const cKeyShape = item.get('keyShape').clone();
    const keyShapeStyle = cKeyShape.attr();
    let attrs: any = {
      x: bbox.centerX,
      y: bbox.centerY,
    };
    if (!mappedItem) {
      mappedItem = cKeyShape;
      group.add(mappedItem);
    } else {
      attrs = Object.assign(keyShapeStyle, attrs);
    }
    const shapeType = mappedItem.get('type');
    if (shapeType === 'rect' || shapeType === 'image') {
      attrs.x = bbox.minX;
      attrs.y = bbox.minY;
    }
    mappedItem.attr(attrs);
    if (!item.isVisible()) {
      mappedItem.hide();
    }
    mappedItem.exist = true;
    itemMap[item.get('id')] = mappedItem;
    this.set('itemMap', itemMap);
  }

  private updateDelegateShapes() {
    const { graph } = this._cfgs;
    const drawEdges = this.get('drawEdges');

    if (drawEdges) {
      each(graph?.getEdges(), edge => {
        this.updateOneEdgeKeyShape(edge);
      });
    }
    each(graph?.getNodes(), node => {
      this.updateOneNodeDelegateShape(node);
    });
    this.clearDestroyedShapes();
  }

  private clearDestroyedShapes() {
    const itemMap = this.get('itemMap') || {};
    const keys = Object.keys(itemMap);
    if (!keys || keys.length === 0) return;
    for (let i = keys.length - 1; i >= 0; i--) {
      const shape = itemMap[keys[i]];
      const exist = shape.exist;
      shape.exist = false;
      if (!exist) {
        shape.remove();
        delete itemMap[keys[i]];
      }
    }
  }

  private updateOneEdgeKeyShape(item) {
    const canvas: GCanvas = this.get('canvas');
    const group = canvas.get('children')[0] || canvas.addGroup();
    const itemMap = this.get('itemMap') || {};
    const edgeStyle = this.get('edgeStyle');

    let mappedItem = itemMap[item.get('id')];
    if (mappedItem) {
      const path = item.get('keyShape').attr('path');
      mappedItem.attr('path', path);
    } else {
      mappedItem = item.get('keyShape').clone();
      mappedItem.attr(edgeStyle);
      group.add(mappedItem);
      mappedItem.toBack();
    }
    if (!item.isVisible()) {
      mappedItem.hide();
    }
    mappedItem.exist = true;
    itemMap[item.get('id')] = mappedItem;
    this.set('itemMap', itemMap);
  }

  private updateOneNodeDelegateShape(item) {
    const canvas: GCanvas = this.get('canvas');
    const group = canvas.get('children')[0] || canvas.addGroup();
    const delegateStyle = this.get('delegateStyle');
    const itemMap = this.get('itemMap') || {};

    let mappedItem = itemMap[item.get('id')];
    const bbox = item.getBBox();
    if (mappedItem) {
      const attrs = {
        x: bbox.minX,
        y: bbox.minY,
        width: bbox.width,
        height: bbox.height,
      };
      mappedItem.attr(attrs);
    } else {
      mappedItem = group.addShape('rect', {
        attrs: {
          x: bbox.minX,
          y: bbox.minY,
          width: bbox.width,
          height: bbox.height,
          ...delegateStyle,
        },
        name: 'minimap-node-shape',
      });
    }
    if (!item.isVisible()) {
      mappedItem.hide();
    }
    mappedItem.exist = true;
    itemMap[item.get('id')] = mappedItem;
    this.set('itemMap', itemMap);
  }

  private handleUpdateCanvas = debounce(
    () => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      if (self.destroyed) return;
      self.updateCanvas();
    },
    100,
    false,
  );

  public init() {
    this.initContainer();
    this.get('graph').on('afterupdateitem', this.handleUpdateCanvas);
    this.get('graph').on('afteritemstatechange', this.handleUpdateCanvas);
    this.get('graph').on('afteradditem', this.handleUpdateCanvas);
    this.get('graph').on('afterremoveitem', this.handleUpdateCanvas);
    this.get('graph').on('afterrender', this.handleUpdateCanvas);
    this.get('graph').on('afterlayout', this.handleUpdateCanvas);
  }

  public initContainer() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const graph: Graph = self.get('graph');
    const size: number[] = self.get('size');
    const className: string = self.get('className');
    let parentNode: string | HTMLElement = self.get('container');
    const container: HTMLElement = createDOM(
      `<div class='${className}' style='width: ${size[0]}px; height: ${size[1]}px; overflow: hidden'></div>`,
    );

    if (isString(parentNode)) {
      parentNode = document.getElementById(parentNode) as HTMLElement;
    }

    if (parentNode) {
      parentNode.appendChild(container);
    } else {
      graph.get('container').appendChild(container);
    }

    self.set('container', container);

    const containerDOM = createDOM('<div class="g6-minimap-container" style="position: relative;"></div>');
    container.appendChild(containerDOM);

    let canvas;
    const renderer = graph.get('renderer');
    if (renderer === SVG) {
      canvas = new GSVGCanvas({
        container: containerDOM,
        width: size[0],
        height: size[1],
      });
    } else {
      canvas = new GCanvas({
        container: containerDOM,
        width: size[0],
        height: size[1],
      });
    }
    self.set('canvas', canvas);
    self.updateCanvas();
  }

  public updateCanvas() {
    const isRefresh: boolean = this.get('refresh');
    if (!isRefresh) {
      return;
    }
    const graph: Graph = this.get('graph');
    if (graph.get('destroyed')) {
      return;
    }

    if (this.get('viewportChange')) {
      this.set('viewportChange', false);
      this.updateViewport();
    }

    const size: number[] = this.get('size');
    const canvas: GCanvas = this.get('canvas');
    const type: string = this.get('type');
    const padding: number = this.get('padding');

    if (canvas.destroyed) {
      return;
    }

    switch (type) {
      case DEFAULT_MODE:
        this.updateGraphShapes();
        break;
      case KEYSHAPE_MODE:
        this.updateKeyShapes();
        break;
      case DELEGATE_MODE:
        this.updateDelegateShapes();
        break;
      default:
        break;
    }

    const group = canvas.get('children')[0];
    if (!group) return;

    group.resetMatrix();
    const bbox = group.getCanvasBBox();

    const graphBBox = graph.get('canvas').getBBox();

    let width = graphBBox.width;
    let height = graphBBox.height;

    if (Number.isFinite(bbox.width)) {
      width = max(bbox.width, width);
      height = max(bbox.height, height);
    }

    width += 2 * padding;
    height += 2 * padding;

    const ratio = Math.min(size[0] / width, size[1] / height);

    let matrix: Matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];

    let minX = 0;
    let minY = 0;

    if (Number.isFinite(bbox.minX)) {
      minX = -bbox.minX;
    }
    if (Number.isFinite(bbox.minY)) {
      minY = -bbox.minY;
    }

    const dx = (size[0] - (width - 2 * padding) * ratio) / 2;
    const dy = (size[1] - (height - 2 * padding) * ratio) / 2;

    matrix = transform(matrix, [
      ['t', minX, minY],
      ['s', ratio, ratio],
      ['t', dx, dy],
    ]);

    group.setMatrix(matrix);

    this.set('ratio', ratio);
    this.set('totaldx', dx + minX * ratio);
    this.set('totaldy', dy + minY * ratio);
    this.set('dx', dx);
    this.set('dy', dy);
    this.updateViewport();
  }

  public getCanvas(): GCanvas {
    return this.get('canvas');
  }

  public getViewport(): HTMLElement {
    return this.get('viewport');
  }

  public getContainer(): HTMLElement {
    return this.get('container');
  }

  public destroy() {
    this.get('canvas').destroy();

    const container = this.get('container');
    container.parentNode.removeChild(container);
  }
}
