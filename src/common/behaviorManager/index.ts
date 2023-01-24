import G6 from '@antv/g6';
import merge from 'lodash/merge';

import { isMind, isDefined } from '@/utils';
import { GraphType } from '@/common/constants';
import { Graph, Behavior } from '@/common/interfaces';

class BehaviorManager {
  behaviors: {
    [propName: string]: Behavior;
  };

  constructor() {
    this.behaviors = {};
  }

  getRegisteredBehaviors(type: GraphType) {
    const registeredBehaviors = {};

    Object.keys(this.behaviors).forEach(name => {
      const behavior = this.behaviors[name];

      const { graphType } = behavior;

      if (graphType && graphType !== type) {
        return;
      }

      const { graphMode = 'default' } = behavior;

      if (!registeredBehaviors[graphMode]) {
        registeredBehaviors[graphMode] = {};
      }

      registeredBehaviors[graphMode][name] = name;
    });

    return registeredBehaviors;
  }

  wrapEventHandler(type: GraphType, behavior: Behavior): Behavior {
    const events = behavior.getEvents();

    Object.keys(events).forEach(event => {
      const handlerName = events[event];
      const handler = behavior[handlerName];

      behavior[handlerName] = function(...params) {
        const { graph } = this;

        if (
          (type === GraphType.Flow && isMind(graph as Graph) === false) ||
          (type === GraphType.Mind && isMind(graph as Graph))
        ) {
          handler.apply(this, params);
        }
      };
    });

    return behavior;
  }

  register(name: string, behavior: Behavior): void {
    this.behaviors[name] = behavior;
  }

  registeBehaviors(config = {}): void {
    Object.keys(this.behaviors).forEach((name: string) => {
      const behavior = merge(this.behaviors[name], isDefined(config[name]) ? config[name] : {});
      const { graphType } = behavior;

      switch (graphType) {
        case GraphType.Flow:
          G6.registerBehavior(name, this.wrapEventHandler(GraphType.Flow, behavior));
          break;

        case GraphType.Mind:
          G6.registerBehavior(name, this.wrapEventHandler(GraphType.Mind, behavior));
          break;

        default:
          G6.registerBehavior(name, behavior);
          break;
      }
    });
  }
}

export default new BehaviorManager();
