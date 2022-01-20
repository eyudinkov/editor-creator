import { GraphMode, ItemType } from '@/common/constants';
import { EdgeModel } from '@/common/interfaces';
import { BaseCommand, baseCommand } from '@/components/Graph/command/base';
import { executeBatch } from '@/utils';

export interface ChangeEdgeControllParams {
  model: EdgeModel | null;
  updateModel: Partial<EdgeModel> | null;
}

const changeEdgeControll: BaseCommand<ChangeEdgeControllParams> = {
  ...baseCommand,

  canExecute(graph) {
    return graph.getCurrentMode() !== GraphMode.Readonly;
  },

  params: {
    model: null,
    updateModel: null,
  },

  execute(graph) {
    const { model, updateModel } = this.params;

    executeBatch(graph, () => {
      graph.removeItem(model.id);
      graph.add(ItemType.Edge, {
        ...model,
        ...updateModel,
      });
    });
  },

  undo(graph) {
    const { model } = this.params;

    executeBatch(graph, () => {
      graph.removeItem(model.id);
      graph.add(ItemType.Edge, model);
    });
  },
};

export default changeEdgeControll;
