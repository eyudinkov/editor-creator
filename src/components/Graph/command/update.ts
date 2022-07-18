import pick from 'lodash/pick';
import { Graph, TreeGraph, NodeModel, EdgeModel } from '@/common/interfaces';
import { BaseCommand, baseCommand } from '@/components/Graph/command/base';
import { GraphMode } from '@/common/constants';

export interface UpdateCommandParams {
  id: string;
  originModel: Partial<NodeModel> | EdgeModel;
  updateModel: Partial<NodeModel> | EdgeModel;
  forceRefreshLayout: boolean;
}

const updateCommand: BaseCommand<UpdateCommandParams, Graph & TreeGraph> = {
  ...baseCommand,

  params: {
    id: '',
    originModel: {},
    updateModel: {},
    forceRefreshLayout: false,
  },

  canExecute(graph: Graph) {
    const item = graph.findById(this.params.id);
    return graph.getCurrentMode() !== GraphMode.Readonly && item != null;
  },

  init(graph: Graph) {
    const { id, updateModel } = this.params;

    const updatePaths = Object.keys(updateModel);
    const originModel = pick(graph.findById(id).getModel(), updatePaths);

    this.params.originModel = originModel;
  },

  execute(graph: Graph) {
    const { id, updateModel, forceRefreshLayout } = this.params;

    graph.updateItem(id, updateModel);

    if (forceRefreshLayout) {
      graph.refreshLayout && graph.refreshLayout(false);
    }
  },

  undo(graph: Graph) {
    const { id, originModel } = this.params;

    graph.updateItem(id, originModel);
  },
};

export default updateCommand;
