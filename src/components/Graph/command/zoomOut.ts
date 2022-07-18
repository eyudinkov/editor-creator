import { BaseCommand, baseCommand } from '@/components/Graph/command/base';
import { GraphCustomEvent } from '@/common/constants';
import { Graph } from '@/common/interfaces';

const DELTA = 0.05;

const zoomOutCommand: BaseCommand = {
  ...baseCommand,

  canUndo() {
    return false;
  },

  execute(graph: Graph) {
    const ratio = 1 - DELTA;

    const zoom = graph.getZoom() * ratio;
    const minZoom = graph.get('minZoom');

    if (zoom < minZoom) {
      return;
    }

    graph.emit(GraphCustomEvent.onHidePortalTriger, null);

    const container = graph.get('container');
    const { clientWidth = 0, clientHeight = 0 } = container;

    graph.zoom(ratio, { x: clientWidth / 2, y: clientHeight / 2 });
  },

  shortcuts: [
    ['metaKey', 'Minus'],
    ['ctrlKey', 'Minus'],
  ],
};

export default zoomOutCommand;
