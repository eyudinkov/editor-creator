import React, { ReactElement } from 'react';
import isArray from 'lodash/isArray';
import pick from 'lodash/pick';
import global from '@/common/global';
import { RendererType, EditorEvent, GraphCommonEvent, CustomEvent } from '@/common/constants';
import { Graph, CommandEvent } from '@/common/interfaces';
import CommandManager from '@/common/CommandManager';
import {
  EditorContext,
  EditorPrivateContext,
  EditorContextProps,
  EditorPrivateContextProps,
} from '@/components/EditorContext';
import customEventManager from '@/common/CustomEventManager';

const SPECIAL_KEYS = ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'];

interface EditorProps {
  style?: React.CSSProperties;
  children: ReactElement[];
  className?: string;
  [EditorEvent.onBeforeExecuteCommand]?: (e: CommandEvent) => void;
  [EditorEvent.onAfterExecuteCommand]?: (e: CommandEvent) => void;
}

interface EditorState extends EditorContextProps, EditorPrivateContextProps {}

class Editor extends React.Component<EditorProps, EditorState> {
  static setTrackable(trackable: boolean) {
    global.trackable = trackable;
  }

  static defaultProps = {
    [EditorEvent.onBeforeExecuteCommand]: () => {},
    [EditorEvent.onAfterExecuteCommand]: () => {},
  };

  lastMousedownTarget: HTMLElement | null = null;

  constructor(props: EditorProps) {
    super(props);

    this.state = {
      graph: null,
      setGraph: this.setGraph,
      executeCommand: this.executeCommand,
      commandManager: new CommandManager(),
    };

    this.lastMousedownTarget = null;
  }

  shouldTriggerShortcut(graph: Graph, target: HTMLElement | null) {
    const renderer: RendererType = graph.get('renderer');
    const canvasElement = graph.get('canvas').get('el');

    if (!target) {
      return false;
    }

    if (target === canvasElement) {
      return true;
    }

    if (renderer === RendererType.Svg) {
      if (target.nodeName === 'svg') {
        return true;
      }

      let parentNode = target.parentNode;

      while (parentNode && parentNode.nodeName !== 'BODY') {
        if (parentNode.nodeName === 'svg') {
          return true;
        } else {
          parentNode = parentNode.parentNode;
        }
      }

      return false;
    }
  }

  bindEvent(graph: Graph) {
    const { props } = this;

    graph.on(EditorEvent.onBeforeExecuteCommand, props[EditorEvent.onBeforeExecuteCommand]);
    graph.on(EditorEvent.onAfterExecuteCommand, props[EditorEvent.onAfterExecuteCommand]);
  }

  bindShortcut(graph: Graph) {
    const { commandManager } = this.state;

    window.addEventListener(GraphCommonEvent.onMouseDown, e => {
      this.lastMousedownTarget = e.target as HTMLElement;
    });

    graph.on(GraphCommonEvent.onKeyDown, (e: KeyboardEvent) => {
      if (!this.shouldTriggerShortcut(graph, this.lastMousedownTarget)) {
        return;
      }

      Object.values(commandManager.command).some(command => {
        const { name, shortcuts } = command;

        const flag = shortcuts.some((shortcut: string | string[]) => {
          const { code } = e;

          if (!isArray(shortcut)) {
            return shortcut === code;
          }

          if (shortcut.length === 1 && shortcut[0] === code) {
            return true;
          }

          const downKeys = SPECIAL_KEYS.filter(keyName => e[keyName]);
          return (
            downKeys.length === shortcut.length - 1 &&
            shortcut.slice(0, -1).every(keyName => downKeys.includes(keyName)) &&
            shortcut[shortcut.length - 1] === code
          );
        });

        if (flag) {
          e.preventDefault();
          e.stopPropagation();

          if (commandManager.canExecute(graph, name)) {
            e.preventDefault();

            this.executeCommand(name);

            return true;
          }
        }

        return false;
      });
    });
  }

  setGraph = (graph: Graph) => {
    this.setState({
      graph,
    });

    this.bindEvent(graph);
    this.bindShortcut(graph);
    customEventManager.dispatch(CustomEvent.INIT_GRAPH, {
      graph,
      executeCommand: this.executeCommand,
    });
  };

  executeCommand = (name: string, params?: object) => {
    const { graph, commandManager } = this.state;

    if (graph) {
      commandManager.execute(graph, name, params);
    }
  };

  render() {
    const { children } = this.props;
    const { graph, setGraph, executeCommand, commandManager } = this.state;

    return (
      <EditorContext.Provider
        value={{
          graph,
          executeCommand,
          commandManager,
        }}
      >
        <EditorPrivateContext.Provider
          value={{
            setGraph,
            commandManager,
          }}
        >
          <div {...pick(this.props, ['className', 'style'])}>{children}</div>
        </EditorPrivateContext.Provider>
      </EditorContext.Provider>
    );
  }
}

export default Editor;
