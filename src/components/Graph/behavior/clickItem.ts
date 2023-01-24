import { isMind, isEdge, getGraphState, clearSelectedState } from '@/utils';
import { ItemState, GraphState, EditorEvent, GraphCustomEvent } from '@/common/constants';
import { Item, Behavior } from '@/common/interfaces';
import behaviorManager from '@/common/behaviorManager';
import Canvas from '@antv/g-canvas/lib/canvas';

interface ClickItemBehavior extends Behavior {
  handleItemClick({ item, x, y, target }: { item: Item; x: number; y: number; target: Item & Canvas }): void;
  handleCanvasClick(): void;
  handleKeyDown(e: KeyboardEvent): void;
  handleKeyUp(e: KeyboardEvent): void;
}

interface DefaultConfig {
  multiple: boolean;
  keydown: boolean;
  keyCode: number;
}

const clickItemBehavior: ClickItemBehavior & ThisType<ClickItemBehavior & DefaultConfig> = {
  getDefaultCfg(): DefaultConfig {
    return {
      multiple: true,
      keydown: false,
      keyCode: 16,
    };
  },

  getEvents() {
    return {
      'node:click': 'handleItemClick',
      'edge:click': 'handleItemClick',
      'combo:click': 'handleItemClick',
      'canvas:click': 'handleCanvasClick',
      keydown: 'handleKeyDown',
      keyup: 'handleKeyUp',
    };
  },

  handleItemClick({ target, x, y, item }) {
    const { graph } = this;

    if (isMind(graph) && isEdge(item)) {
      return;
    }

    const isSelected = item.hasState(ItemState.Selected);

    if (this.multiple && this.keydown) {
      graph.setItemState(item, ItemState.Selected, !isSelected);
      graph.emit(GraphCustomEvent.onHidePortalTrigger, null);
    } else {
      clearSelectedState(graph, selectedItem => {
        return selectedItem !== item;
      });

      const attrsTarget = target.get('attrs');
      const { isTag = false } = attrsTarget;

      if (isTag) {
        graph.emit(GraphCustomEvent.onClickTag, { item, x, y });
      } else {
        if (!isSelected) {
          graph.setItemState(item, ItemState.Selected, true);
        }
        graph.emit(GraphCustomEvent.onShowActionMenu, { item });
      }
    }

    if (isEdge(item)) {
      item.toFront();
    }

    graph.emit(EditorEvent.onGraphStateChange, {
      graphState: getGraphState(graph),
    });
  },

  handleCanvasClick() {
    const { graph } = this;

    clearSelectedState(graph);

    graph.emit(EditorEvent.onGraphStateChange, {
      graphState: GraphState.CanvasSelected,
    });
  },

  handleKeyDown(e) {
    this.keydown = (e.keyCode || e.which) === this.keyCode;
  },

  handleKeyUp() {
    this.keydown = false;
  },
};

behaviorManager.register('click-item', clickItemBehavior);
