# Editor-Creator

***

[![npm](https://img.shields.io/npm/v/editor-creator)](https://www.npmjs.com/package/editor-creator)
[![npm](https://img.shields.io/npm/dm/editor-creator)](https://www.npmjs.com/package/editor-creator)

Editor-Creator is a graph visualization engine, which provides a bunch of predefined blocks and layouts and based on G6 and React.

![Cover](https://raw.githubusercontent.com/eyudinkov/editor-creator/main/images/cover.png)

## Installation

```bash
$ npm install editor-creator --save
```

## Usage

### Flow

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

const Flow = () => {
  return (
    <Editor>
      <Flow data={data} />
    </Editor>
  );
}

export default Flow;
```
