# Editor-Creator

---

[![npm](https://img.shields.io/npm/v/editor-creator)](https://www.npmjs.com/package/editor-creator)
[![npm](https://img.shields.io/npm/dm/editor-creator)](https://www.npmjs.com/package/editor-creator)

Editor-Creator is a visual graph editor based on G6 and React​​. It's a tool that provides a visual interface for creating and editing graphs. It can be used for various applications where graph visualization and manipulation is required.

![Cover](https://raw.githubusercontent.com/eyudinkov/editor-creator/main/images/cover.png)

## Installation

```bash
$ npm install editor-creator --save
```

## Usage

### Basic Example

The following example shows how to use simple Flow component from the library in your React application.

[![Edit quirky-architecture-wrdcz8](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/quirky-architecture-wrdcz8?fontsize=14&hidenavigation=1&theme=dark)

```jsx
import React from 'react';
import Editor, { Flow } from 'editor-creator';

const data = {
  nodes: [
    {
      id: '0',
      label: 'Node 1',
      x: 10,
      y: 10,
    },
    {
      id: '1',
      label: 'Node 2',
      x: 20,
      y: 250,
    },
  ],
  edges: [
    {
      label: 'Label',
      source: '0',
      target: '1',
    },
  ],
};

const FlowEditor = () => {
  return (
    <Editor className="editor">
      <Flow
        data={data}
        graphConfig={{
          renderer: 'canvas',
          defaultNode: {
            shape: 'node',
          },
          defaultEdge: {
            shape: 'flowEdge',
          },
          minZoom: 0.1,
          maxZoom: 2,
        }}
        className="editor-flow"
      />
    </Editor>
  );
};

export default FlowEditor;
```

### Advanced Example with predefined components and plugins

Below you can see a React component that serves as a graphical user interface for managing flows of nodes and edges. This component provides utilities for managing nodes and edges, such as undoing and redoing actions, copying, pasting, removing, and zooming in and out. It also features an interactive minimap and a grid layout for ease of navigation and a context menu for quick access to commands.

[![Edit ecstatic-forest-2grx8e](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/ecstatic-forest-2grx8e?fontsize=14&hidenavigation=1&theme=dark)

```jsx
import React from 'react';
import upperFirst from 'lodash/upperFirst';

import Editor, {
  Flow,
  Command,
  EditableLabel,
  ItemPanel,
  Minimap,
  ContextMenu,
  Grid,
  Item,
  constants,
} from 'editor-creator';
import { Divider, Icon } from 'antd';

import { NodePanel, EdgePanel } from '../Panel';

import './index.css';

const { EditorCommand } = constants;
const CommnadIcon = Icon.createFromIconfontCN({
  scriptUrl: 'https://at.alicdn.com/t/font_1518433_oa5sw7ezue.js', // generate in iconfont.cn
});

const COMMAND_LIST = [
  EditorCommand.Undo,
  EditorCommand.Redo,
  '|',
  EditorCommand.Copy,
  EditorCommand.Paste,
  EditorCommand.Remove,
  '|',
  EditorCommand.ZoomIn,
  EditorCommand.ZoomOut,
];

const data = {
  nodes: [
    {
      id: '0',
      label: 'Node 1',
      x: 10,
      y: 10,
    },
    {
      id: '1',
      label: 'Node 2',
      x: 20,
      y: 250,
    },
  ],
  edges: [
    {
      label: 'Label',
      source: '0',
      target: '1',
    },
  ],
};

const FlowEditor = () => {
  return (
    <Editor className="editor">
      <div className="toolbar">
        {COMMAND_LIST.map((name, index) => {
          if (name === '|') {
            return <Divider key={index} type="vertical" />;
          }
          return (
            <Command key={name} name={name} className="command" disabledClassName="disabled">
              <CommnadIcon type={`icon-${name}`} />
            </Command>
          );
        })}
      </div>
      <NodePanel />
      <EdgePanel />
      <EditableLabel />
      <ItemPanel className="item-panel">
        <Item
          className="item"
          model={{
            shape: 'node',
            size: [160, 80],
            label: 'New node',
            center: 'topLeft',
          }}
        >
          <div className="plus" />
        </Item>
      </ItemPanel>
      <Flow
        data={data}
        graphConfig={{
          renderer: 'canvas',
          defaultNode: {
            shape: 'flowNode',
          },
          defaultEdge: {
            shape: 'flowEdge',
          },
          minZoom: 0.1,
          maxZoom: 2,
        }}
        ref={component => {
          if (component) {
            const { graph } = component;
            if (graph && graph.cfg.plugins.length === 0) {
              const minimap = new Minimap({
                size: [230, 120],
                delegateStyle: {
                  fill: '#1890ff40',
                  stroke: '#1890ff40',
                },
                drawEdges: false,
              });
              const grid = new Grid(component?.graph);

              graph.addPlugin(minimap);
              graph.addPlugin(grid);

              minimap.updateCanvas();
            }
          }
        }}
        className="editor-flow"
      />
      <ContextMenu
        renderContent={(_, position, hide) => {
          const { x: left, y: top } = position;
          return (
            <div className="context" style={{ position: 'absolute', top, left }}>
              {[EditorCommand.Undo, EditorCommand.Redo, EditorCommand.PasteHere].map(name => {
                return (
                  <Command key={name} name={name} className="command" disabledClassName="disabled">
                    <div onClick={hide}>
                      <CommnadIcon type={`icon-${name}`} />
                      <span>{upperFirst(name)}</span>
                    </div>
                  </Command>
                );
              })}
            </div>
          );
        }}
      />
    </Editor>
  );
};

export default FlowEditor;
```
