import deepMix from '@antv/util/lib/deep-mix';
import each from '@antv/util/lib/each';
import wrapBehavior from '@antv/util/lib/wrap-behavior';
import { Graph } from '@/common/interfaces';

export interface PluginBaseConfig {
  container?: HTMLDivElement | null;
  className?: string;
  graph?: Graph;
  [key: string]: any;
}

interface EventMapType {
  [key: string]: any;
}

export default abstract class PluginBase {
  private _events: EventMapType;

  public _cfgs: PluginBaseConfig;

  public destroyed: boolean;

  constructor(cfgs?: PluginBaseConfig) {
    this._cfgs = deepMix(this.getDefaultCfgs(), cfgs);
    this._events = {};
    this.destroyed = false;
  }

  public getDefaultCfgs() {
    return {};
  }

  public initPlugin(graph: Graph) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    self.set('graph', graph);

    const events = self.getEvents();

    const bindEvents: EventMapType = {};

    each(events, (v, k) => {
      const event = wrapBehavior(self, v);
      bindEvents[k] = event;
      graph.on(k, event);
    });
    this._events = bindEvents;

    this.init();
  }

  public init() {}

  public getEvents() {
    return {};
  }

  public get(key: string) {
    return this._cfgs[key];
  }

  public set(key: string, val: any) {
    this._cfgs[key] = val;
  }

  public destroy() {}

  public destroyPlugin() {
    this.destroy();
    const graph = this.get('graph');
    const events = this._events;
    each(events, (v, k) => {
      graph.off(k, v);
    });
    (this._events as EventMapType | null) = null;
    (this._cfgs as PluginBaseConfig | null) = null;
    this.destroyed = true;
  }
}
