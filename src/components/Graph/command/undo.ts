import { Command } from '@/common/interfaces';
import CommandManager from '@/common/CommandManager';
import { GraphMode, GraphCustomEvent } from '@/common/constants';
import { Graph } from '@/common/interfaces';

const undoCommand: Command = {
  name: 'undo',

  params: {},

  canExecute(graph: Graph) {
    const commandManager: CommandManager = graph.get('commandManager');
    const { commandIndex } = commandManager;

    return graph.getCurrentMode() !== GraphMode.Readonly && commandIndex > 0;
  },

  shouldExecute() {
    return true;
  },

  canUndo() {
    return false;
  },

  init() {},

  execute(graph: Graph) {
    const commandManager: CommandManager = graph.get('commandManager');
    const { commandQueue, commandIndex } = commandManager;

    graph.emit(GraphCustomEvent.onHidePortalTriger, null);

    commandQueue[commandIndex - 1].undo(graph);

    commandManager.commandIndex -= 1;
  },

  undo() {},

  shortcuts: [
    ['metaKey', 'KeyZ'],
    ['ctrlKey', 'KeyZ'],
  ],
};

export default undoCommand;
