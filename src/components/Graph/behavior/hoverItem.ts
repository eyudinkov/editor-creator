import { ItemState } from '@/common/constants';
import { Item, Behavior } from '@/common/interfaces';
import behaviorManager from '@/common/behaviorManager';

interface HoverItemBehavior extends Behavior {
  handleItemMouseenter({ item }: { item: Item }): void;
  handleItemMouseleave({ item }: { item: Item }): void;
}

const hoverItemBehavior: HoverItemBehavior = {
  getEvents() {
    return {
      'node:mouseenter': 'handleItemMouseenter',
      'edge:mouseenter': 'handleItemMouseenter',
      'node:mouseleave': 'handleItemMouseleave',
      'edge:mouseleave': 'handleItemMouseleave',
    };
  },

  handleItemMouseenter({ item }) {
    const { graph } = this;

    graph.setItemState(item, ItemState.Active, true);
  },

  handleItemMouseleave({ item }) {
    const { graph } = this;

    graph.setItemState(item, ItemState.Active, false);
  },
};

behaviorManager.register('hover-item', hoverItemBehavior);
