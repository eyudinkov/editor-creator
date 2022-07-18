import isPlainObject from 'lodash/isPlainObject';
import { guid } from '@/utils';
import { ItemType, ItemState, GraphType, AnchorPointState, GraphCustomEvent, EditorCommand } from '@/common/constants';
import { Node, Edge, Behavior, GraphEvent, EdgeModel, AnchorPoint } from '@/common/interfaces';
import behaviorManager from '@/common/behaviorManager';

interface DragAddEdgeBehavior extends Behavior {
  edge: Edge | null;
  isEnabledAnchorPoint(e: GraphEvent): boolean;
  isNotSelf(e: GraphEvent): boolean;
  canFindTargetAnchorPoint(e: GraphEvent): boolean;
  shouldAddDelegateEdge(e: GraphEvent): boolean;
  shouldAddRealEdge(e: GraphEvent): boolean;
  handleNodeMouseEnter(e: GraphEvent): void;
  handleNodeMouseLeave(e: GraphEvent): void;
  handleNodeMouseDown(e: GraphEvent): void;
  handleMouseMove(e: GraphEvent): void;
  handleMouseUp(e: GraphEvent): void;
  getDefaultEdgeModel(): { [key: string]: any };
  customValidation(e: GraphEvent): boolean;
}

interface DefaultConfig {
  edgeType: string;
  getAnchorPointStateOfSourceNode(sourceNode: Node, sourceAnchorPoint: AnchorPoint): AnchorPointState;
  getAnchorPointStateOfTargetNode(
    sourceNode: Node,
    sourceAnchorPoint: AnchorPoint,
    targetNode: Node,
    targetAnchorPoint: AnchorPoint,
  ): AnchorPointState;
}

const dragAddEdgeBehavior: DragAddEdgeBehavior & ThisType<DragAddEdgeBehavior & DefaultConfig> = {
  edge: null,

  graphType: GraphType.Flow,

  getDefaultCfg(): DefaultConfig {
    return {
      edgeType: 'flowEdge',
      getAnchorPointStateOfSourceNode: () => AnchorPointState.Enabled,
      getAnchorPointStateOfTargetNode: () => AnchorPointState.Enabled,
    };
  },

  getEvents() {
    return {
      'node:mouseenter': 'handleNodeMouseEnter',
      'node:mouseleave': 'handleNodeMouseLeave',
      'node:mousedown': 'handleNodeMouseDown',
      mousemove: 'handleMouseMove',
      mouseup: 'handleMouseUp',
    };
  },

  getDefaultEdgeModel() {
    return {};
  },

  isEnabledAnchorPoint(e: GraphEvent) {
    const { target } = e;

    return !!target.get('isAnchorPoint') && target.get('anchorPointState') === AnchorPointState.Enabled;
  },

  isNotSelf(e: GraphEvent) {
    const { edge } = this;
    const { item } = e;

    return item.getModel().id !== edge.getSource().getModel().id;
  },

  getTargetNodes(sourceId: string) {
    const { graph } = this;

    const nodes = graph.getNodes();

    return nodes.filter(node => node.getModel().id !== sourceId);
  },

  canFindTargetAnchorPoint(e: GraphEvent) {
    return this.isEnabledAnchorPoint(e) && this.isNotSelf(e);
  },

  shouldAddDelegateEdge(e: GraphEvent) {
    return this.isEnabledAnchorPoint(e);
  },

  shouldAddRealEdge(e: GraphEvent) {
    const { target } = e;
    const { edge } = this;
    const targetEdge = edge.getTarget();
    return !!target.get('isAnchorPoint') && !isPlainObject(targetEdge);
  },

  handleNodeMouseEnter(e: GraphEvent) {
    const { graph, getAnchorPointStateOfSourceNode } = this;

    const sourceNode = e.item as Node;
    const sourceAnchorPoints = sourceNode.getAnchorPoints() as AnchorPoint[];
    const sourceAnchorPointsState = [];

    sourceAnchorPoints.forEach(sourceAnchorPoint => {
      sourceAnchorPointsState.push(getAnchorPointStateOfSourceNode(sourceNode, sourceAnchorPoint));
    });

    sourceNode.set('anchorPointsState', sourceAnchorPointsState);

    graph.setItemState(sourceNode, ItemState.ActiveAnchorPoints, true);
  },

  handleNodeMouseLeave(e: GraphEvent) {
    const { graph, edge } = this;
    const { item } = e;

    if (!edge) {
      item.set('anchorPointsState', []);
      graph.setItemState(item, ItemState.ActiveAnchorPoints, false);
    }
  },

  handleNodeMouseDown(e: GraphEvent) {
    if (!this.shouldBegin(e) || !this.shouldAddDelegateEdge(e)) {
      return;
    }

    const { graph, edgeType, getAnchorPointStateOfTargetNode } = this;
    const { target } = e;

    const sourceNode = e.item as Node;
    const sourceNodeId = sourceNode.getModel().id;
    const sourceAnchorPointIndex = target.get('anchorPointIndex');
    const sourceAnchorPoint = sourceNode.getAnchorPoints()[sourceAnchorPointIndex] as AnchorPoint;

    const model: EdgeModel = {
      id: guid(),
      label: 'label',
      type: edgeType,
      source: sourceNodeId,
      sourceAnchor: sourceAnchorPointIndex,
      target: {
        x: e.x,
        y: e.y,
      },
      ...this.getDefaultEdgeModel(),
    };

    this.edge = graph.addItem(ItemType.Edge, model);

    graph.getNodes().forEach(targetNode => {
      if (targetNode.getModel().id === sourceNodeId) {
        return;
      }

      const targetAnchorPoints = targetNode.getAnchorPoints() as AnchorPoint[];
      const targetAnchorPointsState = [];

      targetAnchorPoints.forEach(targetAnchorPoint => {
        targetAnchorPointsState.push(
          getAnchorPointStateOfTargetNode(sourceNode, sourceAnchorPoint, targetNode, targetAnchorPoint),
        );
      });

      targetNode.set('anchorPointsState', targetAnchorPointsState);

      graph.setItemState(targetNode, ItemState.ActiveAnchorPoints, true);
    });
  },

  handleMouseMove(e: GraphEvent) {
    const { graph, edge } = this;

    if (!edge) {
      return;
    }

    if (this.canFindTargetAnchorPoint(e)) {
      const { item, target } = e;

      const targetId = item.getModel().id;
      const targetAnchor = target.get('anchorPointIndex');

      graph.updateItem(edge, {
        target: targetId,
        targetAnchor,
      });
    } else {
      graph.updateItem(edge, {
        target: {
          x: e.x,
          y: e.y,
        },
        targetAnchor: undefined,
      });
    }
  },

  customValidation() {
    return true;
  },

  handleMouseUp(e: GraphEvent) {
    const { graph, edge } = this;

    if (!edge) {
      return;
    }

    if (!this.shouldAddRealEdge(e) || !this.customValidation(e)) {
      graph.removeItem(this.edge);
    } else {
      graph.emit(GraphCustomEvent.onAfterConnect, {
        edge: this.edge,
      });

      const modelEdge = this.edge.getModel();
      graph.removeItem(this.edge);

      const commandManager = graph.get('commandManager');

      commandManager.execute(graph, EditorCommand.Add, {
        type: ItemType.Edge,
        model: modelEdge,
      });
    }

    this.edge = null;

    graph.getNodes().forEach(node => {
      node.set('anchorPointsState', []);
      graph.setItemState(node, ItemState.ActiveAnchorPoints, false);
    });
  },
};

behaviorManager.register('drag-add-edge', dragAddEdgeBehavior);
