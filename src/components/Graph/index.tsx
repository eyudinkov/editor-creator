import React from 'react';
import pick from 'lodash/pick';
import debounce from 'lodash/debounce';

import { isMind, graphExist, isDefined } from '@/utils';
import { track } from '@/helpers';
import global from '@/common/global';
import customEventManager from '@/common/CustomEventManager';
import {
  GraphType,
  GraphCommonEvent,
  GraphNodeEvent,
  GraphEdgeEvent,
  GraphComboEvent,
  GraphCanvasEvent,
  GraphCustomEvent,
  CustomEvent,
} from '@/common/constants';
import {
  Graph,
  FlowData,
  MindData,
  GraphNativeEvent,
  GraphReactEvent,
  GraphReactEventProps,
} from '@/common/interfaces';
import { EditorPrivateContextProps, withEditorPrivateContext } from '@/components/EditorContext';

import baseCommands from './command';
import mindCommands from '@/components/Mind/command';

import './command';
import './behavior';

const FIT_VIEW_PADDING = 500;

interface GraphProps extends Partial<GraphReactEventProps>, EditorPrivateContextProps {
  style?: React.CSSProperties;
  className?: string;
  containerId: string;
  data: FlowData | MindData;
  parseData(data: object): void;
  initGraph(width: number, height: number): Graph;
  setRef: (e) => void;
}

interface GraphState {}

class GraphComponent extends React.Component<GraphProps, GraphState> {
  graph: Graph | null = null;

  componentDidMount() {
    this.initGraph();
    this.bindEvent();
    window.addEventListener('resize', debounce(this.resizeGraph, 200));
  }

  componentDidUpdate(prevProps: GraphProps) {
    const { data } = this.props;

    if (data !== prevProps.data) {
      this.changeData(data);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', debounce(this.resizeGraph, 200));
  }

  focusRootNode(graph: Graph, data: FlowData | MindData) {
    if (!isMind(graph)) {
      return;
    }

    const { id } = data as MindData;

    graph.focusItem(id);
  }

  initGraph() {
    const { containerId, parseData, initGraph, setGraph, commandManager } = this.props;
    const { clientWidth = 0, clientHeight = 0 } = document.getElementById(containerId) || {};

    const data = { ...this.props.data };

    parseData(data);

    this.graph = initGraph(clientWidth, clientHeight);

    if (!isDefined(this.graph)) return;

    this.graph.on(GraphCustomEvent.onBeforeLayout, () => {
      customEventManager.dispatch(CustomEvent.BEFORE_LAYOUT, {});
    });

    this.graph.data(data);
    this.graph.render();
    this.graph.fitView(FIT_VIEW_PADDING);
    this.focusRootNode(this.graph, data);
    this.graph.setMode('default');

    this.graph.set('commandManager', commandManager);

    let commands = baseCommands;

    if (isMind(this.graph)) {
      commands = {
        ...commands,
        ...mindCommands,
      };
    }

    Object.keys(commands).forEach(name => {
      commandManager.register(name, commands[name]);
    });

    setGraph(this.graph);

    if (global.trackable) {
      const graphType = isMind(this.graph) ? GraphType.Mind : GraphType.Flow;

      track(graphType);
    }
  }

  bindEvent() {
    const { graph, props } = this;

    if (!graph) {
      return;
    }

    const events: {
      [propName in GraphReactEvent]: GraphNativeEvent;
    } = {
      ...GraphCommonEvent,
      ...GraphNodeEvent,
      ...GraphEdgeEvent,
      ...GraphComboEvent,
      ...GraphCanvasEvent,
      ...GraphCustomEvent,
    };

    (Object.keys(events) as GraphReactEvent[]).forEach(event => {
      if (typeof props[event] === 'function') {
        graph.on(events[event], props[event]);
      }
    });

    graph.on(GraphCustomEvent.onAfterResize, () => {
      this.resizeGraph();
    });
  }

  changeData(data) {
    const { graph } = this;
    const { parseData } = this.props;

    if (!graph) {
      return;
    }

    parseData(data);

    graph.changeData(data);
    this.focusRootNode(graph, data);
    graph.fitView(FIT_VIEW_PADDING);
  }

  resizeGraph = () => {
    if (graphExist(this.graph)) {
      const { containerId } = this.props;
      const { clientWidth = 0, clientHeight = 0 } = document.getElementById(containerId) || {};

      this.graph.changeSize(clientWidth, clientHeight);
      this.graph.emit(GraphCustomEvent.onContainerSizeChange, {});
    }
  };

  render() {
    const { containerId, children, setRef } = this.props;

    return (
      <div id={containerId} ref={setRef} {...pick(this.props, ['className', 'style'])}>
        {children}
      </div>
    );
  }
}

export default withEditorPrivateContext(GraphComponent);
