import { GraphCustomEvent, GraphMode } from '@/common/constants';
import { executeBatch } from '@/utils';
import { BaseCommand, baseCommand } from '@/components/Graph/command/base';
import { Graph } from '@/common/interfaces';

export interface HideEdgesParams {
  edges: string[];
}

const hideEdges: BaseCommand<HideEdgesParams> = {
  ...baseCommand,

  params: {
    edges: [],
  },

  canExecute(graph: Graph) {
    const edges = graph.getEdges();
    const hasVisibleEdges = edges.some(edge => edge.isVisible());

    return graph.getCurrentMode() !== GraphMode.Readonly && hasVisibleEdges;
  },

  init(graph: Graph) {
    const { edges } = this.params;

    if (!edges.length) {
      this.params.edges = graph.getEdges().reduce((acc: string[], edge) => {
        if (edge.isVisible()) {
          return [...acc, edge.get('id')];
        }
        return acc;
      }, []);
    }
  },

  execute(graph: Graph) {
    const { edges } = this.params;

    executeBatch(graph, () => {
      edges.forEach(id => {
        const edge = graph.findById(id);
        edge.changeVisibility(false);
      });
    });
    graph.emit(GraphCustomEvent.onAfterVisibilityChangeAllEdges, null);
  },

  undo(graph: Graph) {
    const { edges } = this.params;

    executeBatch(graph, () => {
      edges.forEach(id => {
        const edge = graph.findById(id);
        edge.changeVisibility(true);
      });
      graph.emit(GraphCustomEvent.onAfterVisibilityChangeAllEdges, null);
    });
  },

  shortcuts: [
    ['metaKey', 'KeyH'],
    ['ctrlKey', 'KeyH'],
  ],
};

export default hideEdges;
