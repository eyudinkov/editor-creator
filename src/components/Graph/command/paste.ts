import { guid, executeBatch } from '@/utils';
import global from '@/common/global';
import { ItemType, GraphMode, GraphCustomEvent } from '@/common/constants';
import { NodeModel } from '@/common/interfaces';
import { BaseCommand, baseCommand } from '@/components/Graph/command/base';

export interface PasteCommandParams {
  models: NodeModel[];
}

const pasteCommand: BaseCommand<PasteCommandParams> = {
  ...baseCommand,

  params: {
    models: [],
  },

  canExecute(graph) {
    return graph.getCurrentMode() !== GraphMode.Readonly && !!global.clipboard.models.length;
  },

  init() {
    const { models } = global.clipboard;

    const offsetX = 10;
    const offsetY = 10;

    this.params = {
      models: models.map(model => {
        const { x, y } = model;

        return {
          ...model,
          id: guid(),
          x: x + offsetX,
          y: y + offsetY,
        };
      }),
    };
  },

  execute(graph) {
    const { models } = this.params;

    executeBatch(graph, () => {
      models.forEach(model => {
        graph.addItem(ItemType.Node, model);
      });
    });

    this.setSelectedItems(
      graph,
      models.map(model => model.id),
    );

    if (models.length === 1) {
      const item = graph.findById(models[0].id);

      graph.emit(GraphCustomEvent.onShowActionMenu, { item });
    }
  },

  undo(graph) {
    const { models } = this.params;

    executeBatch(graph, () => {
      models.forEach(model => {
        graph.removeItem(model.id);
      });
    });
  },

  shortcuts: [
    ['metaKey', 'KeyV'],
    ['ctrlKey', 'KeyV'],
  ],
};

export default pasteCommand;
