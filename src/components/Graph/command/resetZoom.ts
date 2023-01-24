import { BaseCommand, baseCommand } from '@/components/Graph/command/base';
import { GraphCustomEvent } from '@/common/constants';
import { Graph } from '@/common/interfaces';

const resetZoomCommand: BaseCommand = {
  ...baseCommand,

  canUndo() {
    return false;
  },

  execute(graph: Graph) {
    graph.emit(GraphCustomEvent.onHidePortalTrigger, null);

    graph.zoomTo(1);
  },

  shortcuts: [
    ['metaKey', 'Digit0'],
    ['ctrlKey', 'Digit0'],
  ],
};

export default resetZoomCommand;
