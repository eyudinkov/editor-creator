import cloneDeep from 'lodash/cloneDeep';
import global from '@/common/global';
import { BaseCommand, baseCommand } from '@/components/Graph/command/base';
import { NodeModel } from '@/common/interfaces';
import { GraphMode } from '@/common/constants';

const copyCommand: BaseCommand = {
  ...baseCommand,

  canExecute(graph) {
    return graph.getCurrentMode() !== GraphMode.Readonly && !!this.getSelectedNodes(graph).length;
  },

  canUndo() {
    return false;
  },

  execute(graph) {
    const selectedNodes = this.getSelectedNodes(graph);

    global.clipboard.models = cloneDeep(selectedNodes.map(node => node.getModel() as NodeModel));
  },

  shortcuts: [
    ['metaKey', 'KeyC'],
    ['ctrlKey', 'KeyC'],
  ],
};

export default copyCommand;
