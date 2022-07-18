import { BaseCommand, baseCommand } from '@/components/Graph/command/base';
import { GraphCustomEvent } from '@/common/constants';
import { Graph } from '@/common/interfaces';

const resetZoomCommand: BaseCommand = {
  ...baseCommand,

  canUndo() {
    return false;
  },

  execute(graph: Graph) {
    graph.emit(GraphCustomEvent.onHidePortalTriger, null);

    graph.zoomTo(1);
  },
};

export default resetZoomCommand;
