import G6 from '@antv/g6';
import { GGroup, GShape } from '@/common/interfaces';
import merge from 'lodash/merge';
import isArray from 'lodash/isArray';
import { ItemState, AnchorPointState } from '@/common/constants';
import { NodeModel, CustomNode, Node } from '@/common/interfaces';
import { isDefined, optimizeMultilineText } from '@/utils';
import { ShapeStyle } from '@antv/g6/lib/types';

const WRAPPER_CLASS_NAME = 'node-wrapper';
const CONTENT_CLASS_NAME = 'node-content';
const LABEL_CLASS_NAME = 'node-label';
const SHADOW_CLASS_NAME = 'shadow';

const node: CustomNode = {
  options: {
    size: [180, 90],
    wrapperStyle: {
      fill: '#fff',
      stroke: '#fff',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowColor: '#1890ff',
      shadowBlur: 0,
      cursor: 'default',
    },
    shadowStyle: {
      fill: '#fff',
      radius: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 50,
      shadowColor: 'rgba(0, 0, 0, 0.8)',
    },
    contentStyle: {
      opacity: 0,
      strokeWidth: 0,
      stroke: '#ffffff',
      cursor: 'default',
    },
    labelStyle: {
      fill: '#000000',
      fontSize: 12,
      fontWeight: 600,
      textAlign: 'center',
      textBaseline: 'middle',
      cursor: 'default',
    },
    stateStyles: {
      [ItemState.Active]: {
        wrapperStyle: {},
        contentStyle: {},
        labelStyle: {},
      },
      [ItemState.Selected]: {
        wrapperStyle: {
          shadowBlur: 3,
        },
        contentStyle: {
          opacity: 1,
          lineWidth: 1,
          stroke: '#1890ff',
        },
        labelStyle: {},
      },
    },
    anchorPointsStyle: {
      [AnchorPointState.Default]: {
        r: 7,
        fill: '#fff',
        stroke: '#1890FF',
        lineAppendWidth: 12,
        cursor: 'default',
      },
      [AnchorPointState.Active]: {
        fill: '#1890FF',
      },
    },
  },

  getAnchorPointStyle(item: Node, anchorPoint: number[], state = AnchorPointState.Default): ShapeStyle {
    const model = item.getModel();
    const { anchorPointsStyle } = merge({}, this.options, this.getCustomConfig(model) || {}, model);
    return anchorPointsStyle[state];
  },

  getCustomConfig(): CustomNode {
    return {};
  },

  getOptions(model: NodeModel) {
    return merge({}, this.options, this.getCustomConfig(model) || {}, model);
  },

  draw(model, group) {
    this.drawShadow(model, group);

    const keyShape = this.drawWrapper(model, group);

    this.drawContent(model, group);
    this.drawLabel(model, group);

    return keyShape;
  },

  drawWrapper(model: NodeModel, group: GGroup) {
    const [width, height] = this.getSize(model);
    const { wrapperStyle } = this.getOptions(model);

    const shape = group.addShape('rect', {
      className: WRAPPER_CLASS_NAME,
      attrs: {
        x: 0,
        y: 0,
        width,
        height,
        ...wrapperStyle,
      },
      draggable: true,
    });

    return shape;
  },

  drawShadow(model: NodeModel, group: GGroup): GShape {
    const [width, height] = this.getSize(model);
    const { shadowStyle } = this.getOptions(model);

    return group.addShape('rect', {
      className: SHADOW_CLASS_NAME,
      attrs: {
        width: width - 40,
        height: 20,
        x: 20,
        y: height - 20,
        ...shadowStyle,
      },
      draggable: true,
    });
  },

  drawContent(model: NodeModel, group: GGroup) {
    const [width, height] = this.getSize(model);
    const { contentStyle } = this.getOptions(model);

    const shape = group.addShape('rect', {
      className: CONTENT_CLASS_NAME,
      attrs: {
        x: 0,
        y: 0,
        width,
        height,
        ...contentStyle,
      },
      draggable: true,
    });

    return shape;
  },

  drawLabel(model: NodeModel, group: GGroup) {
    const [width, height] = this.getSize(model);
    const { labelStyle } = this.getOptions(model);

    const labelShape = group.addShape('text', {
      className: LABEL_CLASS_NAME,
      attrs: {
        x: width / 2,
        y: height / 2,
        text: model.label,
        ...labelStyle,
      },
      draggable: true,
    });

    const { fontStyle, fontWeight, fontSize, fontFamily } = labelShape.attr();

    const text = labelShape.attr('text');
    const font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    const maxWidth = width - 60;

    labelShape.attr('text', optimizeMultilineText(text, font, 2, maxWidth));

    return labelShape;
  },

  setState(name, value, item) {
    if (this.beforeSetState) {
      this.beforeSetState(name, value, item);
    }

    const group = item.getContainer();
    const model = item.getModel();
    const states = item.getStates() as ItemState[];
    const options = this.getOptions(model);

    [WRAPPER_CLASS_NAME, CONTENT_CLASS_NAME, LABEL_CLASS_NAME].forEach(className => {
      const shape = group.findByClassName(className);

      if (isDefined(shape)) {
        const shapeName = className.split('-')[1];
        shape.attr({
          ...options[`${shapeName}Style`],
        });

        states.forEach(state => {
          if (options.stateStyles[state] && options.stateStyles[state][`${shapeName}Style`]) {
            shape.attr({
              ...options.stateStyles[state][`${shapeName}Style`],
            });
          }
        });
      }
    });

    if (name === ItemState.Selected) {
      const wrapperShape = group.findByClassName(WRAPPER_CLASS_NAME);

      const [width, height] = this.getSize(model);

      if (value) {
        wrapperShape.attr({
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
      } else {
        wrapperShape.attr({
          x: 0,
          y: 0,
          width,
          height,
        });
      }
    }

    if (this.afterSetState) {
      this.afterSetState(name, value, item);
    }
  },

  getSize(model: NodeModel) {
    const { size } = this.getOptions(model);

    if (!isArray(size)) {
      return [size, size];
    }

    return size;
  },

  setLabelText(model: NodeModel, group: GGroup) {
    const shape = group.findByClassName(LABEL_CLASS_NAME);

    if (!shape) {
      return;
    }

    const [width] = this.getSize(model);
    const { fontStyle, fontWeight, fontSize, fontFamily } = shape.attr();

    const text = model.label;
    const font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    const maxWidth = width - 60;

    shape.attr('text', optimizeMultilineText(text, font, 2, maxWidth));
  },

  update(model: NodeModel, item) {
    const group = item.getContainer();

    this.setLabelText(model, group);
  },
};

G6.registerNode('node', node);
