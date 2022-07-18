import { guid, executeBatch, isDefined } from '@/utils';
import { ItemType, GraphCustomEvent, GraphMode } from '@/common/constants';
import { NodeModel, Graph } from '@/common/interfaces';
import { BaseCommand, baseCommand } from '@/components/Graph/command/base';

export interface DuplicateCommandParams {
  models: NodeModel[];
  mapNode: (item) => any;
}

export const dublicateCommand: BaseCommand<DuplicateCommandParams> = {
  ...baseCommand,

  params: {
    models: [],
    mapNode: () => {},
  },

  canExecute(graph: Graph) {
    return graph.getCurrentMode() !== GraphMode.Readonly && !!this.getSelectedNodes(graph).length;
  },

  init(graph: Graph) {
    const selectedNodes = this.getSelectedNodes(graph);

    const models = selectedNodes.map(node => node.getModel());

    const offsetX = 10;
    const offsetY = 10;

    this.params.models = models.map(model => {
      const { x, y } = model;
      if (isDefined(this.params.mapNode)) {
        return {
          ...model,
          ...this.params.mapNode(model),
          id: guid(),
          x: x + offsetX,
          y: y + offsetY,
        };
      }
      return {
        ...model,
        startNode: false,
        id: guid(),
        x: x + offsetX,
        y: y + offsetY,
      };
    });
  },

  execute(graph: Graph) {
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

  undo(graph: Graph) {
    const { models } = this.params;

    executeBatch(graph, () => {
      models.forEach(model => {
        graph.removeItem(model.id);
      });
    });
  },

  shortcuts: [['shiftKey', 'KeyD']],
};

export default dublicateCommand;
