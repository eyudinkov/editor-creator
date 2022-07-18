import React from 'react';
import omit from 'lodash/omit';
import merge from 'lodash/merge';
import G6 from '@antv/g6';
import { guid, isDefined } from '@/utils';
import global from '@/common/global';
import { FLOW_CONTAINER_ID, GraphType } from '@/common/constants';
import { Graph, GraphOptions, FlowData, GraphEvent, GraphReactEventProps } from '@/common/interfaces';
import behaviorManager from '@/common/behaviorManager';
import GraphComponent from '@/components/Graph';
import { EditorError } from '@/common/editorError';
import { Modes } from '@antv/g6/lib/types';

import './behavior';

interface FlowProps extends Partial<GraphReactEventProps> {
  style?: React.CSSProperties;
  className?: string;
  data: FlowData;
  graphConfig?: Partial<GraphOptions>;
  customBehaviors?: object;
  customModes?: (mode: string, behaviors: any) => object;
}

interface FlowState {}

class Flow extends React.Component<FlowProps, FlowState> {
  static defaultProps = {
    graphConfig: {},
  };

  refGraph: React.Ref<HTMLDivElement>;
  graph: Graph | null = null;

  containerId = `${FLOW_CONTAINER_ID}_${guid()}`;

  canDragNode = (e: GraphEvent) => {
    return !['anchor', 'banAnchor'].some(item => item === e.target.get('className'));
  };

  canDragOrZoomCanvas = () => {
    const { graph } = this;

    if (!graph) {
      return false;
    }

    return (
      global.plugin.itemPopover.state === 'hide' &&
      global.plugin.contextMenu.state === 'hide' &&
      global.plugin.editableLabel.state === 'hide'
    );
  };

  parseData = data => {
    const { nodes, edges, ...props } = data;

    const mapItem = items => {
      return items.map(item => item);
    };

    return {
      ...props,
      nodes: mapItem(nodes),
      edges: mapItem(edges),
    };
  };

  initGraph = (width: number, height: number) => {
    const { containerId } = this;
    const { graphConfig, customModes, customBehaviors } = this.props;

    behaviorManager.registeBehaviors(customBehaviors);

    const modes = merge(behaviorManager.getRegisteredBehaviors(GraphType.Flow), {
      default: {
        'drag-node-custom': {
          type: 'drag-node-custom',
          enableDelegate: true,
          shouldBegin: this.canDragNode,
        },
        'drag-canvas': {
          type: 'drag-canvas',
          shouldBegin: this.canDragOrZoomCanvas,
          shouldUpdate: this.canDragOrZoomCanvas,
        },
        'zoom-canvas': {
          type: 'zoom-canvas',
          sensitivity: 3,
          shouldUpdate: this.canDragOrZoomCanvas,
        },
        'brush-select': {
          type: 'brush-select',
          brushStyle: {
            fillOpacity: 0.1,
            fill: '#40a9ff',
            stroke: '#40a9ff',
            lineWidth: 1,
          },
        },
        'recall-edge': 'recall-edge',
      },
      readonly: {
        'drag-canvas': {
          type: 'drag-canvas',
          shouldBegin: this.canDragOrZoomCanvas,
          shouldUpdate: this.canDragOrZoomCanvas,
        },
        'zoom-canvas': {
          type: 'zoom-canvas',
          sensitivity: 3,
          shouldUpdate: this.canDragOrZoomCanvas,
        },
      },
    });

    Object.keys(modes).forEach(mode => {
      const behaviors = modes[mode];
      modes[mode] = Object.values(customModes ? customModes(mode, behaviors) : behaviors);
    });

    if (isDefined(this.refGraph)) {
      try {
        this.graph = new G6.Graph({
          container: containerId,
          width,
          height,
          modes: (modes as unknown) as Modes,
          defaultNode: {
            shape: 'flowNode',
          },
          defaultEdge: {
            shape: 'flowEdge',
          },
          ...graphConfig,
        });
        return this.graph;
      } catch (error) {
        throw new EditorError(error);
      }
    }

    return null;
  };

  render() {
    const { containerId, parseData, initGraph } = this;

    return (
      <GraphComponent
        containerId={containerId}
        parseData={parseData}
        initGraph={initGraph}
        setRef={e => (this.refGraph = e)}
        {...omit(this.props, ['graphConfig', 'customModes'])}
      />
    );
  }
}

export default Flow;
