import G6 from '@antv/g6';
import { CustomNode, Item } from '@/common/interfaces';
import { setAnchorPointsState } from '../common/anchor';

const flowNode: CustomNode = {
  afterSetState(name: string, value: string | boolean, item: Item) {
    setAnchorPointsState.call(this, name, value, item, this.getAnchorPointStyle.bind(this));
  },

  getAnchorPoints() {
    return [
      [0.5, 0],
      [0.5, 1],
      [0, 0.5],
      [1, 0.5],
    ];
  },
};

G6.registerNode('flowNode', flowNode, 'node');
