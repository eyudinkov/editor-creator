import G6 from '@antv/g6';
import GraphEventLib from '@antv/g-base/lib/event/graph-event';
import isEqual from 'lodash/isEqual';
import Canvas from '@antv/g-canvas/lib/canvas';

import { ItemType, ItemState, GraphState, EditorEvent } from '@/common/constants';
import { Graph, TreeGraph, EdgeModel, Item, Node, Edge, Combo, GraphEvent } from '@/common/interfaces';

const canvas = document.createElement('canvas');
const canvasContext = canvas.getContext('2d');

export class G6GraphEvent extends GraphEventLib {
  public item: Item;
  public canvasX: number;
  public canvasY: number;
  public wheelDelta: number;
  public detail: number;
  public target: Item & Canvas;

  constructor(type: string, event: GraphEvent) {
    super(type, event);
    this.item = event.item;
    this.canvasX = event.canvasX;
    this.canvasY = event.canvasY;
    this.wheelDelta = event.wheelDelta;
    this.detail = event.detail;
  }
}

export const cloneEvent = (e: GraphEvent) => {
  const event = new G6GraphEvent(e.type, e);
  event.clientX = e.clientX;
  event.clientY = e.clientY;
  event.x = e.x;
  event.y = e.y;
  event.target = e.target;
  event.currentTarget = e.currentTarget;
  event.bubbles = true;
  (event.item as Item | null) = e.item;
  return event;
};

export const isNaN = (input: any) => Number.isNaN(Number(input));

export function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const toQueryString = (obj: object) =>
  Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');

export function executeBatch(graph: Graph, execute: Function) {
  const autoPaint = graph.get('autoPaint');

  graph.setAutoPaint(false);

  execute();

  graph.paint();
  graph.setAutoPaint(autoPaint);
}

export function recursiveTraversal(root, callback) {
  if (!root) {
    return;
  }

  callback(root);

  if (!root.children) {
    return;
  }

  root.children.forEach(item => recursiveTraversal(item, callback));
}

export function isFlow(graph: Graph) {
  return graph.constructor === G6.Graph;
}

export function isMind(graph: Graph) {
  return graph.constructor === G6.TreeGraph;
}

export function isNode(item: Item) {
  return item.getType() === ItemType.Node;
}

export function isEdge(item: Item) {
  return item.getType() === ItemType.Edge;
}

export function getSelectedNodes(graph: Graph): Node[] {
  return graph.findAllByState(ItemType.Node, ItemState.Selected);
}

export function getSelectedEdges(graph: Graph): Edge[] {
  return graph.findAllByState(ItemType.Edge, ItemState.Selected);
}

export function getSelectedCombos(graph: Graph): Combo[] {
  return graph.findAllByState(ItemType.Combo, ItemState.Selected);
}

export function getSelectedItems(graph: Graph): Item[] {
  const selectedNodes = getSelectedNodes(graph);
  const selectedEdges = getSelectedEdges(graph);
  const selectedCombos = getSelectedCombos(graph);
  return [...selectedNodes, ...selectedEdges, ...selectedCombos];
}

export function clearSelectedState(graph: Graph, shouldUpdate: (item: Item) => boolean = () => true) {
  executeBatch(graph, () => {
    getSelectedItems(graph).forEach(item => {
      if (shouldUpdate(item)) {
        graph.setItemState(item, ItemState.Selected, false);
      }
    });
  });
}

export function getHighlightEdges(graph: Graph): Edge[] {
  return graph.findAllByState(ItemType.Edge, ItemState.HighLight);
}

export function getGraphState(graph: Graph): GraphState {
  let graphState: GraphState = GraphState.MultiSelected;

  const selectedItems = getSelectedItems(graph);

  if (selectedItems.length <= 1) {
    switch (selectedItems[0] ? selectedItems[0].getType() : '') {
      case ItemType.Node:
        graphState = GraphState.NodeSelected;
        break;
      case ItemType.Edge:
        graphState = GraphState.EdgeSelected;
        break;
      case ItemType.Combo:
        graphState = GraphState.ComboSelected;
        break;
      default:
        graphState = GraphState.CanvasSelected;
        break;
    }
  }

  return graphState;
}

export function setSelectedItems(graph: Graph, items: Item[] | string[]) {
  executeBatch(graph, () => {
    clearSelectedState(graph);

    items.forEach(item => {
      graph.setItemState(item, ItemState.Selected, true);
    });
  });

  graph.emit(EditorEvent.onGraphStateChange, {
    graphState: getGraphState(graph),
  });
}

export function getFlowRecallEdges(graph: Graph, node: Node, targetIds: string[] = [], edges: Edge[] = []) {
  const inEdges: Edge[] = node.getInEdges();

  if (!inEdges.length) {
    return [];
  }

  inEdges.map(edge => {
    const sourceId = (edge.getModel() as EdgeModel).source;
    const sourceNode = graph.findById(sourceId) as Node;

    edges.push(edge);

    const targetId = node.get('id');

    targetIds.push(targetId);

    if (!targetIds.includes(sourceId)) {
      getFlowRecallEdges(graph, sourceNode, targetIds, edges);
    }
  });

  return edges;
}

export function getMindRecallEdges(graph: TreeGraph, node: Node, edges: Edge[] = []) {
  const parentNode = node.get('parent');

  if (!parentNode) {
    return edges;
  }

  node.getEdges().forEach(edge => {
    const source = edge.getModel().source as Edge;

    if (source.get('id') === parentNode.get('id')) {
      edges.push(edge);
    }
  });

  return getMindRecallEdges(graph, parentNode, edges);
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return (value as T) !== undefined && (value as T) !== null;
}

export const graphExist = (graph: Graph | null) => {
  return isDefined(graph) && !graph.destroyed;
};

export function toFront(graph: Graph, itemId: string) {
  const item = graph.findById(itemId);
  item.toFront();
}

export function toBack(graph: Graph, itemId: string) {
  const item = graph.findById(itemId);
  item.toBack();
}

const factorOffsetLine = 0.1;

const normalize = (center, startPoint, endPoint, side) => {
  const i = side ? side / 2 : 30;

  if ((center <= startPoint && startPoint <= endPoint) || (center >= startPoint && startPoint >= endPoint)) {
    const centerPoint = (endPoint - startPoint) / 2;
    const absCenterPoint = Math.abs(centerPoint);

    if (centerPoint === 0) {
      return center === startPoint ? 0 : ((startPoint - center) / Math.abs(startPoint - center)) * i;
    }

    if (absCenterPoint > side) {
      const s = (centerPoint / absCenterPoint) * side;

      return Math.abs(s) < i ? (centerPoint / absCenterPoint) * i : s;
    }

    return absCenterPoint < i ? (centerPoint / absCenterPoint) * i : centerPoint;
  }

  let c = i;

  c =
    Math.abs(startPoint - endPoint) < 2 * Math.abs(startPoint - center)
      ? (side * Math.abs(startPoint - endPoint)) / (2 * Math.abs(startPoint - center))
      : side;

  if (c > side) {
    c = side;
  }

  if (c < i) {
    c = i;
  }

  return startPoint > center ? c : -c;
};

const isSide = (startPoint, bbox) => {
  const n = Math.abs(startPoint.x - bbox.centerX);
  const r = Math.abs(startPoint.y - bbox.centerY);

  return n / bbox.width > r / bbox.height;
};

const getEndPointByBezie = (target, startPoint, endPoint, source) => {
  let offsetX = 0;
  let offsetY = 0;

  const bbox = target.bbox;
  const side = isSide(startPoint, bbox);

  let minSide = Math.min(bbox.height, bbox.width);

  if (source && source.bbox) {
    minSide = Math.min(minSide, source.bbox.height, source.bbox.width);
  }

  if (side) {
    offsetX = normalize(bbox.centerX, startPoint.x, endPoint.x, minSide);
  } else {
    offsetY = normalize(bbox.centerY, startPoint.y, endPoint.y, minSide);
  }

  return {
    x: startPoint.x + offsetX,
    y: startPoint.y + offsetY,
  };
};

const getPointByLine = (point1, point2) => {
  const { x: xPoint1, y: yPoint1 } = point1;
  const { x: xPoint2, y: yPoint2 } = point2;

  return {
    x: xPoint1 + (xPoint2 - xPoint1) * factorOffsetLine,
    y: yPoint1 + (yPoint2 - yPoint1) * factorOffsetLine,
  };
};

const getControlPoints = (start, end, source, target) => {
  return [
    source && source.bbox ? getEndPointByBezie(source, start, end, target) : getPointByLine(start, end),
    target && target.bbox ? getEndPointByBezie(target, end, start, source) : getPointByLine(end, start),
  ];
};

export const getPolygon = (points, source = undefined, target = undefined): any[] => {
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const startPathPoint = ['M', startPoint.x, startPoint.y];
  const bezie = ['C'];
  const controllPoints = getControlPoints(startPoint, endPoint, source, target);
  const path = [startPathPoint];

  controllPoints.forEach(point => {
    bezie.push(point.x, point.y);
  });

  bezie.push(endPoint.x, endPoint.y);
  path.push(bezie);

  return path;
};

export function optimizeMultilineText(text: string, font: string, maxRows: number, maxWidth: number) {
  canvasContext.font = font;
  const words = text.split(' ');

  if (canvasContext.measureText(text).width <= maxWidth) {
    return text;
  }

  let multilineText = [];
  let line = '';

  for (const word of words) {
    const newLine = line === '' ? word : `${line} ${word}`;
    const { width } = canvasContext.measureText(newLine);

    if (width > maxWidth) {
      multilineText.push(line);

      line = word;
    } else {
      line = newLine;
    }
  }

  if (line) {
    multilineText.push(line);
  }

  if (multilineText.length >= maxRows) {
    const ellipsis = '...';
    const ellipsisWidth = canvasContext.measureText(ellipsis).width;

    let tempText = '';
    let tempTextWidth = 0;
    let lastWordSlise = false;

    for (const char of multilineText[maxRows - 1]) {
      const { width } = canvasContext.measureText(char);

      if (tempTextWidth + width > maxWidth - ellipsisWidth) {
        lastWordSlise = true;
        break;
      }

      tempText += char;
      tempTextWidth += width;
    }

    multilineText = multilineText
      .slice(0, maxRows - 1)
      .concat(`${tempText}${multilineText.length > maxRows || lastWordSlise ? ellipsis : ''}`);
  }

  return multilineText.filter(line => line !== '').join('\n');
}

export function getNodeSide(item: Node): 'left' | 'right' {
  const model = item.getModel();

  if (model.side) {
    return model.side as 'left' | 'right';
  }

  const parent = item.get('parent');

  if (parent) {
    return getNodeSide(parent);
  }

  return 'right';
}

export function getRectPath(x: number, y: number, w: number, h: number, r: number) {
  if (r) {
    return [
      ['M', +x + +r, y],
      ['l', w - r * 2, 0],
      ['a', r, r, 0, 0, 1, r, r],
      ['l', 0, h - r * 2],
      ['a', r, r, 0, 0, 1, -r, r],
      ['l', r * 2 - w, 0],
      ['a', r, r, 0, 0, 1, -r, -r],
      ['l', 0, r * 2 - h],
      ['a', r, r, 0, 0, 1, r, -r],
      ['z'],
    ];
  }

  const res = [['M', x, y], ['l', w, 0], ['l', 0, h], ['l', -w, 0], ['z']];

  res.toString = toString;

  return res;
}

export function getFoldButtonPath() {
  const w = 14;
  const h = 14;
  const rect = getRectPath(0, 0, w, h, 2);
  const hp = `M${(w * 3) / 14},${h / 2}L${(w * 11) / 14},${h / 2}`;
  const vp = '';

  return rect + hp + vp;
}

export function getUnfoldButtonPath() {
  const w = 14;
  const h = 14;
  const rect = getRectPath(0, 0, w, h, 2);
  const hp = `M${(w * 3) / 14},${h / 2}L${(w * 11) / 14},${h / 2}`;
  const vp = `M${w / 2},${(h * 3) / 14}L${w / 2},${(h * 11) / 14}`;

  return rect + hp + vp;
}

export const getTransformTranslateValues = (transform: string | null) => {
  if (!isDefined(transform) || (isDefined(transform) && transform === '')) {
    return {
      left: 0,
      top: 0,
    };
  }
  const tr = transform.match(/^translate\((.+)\)$/);
  if (!isDefined(tr)) {
    return {
      left: 0,
      top: 0,
    };
  }
  const values = tr[1].split(', ');
  return {
    left: parseFloat(values[0]),
    top: parseFloat(values[1]),
  };
};

export function hashCodeObject(obj: { [key: string]: any }): number {
  const str = JSON.stringify(obj);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const character = str.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash = hash & hash;
  }
  return hash;
}

export function compareArray(a1: number[], a2: number[]): boolean {
  return isEqual(a1.sort(), a2.sort());
}

export function optimiseOneLineText(text: string, font: string, maxWidth: number) {
  canvasContext.font = font;
  let newText = '';
  const lengthText = text.length;
  let index = 0;
  let width = 0;

  while (index < lengthText && width < maxWidth) {
    const { width: widthChar } = canvasContext.measureText(text[index]);

    if (width + widthChar <= maxWidth) {
      newText += text[index];
      width += widthChar;
      ++index;
    } else {
      ++index;
      break;
    }
  }

  return newText;
}

export function focusItem(graph: Graph, id: string): void {
  const item = graph.findById(id);
  graph.zoomTo(1);
  graph.focusItem(item);

  if (isNode(item)) {
    const { width, height } = item.getBBox();
    graph.translate(-(width / 2), -(height / 2));
  } else {
    const { startPoint, endPoint } = item.getModel();
    const centerX = Math.floor((endPoint.x + startPoint.x) / 2);
    const centerY = Math.floor((endPoint.y + startPoint.y) / 2);
    graph.translate(-centerX, -centerY);
  }
}
