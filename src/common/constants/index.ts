export const FLOW_CONTAINER_ID = 'FlowContainer';
export const MIND_CONTAINER_ID = 'MindContainer';

export const LABEL_DEFAULT_TEXT = 'Main';

export enum RendererType {
  Canvas = 'canvas',
  Svg = 'svg',
}

export enum ItemType {
  Node = 'node',
  Edge = 'edge',
  Combo = 'combo',
}

export enum ShapeClassName {
  Label = 'node-label',
  KeyShape = 'node-shape',
  Wrapper = 'node-wrapper',
  Appendix = 'node-appendix',
  Anchor = 'Anchor',
  CollapseExpandButton = 'CollapseExpandButton',
  StatusIcon = 'StatusIcon',
}

export enum ItemState {
  Active = 'active',
  ActiveAnchorPoints = 'activeAnchorPoints',
  ActiveAnchor = 'activeAnchor',
  Selected = 'selected',
  HighLight = 'highLight',
  Error = 'error',
}

export enum GraphType {
  Flow = 'flow',
  Mind = 'mind',
}

export enum GraphMode {
  Default = 'default',
  AddNode = 'addNode',
  Readonly = 'readonly',
}

export enum GraphState {
  NodeSelected = 'nodeSelected',
  EdgeSelected = 'edgeSelected',
  ComboSelected = 'comboSelected',
  MultiSelected = 'multiSelected',
  CanvasSelected = 'canvasSelected',
}

export enum LabelState {
  Hide = 'hide',
  Show = 'show',
}

export enum AnchorPointState {
  Enabled = 'enabled',
  Disabled = 'disabled',
  Active = 'active',
  Default = 'default',
}

export enum EditorEvent {
  onBeforeExecuteCommand = 'onBeforeExecuteCommand',
  onAfterExecuteCommand = 'onAfterExecuteCommand',
  onGraphStateChange = 'onGraphStateChange',
  onLabelStateChange = 'onLabelStateChange',
}

export enum EditorCommand {
  Undo = 'undo',
  Redo = 'redo',
  Add = 'add',
  Update = 'update',
  Remove = 'remove',
  Copy = 'copy',
  Paste = 'paste',
  PasteHere = 'pasteHere',
  ZoomIn = 'zoomIn',
  ZoomOut = 'zoomOut',
  AutoZoom = 'autoZoom',
  Topic = 'topic',
  Subtopic = 'subtopic',
  Fold = 'fold',
  Unfold = 'unfold',
  ToFront = 'toFront',
  ToBack = 'toBack',
  Duplicate = 'duplicate',
  ResetZoom = 'resetZoom',
  ShowEdges = 'showEdges',
  HideEdges = 'hideEdges',
  ChangeEdgeControll = 'changeEdgeControll',
}

export enum GraphComboEvent {
  onComboClick = 'combo:click',
  onComboDoubleClick = 'combo:dblclick',
  onComboMouseEnter = 'combo:mouseenter',
  onComboMouseMove = 'combo:mousemove',
  onComboMouseOut = 'combo:mouseout',
  onComboMouseOver = 'combo:mouseover',
  onComboMouseLeave = 'combo:mouseleave',
  onComboMouseDown = 'combo:mousedown',
  onComboMouseUp = 'combo:mouseup',
  onComboContextMenu = 'combo:contextmenu',
  onComboDragStart = 'combo:dragstart',
  onComboDrag = 'combo:drag',
  onComboDragEnd = 'combo:dragend',
  onComboDragEnter = 'combo:dragenter',
  onComboDragLeave = 'combo:dragleave',
  onComboDrop = 'combo:drop',
}

export enum GraphCommonEvent {
  onClick = 'click',
  onDoubleClick = 'dblclick',
  onMouseEnter = 'mouseenter',
  onMouseMove = 'mousemove',
  onMouseOut = 'mouseout',
  onMouseOver = 'mouseover',
  onMouseLeave = 'mouseleave',
  onMouseDown = 'mousedown',
  onMouseUp = 'mouseup',
  onContextMenu = 'contextmenu',
  onDragStart = 'dragstart',
  onDrag = 'drag',
  onDragEnd = 'dragend',
  onDragEnter = 'dragenter',
  onDragLeave = 'dragleave',
  onDrop = 'drop',
  onKeyDown = 'keydown',
  onKeyUp = 'keyup',
  onTouchStart = 'touchstart',
  onTouchMove = 'touchmove',
  onTouchEnd = 'touchend',
}

export enum GraphNodeEvent {
  onNodeClick = 'node:click',
  onNodeDoubleClick = 'node:dblclick',
  onNodeMouseEnter = 'node:mouseenter',
  onNodeMouseMove = 'node:mousemove',
  onNodeMouseOut = 'node:mouseout',
  onNodeMouseOver = 'node:mouseover',
  onNodeMouseLeave = 'node:mouseleave',
  onNodeMouseDown = 'node:mousedown',
  onNodeMouseUp = 'node:mouseup',
  onNodeContextMenu = 'node:contextmenu',
  onNodeDragStart = 'node:dragstart',
  onNodeDrag = 'node:drag',
  onNodeDragEnd = 'node:dragend',
  onNodeDragEnter = 'node:dragenter',
  onNodeDragLeave = 'node:dragleave',
  onNodeDrop = 'node:drop',
}

export enum GraphEdgeEvent {
  onEdgeClick = 'edge:click',
  onEdgeDoubleClick = 'edge:dblclick',
  onEdgeMouseEnter = 'edge:mouseenter',
  onEdgeMouseMove = 'edge:mousemove',
  onEdgeMouseOut = 'edge:mouseout',
  onEdgeMouseOver = 'edge:mouseover',
  onEdgeMouseLeave = 'edge:mouseleave',
  onEdgeMouseDown = 'edge:mousedown',
  onEdgeMouseUp = 'edge:mouseup',
  onEdgeContextMenu = 'edge:contextmenu',
}

export enum GraphCanvasEvent {
  onCanvasClick = 'canvas:click',
  onCanvasDoubleClick = 'canvas:dblclick',
  onCanvasMouseEnter = 'canvas:mouseenter',
  onCanvasMouseMove = 'canvas:mousemove',
  onCanvasMouseOut = 'canvas:mouseout',
  onCanvasMouseOver = 'canvas:mouseover',
  onCanvasMouseLeave = 'canvas:mouseleave',
  onCanvasMouseDown = 'canvas:mousedown',
  onCanvasMouseUp = 'canvas:mouseup',
  onCanvasContextMenu = 'canvas:contextmenu',
  onCanvasDragStart = 'canvas:dragstart',
  onCanvasDrag = 'canvas:drag',
  onCanvasDragEnd = 'canvas:dragend',
  onCanvasDragEnter = 'canvas:dragenter',
  onCanvasDragLeave = 'canvas:dragleave',
}

export enum GraphCustomEvent {
  onBeforeRender = 'beforerender',
  onAfterRender = 'afterrender',
  onBeforeAddItem = 'beforeadditem',
  onAfterAddItem = 'afteradditem',
  onBeforeRemoveItem = 'beforeremoveitem',
  onAfterRemoveItem = 'afterremoveitem',
  onBeforeUpdateItem = 'beforeupdateitem',
  onAfterUpdateItem = 'afterupdateitem',
  onBeforeItemVisibilityChange = 'beforeitemvisibilitychange',
  onAfterItemVisibilityChange = 'afteritemvisibilitychange',
  onBeforeItemStateChange = 'beforeitemstatechange',
  onAfterItemStateChange = 'afteritemstatechange',
  onBeforeRefreshItem = 'beforerefreshitem',
  onAfterRefreshItem = 'afterrefreshitem',
  onBeforeItemStatesClear = 'beforeitemstatesclear',
  onAfterItemStatesClear = 'afteritemstatesclear',
  onBeforeLayout = 'beforelayout',
  onAfterLayout = 'afterlayout',
  onBeforeConnect = 'beforeconnect',
  onAfterConnect = 'afterconnect',
  onHidePortalTriger = 'hideportaltriger',
  onShowActionMenu = 'showactionmenu',
  onAfterResize = 'afterresize',
  onClickTag = 'clicktag',
  onAfterRemoveNode = 'afterremovenode',
  onContainerSizeChange = 'containersizechange',
  onAfterVisibilityChangeAllEdges = 'onaftervisibilitychangealledges',
}

export enum CustomEvent {
  INIT_GRAPH = 'initGraph',
  BEFORE_LAYOUT = 'beforeLayout',
}

export const ANCHOR_POINT_NAME = 'anchorPoint';

export enum G6Event {
  CLICK = 'click',
  DBLCLICK = 'dblclick',
  MOUSEDOWN = 'mousedown',
  MOUDEUP = 'mouseup',
  CONTEXTMENU = 'contextmenu',
  MOUSEENTER = 'mouseenter',
  MOUSEOUT = 'mouseout',
  MOUSEOVER = 'mouseover',
  MOUSEMOVE = 'mousemove',
  MOUSELEAVE = 'mouseleave',
  DRAGSTART = 'dragstart',
  DRAGEND = 'dragend',
  DRAG = 'drag',
  DRAGENTER = 'dragenter',
  DRAGLEAVE = 'dragleave',
  DRAGOVER = 'dragover',
  DRAGOUT = 'dragout',
  DDROP = 'drop',
  KEYUP = 'keyup',
  KEYDOWN = 'keydown',
  WHEEL = 'wheel',
  FOCUS = 'focus',
  BLUR = 'blur',

  TOUCHSTART = 'touchstart',
  TOUCHMOVE = 'touchmove',
  TOUCHEND = 'touchend',

  NODE_CONTEXTMENU = 'node:contextmenu',
  NODE_CLICK = 'node:click',
  NODE_DBLCLICK = 'node:dblclick',
  NODE_MOUSEDOWN = 'node:mousedown',
  NODE_MOUSEUP = 'node:mouseup',
  NODE_MOUSEENTER = 'node:mouseenter',
  NODE_MOUSELEAVE = 'node:mouseleave',
  NODE_MOUSEMOVE = 'node:mousemove',
  NODE_MOUSEOUT = 'node:mouseout',
  NODE_MOUSEOVER = 'node:mouseover',
  NODE_DROP = 'node:drop',
  NODE_DRAGOVER = 'node:dragover',
  NODE_DRAGENTER = 'node:dragenter',
  NODE_DRAGLEAVE = 'node:dragleave',
  NODE_DRAGSTART = 'node:dragstart',
  NODE_DRAG = 'node:drag',
  NODE_DRAGEND = 'node:dragend',
  COMBO_CONTEXTMENU = 'combo:contextmenu',
  COMBO_CLICK = 'combo:click',
  COMBO_DBLCLICK = 'combo:dblclick',
  COMBO_MOUSEDOWN = 'combo:mousedown',
  COMBO_MOUSEUP = 'combo:mouseup',
  COMBO_MOUSEENTER = 'combo:mouseenter',
  COMBO_MOUSELEAVE = 'combo:mouseleave',
  COMBO_MOUSEMOVE = 'combo:mousemove',
  COMBO_MOUSEOUT = 'combo:mouseout',
  COMBO_MOUSEOVER = 'combo:mouseover',
  COMBO_DROP = 'combo:drop',
  COMBO_DRAGOVER = 'combo:dragover',
  COMBO_DRAGENTER = 'combo:dragenter',
  COMBO_DRAGLEAVE = 'combo:dragleave',
  COMBO_DRAGSTART = 'combo:dragstart',
  COMBO_DRAG = 'combo:drag',
  COMBO_DRAGEND = 'combo:dragend',

  EDGE_CONTEXTMENU = 'edge:contextmenu',
  EDGE_CLICK = 'edge:click',
  EDGE_DBLCLICK = 'edge:dblclick',
  EDGE_MOUSEDOWN = 'edge:mousedown',
  EDGE_MOUSEUP = 'edge:mouseup',
  EDGE_MOUSEENTER = 'edge:mouseenter',
  EDGE_MOUSELEAVE = 'edge:mouseleave',
  EDGE_MOUSEMOVE = 'edge:mousemove',
  EDGE_MOUSEOUT = 'edge:mouseout',
  EDGE_MOUSEOVER = 'edge:mouseover',
  EDGE_DROP = 'edge:drop',
  EDGE_DRAGOVER = 'edge:dragover',
  EDGE_DRAGENTER = 'edge:dragenter',
  EDGE_DRAGLEAVE = 'edge:dragleave',

  CANVAS_CONTEXTMENU = 'canvas:contextmenu',
  CANVAS_CLICK = 'canvas:click',
  CANVAS_DBLCLICK = 'canvas:dblclick',
  CANVAS_MOUSEDOWN = 'canvas:mousedown',
  CANVAS_MOUSEUP = 'canvas:mouseup',
  CANVAS_MOUSEENTER = 'canvas:mouseenter',
  CANVAS_MOUSELEAVE = 'canvas:mouseleave',
  CANVAS_MOUSEMOVE = 'canvas:mousemove',
  CANVAS_MOUSEOUT = 'canvas:mouseout',
  CANVAS_MOUSEOVER = 'canvas:mouseover',
  CANVAS_DROP = 'canvas:drop',
  CANVAS_DRAGENTER = 'canvas:dragenter',
  CANVAS_DRAGLEAVE = 'canvas:dragleave',
  CANVAS_DRAGSTART = 'canvas:dragstart',
  CANVAS_DRAG = 'canvas:drag',
  CANVAS_DRAGEND = 'canvas:dragend',

  BEFORERENDER = 'beforerender',
  AFTERRENDER = 'afterrender',
  BEFOREADDITEM = 'beforeadditem',
  AFTERADDITEM = 'afteradditem',
  BEFOREREMOVEITEM = 'beforeremoveitem',
  AFTERREMOVEITEM = 'afterremoveitem',
  BEFOREUPDATEITEM = 'beforeupdateitem',
  AFTERUPDATEITEM = 'afterupdateitem',
  BEFOREITEMVISIBILITYCHANGE = 'beforeitemvisibilitychange',
  AFTERITEMVISIBILITYCHANGE = 'afteritemvisibilitychange',
  BEFOREITEMSTATECHANGE = 'beforeitemstatechange',
  AFTERITEMSTATECHANGE = 'afteritemstatechange',
  BEFOREITEMREFRESH = 'beforeitemrefresh',
  AFTERITEMREFRESH = 'afteritemrefresh',
  BEFOREITEMSTATESCLEAR = 'beforeitemstatesclear',
  AFTERITEMSTATESCLEAR = 'afteritemstatesclear',
  BEFOREMODECHANGE = 'beforemodechange',
  AFTERMODECHANGE = 'aftermodechange',
  BEFORELAYOUT = 'beforelayout',
  AFTERLAYOUT = 'afterlayout',
  BEFORECREATEEDGE = 'beforecreateedge',
  AFTERCREATEEDGE = 'aftercreateedge',
  BEFOREGRAPHREFRESHPOSITION = 'beforegraphrefreshposition',
  AFTERGRAPHREFRESHPOSITION = 'aftergraphrefreshposition',
  BEFOREGRAPHREFRESH = 'beforegraphrefresh',
  AFTERGRAPHREFRESH = 'aftergraphrefresh',
  BEFOREANIMATE = 'beforeanimate',
  AFTERANIMATE = 'afteranimate',
  BEFOREPAINT = 'beforepaint',
  AFTERPAINT = 'afterpaint',

  GRAPHSTATECHANGE = 'graphstatechange',
  AFTERACTIVATERELATIONS = 'afteractivaterelations',
  NODESELECTCHANGE = 'nodeselectchange',
  TOOLTIPCHANGE = 'tooltipchange',
  WHEELZOOM = 'wheelzoom',
  VIEWPORTCHANGE = 'viewportchange',
  DRAGNODEEND = 'dragnodeend',
  STACKCHANGE = 'stackchange',
}
