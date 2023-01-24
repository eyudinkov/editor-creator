import { isMind, getSelectedNodes, getSelectedEdges, setSelectedItems, getSelectedItems } from '@/utils';
import { LabelState, EditorEvent } from '@/common/constants';
import { Graph, Item, Node, Edge, Command } from '@/common/interfaces';

export interface BaseCommand<P = object, G = Graph> extends Command<P, G> {
  isMind(graph: G): boolean;
  getSelectedNodes(graph: G): Node[];
  getSelectedEdges(graph: G): Edge[];
  setSelectedItems(graph: G, items: Item[] | string[]): void;
  editSelectedNode(graph: G): void;
  getSelectedItems(graph: G): Item[];
}

export const baseCommand: BaseCommand = {
  name: '',

  params: {},

  canExecute() {
    return true;
  },

  shouldExecute() {
    return true;
  },

  canUndo() {
    return true;
  },

  init() {},

  execute() {},

  undo() {},

  shortcuts: [],

  isMind,

  getSelectedNodes,

  getSelectedEdges,

  setSelectedItems,

  getSelectedItems,

  editSelectedNode(graph) {
    graph.emit(EditorEvent.onLabelStateChange, {
      labelState: LabelState.Show,
    });
  },
};
