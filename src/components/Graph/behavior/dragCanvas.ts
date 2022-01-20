import { Behavior, GraphEvent } from '@/common/interfaces';
import { G6Event } from '@/common/constants';
import { cloneEvent, isNaN } from '@/utils';
import { Graph as IGraph } from '@antv/g6';
import behaviorManager from '@/common/behaviorManager';

const { abs } = Math;
const DRAG_OFFSET = 10;
const ALLOW_EVENTS = ['shift', 'ctrl', 'alt', 'control'];

interface DragCanvasBehavior extends Behavior {
  origin: {
    x: number;
    y: number;
  } | null;
  dragging: boolean;
  updateViewport(e: GraphEvent): void;
  onMouseDown(e: GraphEvent): void;
  onMouseMove(e: GraphEvent): void;
  onMouseUp(e: GraphEvent): void;
  endDrag(): void;
  onKeyDown(e: KeyboardEvent): void;
  onKeyUp(): void;
}

interface DefaultConfig {
  direction: string;
  enableOptimize: boolean;
  scalableRange: number;
}

const dragCanvasBehavior: DragCanvasBehavior & ThisType<DragCanvasBehavior & DefaultConfig> = {
  origin: null,
  dragging: false,

  getDefaultCfg(): DefaultConfig {
    return {
      direction: 'both',
      enableOptimize: false,
      scalableRange: 0,
    };
  },

  getEvents() {
    return {
      dragstart: 'onMouseDown',
      mousedown: 'onMouseDown',
      drag: 'onMouseMove',
      dragend: 'onMouseUp',
      mouseup: 'onMouseUp',
      'canvas:click': 'onMouseUp',
      keyup: 'onKeyUp',
      focus: 'onKeyUp',
      keydown: 'onKeyDown',
      touchstart: 'onMouseDown',
      touchmove: 'onMouseMove',
      touchend: 'onMouseUp',
    };
  },

  updateViewport(e: GraphEvent) {
    const { origin } = this;
    const clientX = +e.clientX;
    const clientY = +e.clientY;

    if (isNaN(clientX) || isNaN(clientY)) {
      return;
    }
    let dx = clientX - origin.x;
    let dy = clientY - origin.y;

    if (this.get('direction') === 'x') {
      dy = 0;
    } else if (this.get('direction') === 'y') {
      dx = 0;
    }
    this.origin = {
      x: clientX,
      y: clientY,
    };
    const width = this.graph.get('width');
    const height = this.graph.get('height');
    const graphCanvasBBox = this.graph.get('canvas').getCanvasBBox();

    if (
      (graphCanvasBBox.minX <= width + this.scalableRange && graphCanvasBBox.minX + dx > width + this.scalableRange) ||
      (graphCanvasBBox.maxX + this.scalableRange >= 0 && graphCanvasBBox.maxX + this.scalableRange + dx < 0)
    ) {
      dx = 0;
    }
    if (
      (graphCanvasBBox.minY <= height + this.scalableRange &&
        graphCanvasBBox.minY + dy > height + this.scalableRange) ||
      (graphCanvasBBox.maxY + this.scalableRange >= 0 && graphCanvasBBox.maxY + this.scalableRange + dy < 0)
    ) {
      dy = 0;
    }
    this.graph.translate(dx, dy);
  },

  onMouseDown(e: GraphEvent) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    if (
      e.name !== G6Event.TOUCHSTART &&
      window &&
      window.event &&
      typeof window !== 'undefined' &&
      !(window.event as any).buttons &&
      !(window.event as any).button
    ) {
      return;
    }

    if (self.keydown || e.shape) {
      return;
    }

    self.origin = { x: e.clientX, y: e.clientY };
    self.dragging = false;

    if (this.enableOptimize) {
      const graph: IGraph = this.graph;
      const edges = graph.getEdges();
      for (let i = 0, len = edges.length; i < len; i++) {
        const shapes = edges[i].get('group').get('children');
        if (!shapes) continue;
        shapes.forEach(shape => {
          shape.hide();
        });
      }
      const nodes = graph.getNodes();
      for (let j = 0, nodeLen = nodes.length; j < nodeLen; j++) {
        const container = nodes[j].getContainer();
        const children = container.get('children');
        for (const child of children) {
          const isKeyShape = child.get('isKeyShape');
          if (!isKeyShape) {
            child.hide();
          }
        }
      }
    }
  },

  onMouseMove(e: GraphEvent) {
    const { graph } = this;
    if (this.keydown || e.shape) {
      return;
    }

    e = cloneEvent(e);
    if (!this.origin) {
      return;
    }

    if (!this.dragging) {
      if (abs(this.origin.x - e.clientX) + abs(this.origin.y - e.clientY) < DRAG_OFFSET) {
        return;
      }
      if (this.shouldBegin.call(this, e)) {
        e.type = 'dragstart';
        graph.emit('canvas:dragstart', e);
        this.dragging = true;
      }
    } else {
      e.type = 'drag';
      graph.emit('canvas:drag', e);
    }

    if (this.shouldUpdate.call(this, e)) {
      this.updateViewport(e);
    }
  },

  onMouseUp(e: GraphEvent) {
    const { graph } = this;

    if (this.keydown || e.shape) {
      return;
    }

    if (this.enableOptimize) {
      const edges = graph.getEdges();
      for (let i = 0, len = edges.length; i < len; i++) {
        const shapes = edges[i].get('group').get('children');
        if (!shapes) continue;
        shapes.forEach(shape => {
          shape.show();
        });
      }
      const nodes = graph.getNodes();
      for (let j = 0, nodeLen = nodes.length; j < nodeLen; j++) {
        const container = nodes[j].getContainer();
        const children = container.get('children');
        for (const child of children) {
          const isKeyShape = child.get('isKeyShape');
          if (!isKeyShape) {
            child.show();
          }
        }
      }
    }

    if (!this.dragging) {
      this.origin = null;
      return;
    }

    e = cloneEvent(e);

    if (this.shouldEnd.call(this, e)) {
      this.updateViewport(e);
    }
    e.type = 'dragend';
    graph.emit('canvas:dragend', e);
    this.endDrag();
  },

  endDrag() {
    this.origin = null;
    this.dragging = false;
    this.dragbegin = false;
  },

  onKeyDown(e: KeyboardEvent) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const code = e.key;
    if (!code) {
      return;
    }
    if (ALLOW_EVENTS.indexOf(code.toLowerCase()) > -1) {
      self.keydown = true;
    } else {
      self.keydown = false;
    }
  },

  onKeyUp() {
    this.keydown = false;
    this.origin = null;
    this.dragging = false;
    this.dragbegin = false;
  },
};

behaviorManager.register('drag-canvas', dragCanvasBehavior);
