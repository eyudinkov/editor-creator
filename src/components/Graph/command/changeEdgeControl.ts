import { GraphMode, ItemType } from '@/common/constants';
import { EdgeModel, Graph } from '@/common/interfaces';
import { BaseCommand, baseCommand } from '@/components/Graph/command/base';
import { executeBatch } from '@/utils';

export interface ChangeEdgeControlParams {
  model: EdgeModel | null;
  updateModel: Partial<EdgeModel> | null;
}

const ChangeEdgeControl: BaseCommand<ChangeEdgeControlParams> = {
  ...baseCommand,

  canExecute(graph: Graph) {
    return graph.getCurrentMode() !== GraphMode.Readonly;
  },

  params: {
    model: null,
    updateModel: null,
  },

  execute(graph: Graph) {
    const { model, updateModel } = this.params;

    executeBatch(graph, () => {
      graph.removeItem(model.id);
      graph.add(ItemType.Edge, {
        ...model,
        ...updateModel,
      });
    });
  },

  undo(graph: Graph) {
    const { model } = this.params;

    executeBatch(graph, () => {
      graph.removeItem(model.id);
      graph.add(ItemType.Edge, model);
    });
  },
};

export default ChangeEdgeControl;
