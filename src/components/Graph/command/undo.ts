import { Command } from '@/common/interfaces';
import CommandManager from '@/common/CommandManager';
import { GraphMode, GraphCustomEvent } from '@/common/constants';

const undoCommand: Command = {
  name: 'undo',

  params: {},

  canExecute(graph) {
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

  execute(graph) {
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
