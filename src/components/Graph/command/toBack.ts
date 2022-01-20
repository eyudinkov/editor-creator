import { executeBatch, toFront, toBack } from '@/utils';
import { BaseCommand, baseCommand } from '@/components/Graph/command/base';
import { GraphMode } from '@/common/constants';

export interface ToBackCommandParams {
  items: string[];
}

const toBackCommand: BaseCommand<ToBackCommandParams> = {
  ...baseCommand,

  params: {
    items: [],
  },

  canExecute(graph) {
    const selectedNodes = this.getSelectedNodes(graph);
    const selectedEdges = this.getSelectedEdges(graph);

    return graph.getCurrentMode() !== GraphMode.Readonly && !!(selectedNodes.length || selectedEdges.length);
  },

  init(graph) {
    const { items } = this.params;
    const selectedNodes = this.getSelectedNodes(graph);
    const selectedEdges = this.getSelectedEdges(graph);

    [...selectedNodes, ...selectedEdges].forEach(item => {
      const model = item.getModel();
      items.push(model.id);
    });
  },

  execute(graph) {
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

  undo(graph) {
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
};

export default toBackCommand;
