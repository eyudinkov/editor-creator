import { TreeGraph, MindData } from '@/common/interfaces';
import { BaseCommand } from '@/components/Graph/command/base';
import topicCommand from './topic';

export interface SubtopicCommandParams {
  id: string;
  model: MindData;
}

const subtopicCommand: BaseCommand<SubtopicCommandParams, TreeGraph> = {
  ...topicCommand,

  canExecute(graph) {
    return this.getSelectedNodes(graph)[0] ? true : false;
  },

  execute(graph) {
    const { id, model } = this.params;

    graph.addChild(model, id);

    this.setSelectedItems(graph, [model.id]);

    this.editSelectedNode(graph);
  },

  shortcuts: ['Tab'],
};

export default subtopicCommand;
