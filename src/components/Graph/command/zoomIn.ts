import { BaseCommand, baseCommand } from '@/components/Graph/command/base';
import { GraphCustomEvent } from '@/common/constants';
import { Graph } from '@/common/interfaces';

const DELTA = 0.05;

const zoomInCommand: BaseCommand = {
  ...baseCommand,

  canUndo() {
    return false;
  },

  execute(graph: Graph) {
    const ratio = 1 + DELTA;

    const zoom = graph.getZoom() * ratio;
    const maxZoom = graph.get('maxZoom');

    if (zoom > maxZoom) {
      return;
    }

    graph.emit(GraphCustomEvent.onHidePortalTrigger, null);

    const container = graph.get('container');
    const { clientWidth = 0, clientHeight = 0 } = container;

    graph.zoom(ratio, { x: clientWidth / 2, y: clientHeight / 2 });
  },

  shortcuts: [
    ['metaKey', 'Equal'],
    ['ctrlKey', 'Equal'],
  ],
};

export default zoomInCommand;
