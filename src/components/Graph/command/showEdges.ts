import { GraphCustomEvent, GraphMode } from '@/common/constants';
import { executeBatch } from '@/utils';
import { BaseCommand, baseCommand } from '@/components/Graph/command/base';

export interface ShowEdgesParams {
  edges: string[];
}

const showEdges: BaseCommand<ShowEdgesParams> = {
  ...baseCommand,

  params: {
    edges: [],
  },

  canExecute(graph) {
    const edges = graph.getEdges();

    const hasHiddenEdges = edges.some(edge => !edge.isVisible());

    return graph.getCurrentMode() !== GraphMode.Readonly && hasHiddenEdges;
  },

  init(graph) {
    const { edges } = this.params;

    if (!edges.length) {
      this.params.edges = graph.getEdges().reduce((acc: string[], edge) => {
        if (edge.isVisible()) {
          return acc;
        }
        return [...acc, edge.get('id')];
      }, []);
    }
  },

  execute(graph) {
    const { edges } = this.params;

    executeBatch(graph, () => {
      edges.forEach(id => {
        const edge = graph.findById(id);
        edge.changeVisibility(true);
      });
      graph.emit(GraphCustomEvent.onAfterVisibilityChangeAllEdges, null);
    });
  },

  undo(graph) {
    const { edges } = this.params;

    executeBatch(graph, () => {
      edges.forEach(id => {
        const edge = graph.findById(id);
        edge.changeVisibility(false);
      });
      graph.emit(GraphCustomEvent.onAfterVisibilityChangeAllEdges, null);
    });
  },
};

export default showEdges;
