import G6 from '@antv/g6';
import { GGroup, CustomEdge, GShape, Item } from '@/common/interfaces';
import { ItemState } from '@/common/constants';
import merge from 'lodash/merge';
import isNil from 'lodash/isNil';
import { getPolygon } from '@/utils';

const { deepMix, mix, getLabelPosition } = G6.Util;

const EDGE_ACTION_LINE = 'edge-action-line';
const CLS_SHAPE = 'edge-shape';
const EDGE_LABEL_CLASS_NAME = 'edge-label';
const EDGE_LABEL_WRAPPER_CLASS_NAME = 'edge-label-wrapper-label';
const EDGE_CONTROLL_POINT_START = 'edge-controll-point-start';
const EDGE_CONTROLL_POINT_END = 'edge-controll-point-end';

const MAX_LENGTH_LABEL = 20;

const flowEdge: CustomEdge = {
  options: {
    style: {
      stroke: '#AAB7C4',
      lineWidth: 1,
      lineAppendWidth: 8,
      shadowColor: null,
      shadowBlur: 0,
      radius: 8,
      offset: 24,
      cursor: 'default',
      endArrow: {
        path: 'M 0,0 L 4,3 L 4,-3 Z',
        d: 0,
        fill: '#AAB7C4',
      },
    },
    actionLine: {
      lineWidth: 8,
      stroke: 'red',
      opacity: 0,
      cursor: 'default',
    },
    controlPoint: {
      r: 6,
      symbol: 'square',
      lineAppendWidth: 6,
      fill: 'red',
      fillOpacity: 0,
      strokeOpacity: 0,
      cursor: 'crosshair',
    },
    labelWrapper: {
      fill: '#f4f6f8',
      radius: 3,
      cursor: 'default',
    },
    labelCfg: {
      position: 'center',
      autoRotate: false,
      style: {
        fill: '#000000a6',
        fontSize: 12,
      },
    },
    stateStyles: {
      [ItemState.Active]: {
        style: {
          stroke: '#1890FF',
          endArrow: {
            path: 'M 0,0 L 4,3 L 4,-3 Z',
            d: 0,
            fill: '#1890FF',
          },
        },
      },
      [ItemState.Selected]: {
        style: {
          stroke: '#1890FF',
          endArrow: {
            path: 'M 0,0 L 4,3 L 4,-3 Z',
            d: 0,
            fill: '#1890FF',
          },
        },
      },
      [ItemState.HighLight]: {
        style: {
          stroke: '#1890FF',
          endArrow: {
            path: 'M 0,0 L 4,3 L 4,-3 Z',
            d: 0,
            fill: '#1890FF',
          },
        },
      },
    },
  },

  getControlPoints(cfg) {
    const { sourceNode: source, targetNode: target } = cfg;

    if (source === undefined || target === undefined || source === null || target === null) return;

    const points: any = {
      source: {
        ...(source as any),
        bbox: (source as any).getBBox !== undefined ? (source as any).getBBox() : undefined,
      },
      target: {
        ...(target as any),
        bbox: (target as any).getBBox !== undefined ? (target as any).getBBox() : undefined,
      },
    };

    return points as any;
  },

  getPath(points) {
    if (points.length === 2) {
      const [startPoint, endPoint] = points;
      return getPolygon([startPoint, endPoint]);
    }

    const [startPoint, { target, source }, endPoint] = points;
    return getPolygon([startPoint, endPoint], source, target);
  },

  getCustomConfig(): CustomEdge {
    return {};
  },

  getOptions(model: CustomEdge) {
    return merge({}, this.options, this.getCustomConfig(model), model);
  },

  getShapeStyle(model: any) {
    const customOptions = this.getCustomConfig(model) || {};
    const { style: defaultStyle } = this.getOptions(model);
    const { style: customStyle } = customOptions;
    const strokeStyle = {
      stroke: model.color,
    };

    const style = deepMix({}, defaultStyle, customStyle, strokeStyle, model.style);

    const size = model.size || G6.Global.defaultEdge.size;
    model = this.getPathPoints(model);
    const startPoint = model.startPoint;
    const endPoint = model.endPoint;
    const controlPoints = this.getControlPoints(model);
    let points = [startPoint];

    if (controlPoints) {
      points = points.concat(controlPoints);
    }

    points.push(endPoint);
    const path = this.getPath(points);
    const styles = G6.Util.mix(
      {},
      G6.Global.defaultEdge.style,
      {
        stroke: G6.Global.defaultEdge.color,
        lineWidth: size,
        path,
      },
      style,
    );
    return styles;
  },

  getOffsetStyle(model, group) {
    const pathShape = group.findByClassName(CLS_SHAPE);
    const {
      labelCfg: { position: labelPosition, refX, refY, autoRotate: autoRotateOpt },
    } = this.getOptions(model);
    let pointPercent;
    if (labelPosition === 'start') {
      pointPercent = 0;
    } else if (labelPosition === 'end') {
      pointPercent = 1;
    } else {
      pointPercent = 0.5;
    }
    const autoRotate = isNil(autoRotateOpt) ? false : autoRotateOpt;

    return getLabelPosition(pathShape, pointPercent, refX, refY, autoRotate);
  },

  getLabelStyle(cfg, labelCfg, group) {
    const calculateStyle = this.getLabelStyleByPosition(cfg, labelCfg, group);
    if ((cfg.label as string).length > MAX_LENGTH_LABEL) {
      (calculateStyle as any).text = `${(cfg.label as string).slice(0, MAX_LENGTH_LABEL)}...`;
    } else {
      (calculateStyle as any).text = cfg.label;
    }
    const { labelCfg: defaultLabel } = this.getOptions(cfg);

    const defaultStyle = defaultLabel ? defaultLabel.style : null;
    const labelStyle = mix({}, labelCfg.style, defaultStyle, calculateStyle);
    return labelStyle;
  },

  getLabelStyleByPosition(cfg, labelCfg, group) {
    const style: { [propName: string]: any } = {};
    const labelPosition = this.options.labelCfg.position;
    const offsetStyle = this.getOffsetStyle(cfg, group);
    style.x = offsetStyle.x;
    style.y = offsetStyle.y;
    style.textAlign = this._getTextAlign(labelPosition, offsetStyle.angle);
    style.text = cfg.label;

    return style;
  },

  createLabelWrapper(model, group: GGroup) {
    const label = group.findByClassName(EDGE_LABEL_CLASS_NAME);
    const labelWrapper = group.findByClassName(EDGE_LABEL_WRAPPER_CLASS_NAME);

    if (!label) {
      return;
    }

    if (labelWrapper) {
      labelWrapper.remove(true);
    }

    const { x, y } = this.getOffsetStyle(model, group);
    const { labelWrapper: labelWrapperStyles } = this.getOptions(model);

    group.addShape('rect', {
      className: EDGE_LABEL_WRAPPER_CLASS_NAME,
      attrs: {
        x,
        y,
        ...labelWrapperStyles,
      },
    });
    label.set('zIndex', 1);

    group.sort();
  },

  updateLabelWrapper(model, group: GGroup) {
    const label = group.findByClassName(EDGE_LABEL_CLASS_NAME);
    const labelWrapper = group.findByClassName(EDGE_LABEL_WRAPPER_CLASS_NAME);

    if (!label) {
      labelWrapper && labelWrapper.hide();
      return;
    } else {
      labelWrapper && labelWrapper.show();
    }

    if (!labelWrapper) {
      return;
    }

    const { minX, minY, width, height } = label.getBBox();

    labelWrapper.attr({
      x: minX - 5,
      y: minY - 3,
      width: width + 10,
      height: height + 6,
    });
  },

  drawControllPoints(active: boolean, item) {
    const group = item.getContainer();

    if (active) {
      const model = item.getModel();
      const {
        endPoint: { x: endX, y: endY },
        startPoint: { x: startX, y: startY },
      } = model;
      const { controlPoint: styleControlPoint } = this.getOptions(model);

      const startMarker = group.addShape('marker', {
        className: EDGE_CONTROLL_POINT_START,
        attrs: {
          x: startX,
          y: startY,
          ...styleControlPoint,
        },
      });

      const endMarker = group.addShape('marker', {
        className: EDGE_CONTROLL_POINT_END,
        attrs: {
          x: endX,
          y: endY,
          ...styleControlPoint,
        },
      });

      startMarker.set('zIndex', 2);
      endMarker.set('zIndex', 2);
      group.sort();
    } else {
      const controlPointStart = group.findByClassName(EDGE_CONTROLL_POINT_START);
      const controlPointEnd = group.findByClassName(EDGE_CONTROLL_POINT_END);
      if (controlPointStart) {
        controlPointStart.remove();
      }
      if (controlPointEnd) {
        controlPointEnd.remove();
      }
    }
  },

  updateControllPoints(model, group) {
    const controlPointStart = group.findByClassName(EDGE_CONTROLL_POINT_START);
    const controlPointEnd = group.findByClassName(EDGE_CONTROLL_POINT_END);
    const {
      endPoint: { x: endX, y: endY },
      startPoint: { x: startX, y: startY },
    } = model;

    const startMarker = controlPointStart.attr({
      x: startX,
      y: startY,
    });

    const endMarker = controlPointEnd.attr({
      x: endX,
      y: endY,
    });

    startMarker.set('zIndex', 2);
    endMarker.set('zIndex', 2);
    group.sort();
  },

  createActionLine(model, group: GGroup) {
    const shape = group.findByClassName(EDGE_ACTION_LINE);
    const { path } = this.getShapeStyle(model) as any;
    const { actionLine } = this.getOptions(model);

    if (shape) {
      shape.remove(true);
    }

    group.addShape('path', {
      className: EDGE_ACTION_LINE,
      attrs: {
        path,
        ...actionLine,
      },
    });
  },

  updateActionLine(model, group) {
    const shape = group.findByClassName(EDGE_ACTION_LINE);
    const { path } = this.getShapeStyle(model) as any;

    if (shape) {
      shape.attr({
        ...path,
      });
    }
  },

  afterDraw(model, group) {
    // this.createActionLine(model, group);
    this.createLabelWrapper(model, group);
    this.updateLabelWrapper(model, group);
  },

  afterUpdate(model, item) {
    const group = item.getContainer();

    // this.updateActionLine(model, group);
    this.updateLabelWrapper(model, group);
  },

  afterSetState(name: string, value: string | boolean, item: Item) {
    if (name === ItemState.Selected) {
      this.drawControllPoints(value, item);
    }
  },

  setState(name, value, item) {
    const shape: GShape = item.get('keyShape');
    const model = item.getModel();

    if (!shape) {
      return;
    }

    const group = item.getContainer();
    const options = this.getOptions(model);
    const states = item.getStates() as string[];

    [CLS_SHAPE].forEach(className => {
      const shape = group.findByClassName(className);
      if (shape) {
        const shapeName =
          className === EDGE_CONTROLL_POINT_START || className === EDGE_CONTROLL_POINT_END ? 'controlPoint' : 'style';
        let styles = {
          ...options[`${shapeName}`],
        };

        states.forEach(state => {
          if (options.stateStyles[state] && options.stateStyles[state][`${shapeName}`]) {
            styles = {
              ...styles,
              ...options.stateStyles[state][`${shapeName}`],
            };
          }
        });

        shape.attr(styles);
      }
    });

    this.afterSetState(name, value, item);
  },
};

G6.registerEdge('flowEdge', flowEdge, 'line');
