import G6 from '@antv/g6';
import { GShape, Behavior, GraphEvent, Item, Node } from '@/common/interfaces';
import behaviorManager from '@/common/behaviorManager';
const { deepMix } = G6.Util;

const delegateStyle = {
  fill: '#f3f9ff',
  fillOpacity: 0.5,
  stroke: '#1890ff',
  strokeOpacity: 0.9,
  lineDash: [5, 5],
};
const body = document.body;

interface Origin {
  x: number;
  y: number;
}

interface DragNodeBehavior extends Behavior {
  target: Item | null;
  origin: Origin | null;
  point: {
    [key: string]: {
      x: number;
      y: number;
    };
  };
  originPoint: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    minX?: number;
    minY?: number;
  };
  shape: GShape | null;
  fn: (e: MouseEvent) => void | null;
  onDragEnd(e: GraphEvent): void;
  onDragStart(e: GraphEvent): void;
  onDrag(e: GraphEvent): void;
  calculationGroupPosition(): {
    x: number;
    y: number;
    width: number;
    height: number;
    minX: number;
    minY: number;
  };
  onOutOfRange(e: GraphEvent): void;
  _updateDelegate(e: GraphEvent, x?: number, y?: number): void;
  _update(item: Item, e: GraphEvent, enableDelegate?: boolean): void;
}

interface DefaultConfig {
  updateEdge: boolean;
  delegateStyle: {
    [key: string]: unknown;
  };
  enableDelegate: boolean;
}

const dragNode: DragNodeBehavior & ThisType<DragNodeBehavior & DefaultConfig> = {
  shape: null,
  targets: [],
  target: null,
  origin: null,
  point: {},
  originPoint: {},
  fn: null,

  getDefaultCfg() {
    return {
      updateEdge: true,
      delegateStyle: {},
      enableDelegate: false,
    };
  },

  getEvents() {
    return {
      'node:dragstart': 'onDragStart',
      'node:drag': 'onDrag',
      'node:dragend': 'onDragEnd',
      'canvas:mouseleave': 'onOutOfRange',
    };
  },

  onDragStart(e: GraphEvent) {
    if (this.graph.get('dragCanvas') || !this.shouldBegin.call(this, e)) {
      return;
    }

    const { item, target } = e;
    const hasLocked = (item as Node).hasLocked();
    if (hasLocked) {
      return;
    }

    if (target) {
      const isAnchorPoint = target.get('isAnchorPoint');
      if (isAnchorPoint) {
        return;
      }
    }

    const graph = this.graph;

    this.targets = [];

    const nodes = graph.findAllByState('node', 'selected');

    const currentNodeId = item.get('id');

    const dragNodes = nodes.filter(node => {
      const nodeId = node.get('id');
      return currentNodeId === nodeId;
    });

    if (dragNodes.length === 0) {
      this.target = item;
    } else {
      if (nodes.length > 1) {
        nodes.forEach((node: Node) => {
          const hasLocked = node.hasLocked();
          if (!hasLocked) {
            this.targets.push(node);
          }
        });
      } else {
        this.targets.push(item);
      }
    }

    this.origin = {
      x: e.x,
      y: e.y,
    };

    this.point = {};
    this.originPoint = {};
  },

  onDrag(e: GraphEvent) {
    if (!this.origin) {
      return;
    }
    if (this.shouldUpdate && !this.shouldUpdate.call(this, e)) {
      return;
    }
    const graph = this.graph;
    const autoPaint = graph.get('autoPaint');
    graph.setAutoPaint(false);

    if (this.targets.length > 0) {
      if (this.enableDelegate) {
        this._updateDelegate(e);
      } else {
        this.targets.forEach((target: Item) => {
          this._update(target, e, this.enableDelegate);
        });
      }
    } else {
      this._update(this.target, e, this.enableDelegate);
    }

    graph.paint();
    graph.setAutoPaint(autoPaint);
  },

  onDragEnd(e: GraphEvent) {
    if (!this.origin || !this.shouldEnd.call(this, e)) {
      return;
    }

    const graph = this.graph;
    const autoPaint = graph.get('autoPaint');
    graph.setAutoPaint(false);

    if (this.shape) {
      this.shape.remove(true);
      this.shape = null;
    }

    if (this.target) {
      const delegateShape = this.target.get('delegateShape');
      if (delegateShape) {
        delegateShape.remove();
        this.target.set('delegateShape', null);
      }
    }

    if (this.targets.length > 0) {
      this.targets.forEach((node: Item) => this._update(node, e));
    } else if (this.target) {
      this._update(this.target, e);
    }

    this.point = {};
    this.origin = null;
    this.originPoint = {};
    this.targets.length = 0;
    this.target = null;
    const fn = this.fn;
    if (fn) {
      body.removeEventListener('mouseup', fn, false);
      this.fn = null;
    }

    graph.paint();
    graph.setAutoPaint(autoPaint);
  },

  onOutOfRange(e: GraphEvent) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    if (this.origin) {
      const canvasElement = self.graph.get('canvas').get('el');
      const fn = (event: Event) => {
        if (event.target !== canvasElement) {
          self.onDragEnd(e);
        }
      };
      this.fn = fn;
      body.addEventListener('mouseup', fn, false);
    }
  },

  _update(item: Item, e: GraphEvent, force: boolean) {
    const origin = this.origin;
    const model = item.get('model');
    const nodeId = item.get('id');
    if (!this.point[nodeId]) {
      this.point[nodeId] = {
        x: model.x,
        y: model.y,
      };
    }

    const x = e.x - origin.x + this.point[nodeId].x;
    const y = e.y - origin.y + this.point[nodeId].y;

    if (force) {
      this._updateDelegate(e, x, y);
      return;
    }

    const pos = { x, y };
    if (this.updateEdge) {
      this.graph.updateItem(item, pos);
    } else {
      item.updatePosition(pos);
    }
  },

  _updateDelegate(e: GraphEvent, x: number, y: number) {
    const bbox = e.item.get('keyShape').getBBox();
    if (!this.shape) {
      const parent = this.graph.get('group');
      const attrs = deepMix({}, delegateStyle);
      if (this.targets.length > 0) {
        const { x, y, width, height, minX, minY } = this.calculationGroupPosition();
        this.originPoint = { x, y, width, height, minX, minY };
        this.shape = parent.addShape('rect', {
          attrs: {
            width,
            height,
            x,
            y,
            ...attrs,
          },
        });
      } else if (this.target) {
        this.shape = parent.addShape('rect', {
          attrs: {
            width: bbox.width,
            height: bbox.height,
            x: x + bbox.x,
            y: y + bbox.y,
            ...attrs,
          },
        });
        this.target.set('delegateShape', this.shape);
      }
      this.shape.set('capture', false);
    } else {
      if (this.targets.length > 0) {
        const clientX = e.x - this.origin.x + this.originPoint.minX;
        const clientY = e.y - this.origin.y + this.originPoint.minY;
        this.shape.attr({
          x: clientX,
          y: clientY,
        });
      } else if (this.target) {
        this.shape.attr({
          x: x + bbox.x,
          y: y + bbox.y,
        });
      }
    }
  },

  calculationGroupPosition() {
    const graph = this.graph;

    const nodes = graph.findAllByState('node', 'selected');

    let minx = Infinity;
    let maxx = -Infinity;
    let miny = Infinity;
    let maxy = -Infinity;

    for (const element of nodes) {
      const bbox = element.getBBox();
      const { minX, minY, maxX, maxY } = bbox;
      if (minX < minx) {
        minx = minX;
      }

      if (minY < miny) {
        miny = minY;
      }

      if (maxX > maxx) {
        maxx = maxX;
      }

      if (maxY > maxy) {
        maxy = maxY;
      }
    }
    const x = Math.floor(minx);
    const y = Math.floor(miny);
    const width = Math.ceil(maxx) - x;
    const height = Math.ceil(maxy) - y;

    return {
      x,
      y,
      width,
      height,
      minX: minx,
      minY: miny,
    };
  },
};

behaviorManager.register('drag-node-custom', dragNode);
