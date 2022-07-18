import { executeBatch, toFront, toBack } from '@/utils';
import { BaseCommand, baseCommand } from '@/components/Graph/command/base';
import { GraphMode } from '@/common/constants';
import { Graph } from '@/common/interfaces';

export interface ToFrontCommandParams {
  items: string[];
}

const toFrontCommand: BaseCommand<ToFrontCommandParams> = {
  ...baseCommand,

  params: {
    items: [],
  },

  canExecute(graph: Graph) {
    const selectedNodes = this.getSelectedNodes(graph);
    const selectedEdges = this.getSelectedEdges(graph);

    return graph.getCurrentMode() !== GraphMode.Readonly && !!(selectedNodes.length || selectedEdges.length);
  },

  init(graph: Graph) {
    const { items } = this.params;
    const selectedNodes = this.getSelectedNodes(graph);
    const selectedEdges = this.getSelectedEdges(graph);

    [...selectedNodes, ...selectedEdges].forEach(item => {
      const model = item.getModel();
      items.push(model.id);
    });
  },

  execute(graph: Graph) {
    const { items } = this.params;

    executeBatch(graph, () => {
      items.forEach(itemId => {
        const item = graph.findById(itemId);
        toFront(graph, itemId);
        item.update({
          zIndex: 1,
        });
      });
    });
  },

  undo(graph: Graph) {
    const { items } = this.params;

    executeBatch(graph, () => {
      items.forEach(itemId => {
        const item = graph.findById(itemId);
        toBack(graph, itemId);
        item.update({
          zIndex: 0,
        });
      });
    });
  },
};

export default toFrontCommand;
