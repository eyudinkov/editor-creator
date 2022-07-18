import {
  GraphType,
  GraphEdgeEvent,
  GraphCustomEvent,
  EditorCommand,
  ANCHOR_POINT_NAME,
  AnchorPointState,
  ItemState,
} from '@/common/constants';
import { Behavior, GraphEvent, EdgeModel, Node, Edge, AnchorPoint, Item } from '@/common/interfaces';
import behaviorManager from '@/common/behaviorManager';
import CommandManager from '@/common/CommandManager';
import omit from 'lodash/omit';
import { isDefined } from '@/utils';

enum ControlPointClassNames {
  EDGE_CONTROLL_POINT_START = 'edge-controll-point-start',
  EDGE_CONTROLL_POINT_END = 'edge-controll-point-end',
}

type LinkRule = {
  [key: string]: {
    in?: number;
    out?: number;
    next?: [string];
  };
};

interface DragEdgeControllBehavior extends Behavior {
  onMouseDown(e: GraphEvent): void;
  onMousemove(e: GraphEvent): void;
  onMouseup(e: GraphEvent): void;
  notSelf(e: GraphEvent): boolean;
  addEdgeCheck(ev: GraphEvent, flag: string): boolean;
  isAnchor(e: GraphEvent): boolean;
  isOnlyOneEdge(e: Node): boolean;
  customValidation(e: GraphEvent): boolean;
  isTargetControlPoint(target: Item): boolean;
  targetIsStartControlPoint(target: Item): boolean;
  addingEdge?: boolean;
  target: Node;
  source: Node;
  edge: Edge;
  initEdgeModel: EdgeModel | null;
  initAnchorIndex: number;
  isStartControlPoint: boolean;
}

interface DefaultConfig {
  allowMultiEdge: boolean;
}

function checkOutAndInEdge(item: Node, type: string, linkRule: LinkRule) {
  if (!linkRule) return true;

  const outEdge = item.getOutEdges().length;
  const inEdge = item.getInEdges().length;
  const { shape } = item.getModel();
  const config = linkRule[shape];

  if (!config) return true;

  config.in = config.in || Infinity;
  config.out = config.out || Infinity;

  if (type === 'in' && inEdge < config.in) return true;
  if (type === 'out' && outEdge < config.out) return true;
  if (inEdge < config.in && outEdge < config.out) {
    return true;
  } else {
    return false;
  }
}

const dragEdgeControllBehavior: DragEdgeControllBehavior & ThisType<DragEdgeControllBehavior & DefaultConfig> = {
  graphType: GraphType.Flow,
  target: null,
  source: null,
  edge: null,
  initEdgeModel: null,
  initAnchorIndex: 0,
  isStartControlPoint: false,

  getDefaultCfg(): DefaultConfig {
    return {
      allowMultiEdge: true,
    };
  },

  getEvents() {
    return {
      [GraphEdgeEvent.onEdgeMouseDown]: 'onMouseDown',
      mousemove: 'onMousemove',
      mouseup: 'onMouseup',
      'node:mouseleave': 'onNodeMouseLeave',
    };
  },

  shouldBegin(e: GraphEvent) {
    const { target } = e;

    return this.isTargetControlPoint(target);
  },

  isTargetControlPoint(target) {
    const targetName = target.get('className');

    return (
      targetName === ControlPointClassNames.EDGE_CONTROLL_POINT_END ||
      targetName === ControlPointClassNames.EDGE_CONTROLL_POINT_START
    );
  },

  targetIsStartControlPoint(target: Item) {
    const targetName = target.get('className');

    return targetName === ControlPointClassNames.EDGE_CONTROLL_POINT_START;
  },

  onMouseDown(e: GraphEvent) {
    if (!this.shouldBegin(e)) return;

    this.isStartControlPoint = this.targetIsStartControlPoint(e.target);
    const graph = this.graph;
    const pointName = this.isStartControlPoint ? 'source' : 'target';
    const initEdge = e.item as Edge;

    this.initAnchorIndex = this.isStartControlPoint
      ? initEdge.get('sourceAnchorIndex')
      : initEdge.get('targetAnchorIndex');
    this.target = initEdge.getTarget();
    this.source = initEdge.getSource();

    const model = initEdge.getModel();
    this.initEdgeModel = model as EdgeModel;
    const point = { x: e.x, y: e.y };
    const newModel = {
      ...omit(model, ['startPoint', 'endPoint', pointName]),
      [pointName]: point,
    };

    graph.remove(e.item);

    this.edge = graph.addItem('edge', newModel);
    this.addingEdge = true;

    graph.getNodes().forEach(node => {
      if (
        (this.isStartControlPoint && node.getModel().id === this.target.get('id')) ||
        (!this.isStartControlPoint && node.getModel().id === this.source.get('id'))
      ) {
        return;
      }

      const targetAnchorPoints = node.getAnchorPoints() as AnchorPoint[];
      const targetAnchorPointsState = [];

      targetAnchorPoints.forEach(() => {
        targetAnchorPointsState.push(AnchorPointState.Enabled);
      });

      node.set('anchorPointsState', targetAnchorPointsState);

      graph.setItemState(node, ItemState.ActiveAnchorPoints, true);
    });
  },

  isAnchor(e: GraphEvent) {
    const { target } = e;
    const targetName = target.get('name');

    if (targetName === ANCHOR_POINT_NAME) {
      return true;
    } else {
      return false;
    }
  },

  notSelf(e: GraphEvent) {
    const node = e.item;
    const model = node.getModel();

    if (!this.isStartControlPoint) {
      if (this.edge.getSource().get('id') === model.id) return false;
    }

    if (this.isStartControlPoint && this.edge.getTarget().get('id') === model.id) return false;

    return true;
  },

  addEdgeCheck(e: GraphEvent, inFlag = undefined) {
    const { graph, isAnchor } = this;
    const linkRule = graph.get('defaultEdge').linkRule;

    if (!isAnchor(e)) return false;

    return checkOutAndInEdge(e.item as Node, inFlag, linkRule);
  },

  onNodeMouseLeave(e) {
    const { graph } = this;
    const { item } = e;

    if (this.addingEdge) {
      const targetAnchorPoints = item.getAnchorPoints() as AnchorPoint[];
      const targetAnchorPointsState = [];

      targetAnchorPoints.forEach(() => {
        targetAnchorPointsState.push(AnchorPointState.Enabled);
      });
      item.set('anchorPointsState', targetAnchorPointsState);
      graph.setItemState(item, ItemState.ActiveAnchorPoints, true);
    }
  },

  onMousemove(e: GraphEvent) {
    const { graph } = this;
    if (this.addingEdge) {
      const point = { x: e.x, y: e.y };
      const pointName = this.isStartControlPoint ? 'source' : 'target';

      graph.setItemState(this.edge, 'move', true);
      const flag = this.isStartControlPoint ? 'out' : 'in';

      if (this.addEdgeCheck.call(this, e, flag) && this.notSelf(e)) {
        const node = e.item;
        const model = node.getModel();
        const anchorName = this.isStartControlPoint ? 'sourceAnchor' : 'targetAnchor';
        graph.updateItem(this.edge, {
          [anchorName]: e.target.get('anchorPointIndex'),
          [pointName]: model.id,
        });
      } else {
        graph.updateItem(this.edge, { [pointName]: point });
      }
    }
  },

  isOnlyOneEdge(node: Node) {
    if (this.allowMultiEdge) return true;

    const source = this.edge.getSource().get('id');
    const target = node.get('id');

    if (!source || !target) return true;

    return !node.getEdges().some(edge => {
      const sourceId = edge.getSource().get('id');
      const targetId = edge.getTarget().get('id');

      if (sourceId === source && targetId === target) {
        return true;
      } else {
        return false;
      }
    });
  },

  customValidation() {
    const graph = this.graph;
    const edges = graph.getEdges();
    const source = this.edge.getSource();
    const target = this.edge.getTarget();

    if (!isDefined(source.getModel) || !isDefined(target.getModel)) {
      return true;
    }

    const sourceModel = source.getModel();

    const repeatedEdges = edges.filter(
      edge =>
        edge.getSource().get('id') === this.edge.getSource().get('id') &&
        edge.getTarget().get('id') === this.edge.getTarget().get('id'),
    );

    const repeatedTransitiveEdges = edges.filter(
      edge => edge.getSource().get('id') === this.edge.getSource().get('id'),
    );

    const edgeExist =
      repeatedEdges.length > 1 &&
      repeatedEdges.every(
        edge =>
          edge.getSource().get('id') === this.edge.getSource().get('id') &&
          edge.getTarget().get('id') === this.edge.getTarget().get('id'),
      );

    const transitiveNodeHaveEdge = repeatedTransitiveEdges.length > 1 && sourceModel.transitive === true;

    return edgeExist || transitiveNodeHaveEdge ? false : true;
  },

  onMouseup(e: GraphEvent) {
    const { graph } = this;
    const node = e.item as Node;
    const pointName = this.isStartControlPoint ? 'source' : 'target';
    const anchorName = this.isStartControlPoint ? 'sourceAnchor' : 'targetAnchor';

    const hideAnchors = () => {
      graph.getNodes().forEach(node => {
        node.set('anchorPointsState', []);
        graph.setItemState(node, ItemState.ActiveAnchorPoints, false);
      });
    };

    const resetEdge = () => {
      const { initAnchorIndex } = this;
      const targetId = this[pointName].get('id');

      graph.updateItem(this.edge, {
        [anchorName]: initAnchorIndex,
        [pointName]: targetId,
      });

      this.initEdgeModel = null;
      this.edge = null;
      this.addingEdge = false;
    };

    const flag = this.isStartControlPoint ? 'out' : 'in';
    if (!this.addEdgeCheck.call(this, e, flag)) {
      if (this.edge && this.addingEdge) {
        resetEdge();
        hideAnchors();
      }
      return;
    }

    const model = node.getModel();
    if (this.addingEdge && this.edge) {
      if (!this.notSelf(e) || !this.isOnlyOneEdge(node) || !this.customValidation(e)) {
        resetEdge();
        hideAnchors();
        return;
      }
      graph.emit(GraphCustomEvent.onBeforeConnect, {
        edge: this.edge,
      });
      graph.setItemState(this.edge, 'drag', false);
      graph.setItemState(this.edge, 'move', false);

      const modelEdge = this.edge.getModel();
      graph.updateItem(this.edge, {
        [anchorName]: e.target.get('anchorPointIndex'),
        [pointName]: model.id,
      });

      const commandManager: CommandManager = graph.get('commandManager');
      commandManager.execute(graph, EditorCommand.ChangeEdgeControll, {
        model: {
          ...this.initEdgeModel,
          id: modelEdge.id,
        },
        updateModel: {
          [anchorName]: e.target.get('anchorPointIndex'),
          [pointName]: model.id,
        },
      });

      this.edge = graph.findById(modelEdge.id) as Edge;

      graph.emit(GraphCustomEvent.onAfterConnect, {
        edge: this.edge,
      });
      this.edge = null;
      this.initEdgeModel = null;
      this.addingEdge = false;
      hideAnchors();
    }
  },
};

behaviorManager.register('drag-edge-controll', dragEdgeControllBehavior);
