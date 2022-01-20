<h1 align="center">Editor-Creator</h1>

<div align="center">
Editor-Creator is a graph visualization engine, which provides a bunch of predefined blocks and layouts and based on G6 and React.
</div>

## Installation

```bash
$ npm install editor-creator --save
```

## Usage

### Flow

```jsx
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

<Editor>
  <Flow data={data} />
</Editor>;
```
