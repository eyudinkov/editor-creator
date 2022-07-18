import { Command, Graph } from '@/common/interfaces';
import CommandManager from '@/common/CommandManager';
import { GraphMode } from '@/common/constants';

const redoCommand: Command = {
  name: 'redo',

  params: {},

  canExecute(graph) {
    const commandManager: CommandManager = graph.get('commandManager');
    const { commandQueue, commandIndex } = commandManager;

    return graph.getCurrentMode() !== GraphMode.Readonly && commandIndex < commandQueue.length;
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

    commandQueue[commandIndex].execute(graph);

    commandManager.commandIndex += 1;
  },

  undo() {},

  shortcuts: [
    ['metaKey', 'shiftKey', 'KeyZ'],
    ['ctrlKey', 'shiftKey', 'KeyZ'],
  ],
};

export default redoCommand;
