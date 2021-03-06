import {
  GraphType,
  GraphState,
  LabelState,
  EditorCommand,
  GraphCommonEvent,
  GraphNodeEvent,
  GraphEdgeEvent,
  GraphComboEvent,
  GraphCanvasEvent,
  GraphCustomEvent,
} from '@/common/constants';
import IGGroup from '@antv/g-canvas/lib/group';
import { IShape as IGShape } from '@antv/g-canvas/lib/interfaces';
import { Graph as IGraph, TreeGraph as ITreeGraph } from '@antv/g6';
import {
  IPoint,
  ShapeStyle as IShapeStyle,
  GraphOptions as IGraphOptions,
  GraphData as IGraphData,
  TreeGraphData as ITreeGraphData,
  NodeConfig as INodeConfig,
  EdgeConfig as IEdgeConfig,
  GroupConfig as IGroupConfig,
  ComboConfig as IComboConfig,
  BehaviorOption as IBehaviorOption,
  IG6GraphEvent as IGraphEvent,
} from '@antv/g6/lib/types';
import { ShapeOptions as IShapeOptions } from '@antv/g6/lib/interface/shape';
import { INode, IEdge, ICombo } from '@antv/g6/lib/interface/item';

export interface GShape extends IGShape {}
export interface GGroup extends IGGroup {}

export interface Graph extends IGraph {}
export interface TreeGraph extends ITreeGraph {}

export interface AnchorPoint extends IPoint {
  index: number;
}

export interface ShapeStyle extends IShapeStyle {}

export interface FlowData extends IGraphData {
  nodes?: NodeModel[];
  edges?: EdgeModel[];
  groups?: IGroupConfig[];
  combos?: ComboModel[];
}
export interface MindData extends ITreeGraphData {}

export interface NodeModel extends INodeConfig {
  id: string;
  x?: number;
  y?: number;
  size?: number | number[];
  anchorPoints?: number[][];
  shape?: string;
  style?: {
    fill?: string;
    stroke?: string;
    lineWidth?: number;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    [propName: string]: any;
  };
  label?: string;
  labelCfg?: NodeLabelCfg;
  center?: 'center' | 'topLeft';
  [propName: string]: any;
}
export interface EdgeModel extends IEdgeConfig {
  source: string;
  target: any;
  sourceAnchor?: number;
  targetAnchor?: number;
  startPoint?: {
    x: number;
    y: number;
  };
  endPoint?: {
    x: number;
    y: number;
  };
  shape?: string;
  style?: {
    stroke?: string;
    lineWidth?: number;
    lineAppendWidth?: number;
    endArrow: boolean;
    strokeOpacity: number;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
  };
  label?: string;
  labelCfg?: EdgeLabelCfg;
  [propName: string]: any;
}
export interface ComboModel extends IComboConfig {}
export interface GraphEvent extends IGraphEvent {}

export interface GraphOptions extends IGraphOptions {}
export interface CustomShape extends IShapeOptions {}
export interface CustomNode extends CustomShape {}
export interface CustomEdge extends CustomShape {}
export interface CustomCombo extends CustomShape {}

export type Item = Node | Edge | Combo;
export interface Node extends INode {}
export interface Edge extends IEdge {}
export interface Combo extends ICombo {}

export interface Behavior extends IBehaviorOption {
  graph?: Graph;
  graphType?: GraphType;
  graphMode?: string;
  [propName: string]: any;
}

export interface Command<P = object, G = Graph> {
  name: string;
  params: P;
  canExecute(graph: G): boolean;
  shouldExecute(graph: G): boolean;
  canUndo(graph: G): boolean;
  init(graph: G): void;
  execute(graph: G): void;
  undo(graph: G): void;
  shortcuts: string[] | string[][];
}

export interface CommandEvent {
  name: EditorCommand;
  params: object;
}

export interface GraphStateEvent {
  graphState: GraphState;
}

export interface LabelStateEvent {
  labelState: LabelState;
}

export type GraphNativeEvent =
  | GraphCommonEvent
  | GraphNodeEvent
  | GraphEdgeEvent
  | GraphComboEvent
  | GraphCanvasEvent
  | GraphCustomEvent;

export type GraphReactEvent =
  | keyof typeof GraphCommonEvent
  | keyof typeof GraphNodeEvent
  | keyof typeof GraphEdgeEvent
  | keyof typeof GraphComboEvent
  | keyof typeof GraphCanvasEvent
  | keyof typeof GraphCustomEvent;

export type GraphReactEventProps = Record<GraphReactEvent, (e) => void>;

interface LabelStyle {
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  opacity?: number;
  font?: string;
  fontSize?: number;
  [propName: string]: any;
}

interface NodeLabelCfg {
  position?: 'center' | 'top' | 'right' | 'bottom' | 'left';
  offset?: number;
  style?: LabelStyle;
}

interface EdgeLabelCfg {
  position?: 'start' | 'end' | 'center';
  refX?: number;
  refY?: number;
  style?: LabelStyle;
  autoRotate?: boolean;
}

export type Matrix = number[];
