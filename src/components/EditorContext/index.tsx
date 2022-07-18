import { createContext } from 'react';
import { Graph } from '@/common/interfaces';
import withContext from '@/common/withContext';
import CommandManager from '@/common/CommandManager';

export interface EditorContextProps {
  graph: Graph | null;
  executeCommand: (name: string, params?: object) => void;
  commandManager: CommandManager;
}

export interface EditorPrivateContextProps {
  setGraph: (graph: Graph) => void;
  commandManager: CommandManager;
}

export const EditorContext = createContext({} as EditorContextProps);
export const EditorPrivateContext = createContext({} as EditorPrivateContextProps);

export const withEditorContext = withContext<EditorContextProps>(EditorContext, context => !!context.graph);
export const withEditorPrivateContext = withContext<EditorPrivateContextProps>(EditorPrivateContext);
