import { BaseCommand, baseCommand } from '@/components/Graph/command/base';
import { GraphCustomEvent } from '@/common/constants';
import { Graph } from '@/common/interfaces';

const autoZoomCommand: BaseCommand = {
  ...baseCommand,

  canExecute(graph: Graph) {
    const edges = graph.getEdges();
    const nodes = graph.getNodes();

    return !!edges.length || !!nodes.length;
  },

  canUndo() {
    return false;
  },

  execute(graph: Graph) {
    graph.emit(GraphCustomEvent.onHidePortalTrigger, null);

    graph.fitView(5);
  },

  shortcuts: [
    ['metaKey', 'Digit1'],
    ['ctrlKey', 'Digit1'],
  ],
};

export default autoZoomCommand;
