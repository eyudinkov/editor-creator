import { GraphType } from '@/common/constants';
import { Behavior, GraphEvent } from '@/common/interfaces';
import behaviorManager from '@/common/behaviorManager';

interface HoverAnchorBehavior extends Behavior {
  onEnterAnchor(e: GraphEvent): void;
  onLeaveAnchor(e: GraphEvent): void;
}

const hoverAnchor: HoverAnchorBehavior = {
  graphType: GraphType.Flow,
  getEvents() {
    return {
      mouseover: 'onEnterAnchor',
      mouseout: 'onLeaveAnchor',
    };
  },
  shouldBegin(ev) {
    const { target } = ev;
    const targetName = target.get('name');
    if (targetName === 'anchorPoint') return true;
    else return false;
  },
  onEnterAnchor(e) {
    if (!this.shouldBegin(e)) return;
    const graph = this.graph;
    const node = e.item;
    const { target } = e;
    const index = target.cfg.anchorPointIndex;
    graph.setItemState(node, 'activeAnchor' + index, true);
  },
  onLeaveAnchor(e) {
    if (!this.shouldBegin(e)) return;
    const graph = this.graph;
    const node = e.item;
    const { target } = e;
    const index = target.cfg.anchorPointIndex;
    graph.setItemState(node, 'activeAnchor' + index, false);
  },
};

behaviorManager.register('hover-anchor', hoverAnchor);
