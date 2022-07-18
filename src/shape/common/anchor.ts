import { ItemState, AnchorPointState, ANCHOR_POINT_NAME } from '@/common/constants';
import { ShapeStyle, NodeModel, Item, Node } from '@/common/interfaces';
import { isDefined } from '@/utils';

interface AnchorPointContextProps {
  getAnchorPoints?(model: NodeModel): number[][];
}

type GetAnchorPointStyle = (item: Node, anchorPoint: number[], state?: string) => ShapeStyle;
type GetAnchorPointDisabledStyle = (item: Node, anchorPoint: number[]) => ShapeStyle & { img?: string };

const getAnchorPointDefaultStyle: GetAnchorPointStyle = (item, anchorPoint) => {
  const shape = item.getKeyShape();
  const { width, height } = shape.getBBox();
  const typeShape = shape.get('type');

  const [x, y] = anchorPoint;
  const attrs = {
    rect: { x: width * x, y: height * y },
    circle: { x: width * x - width / 2, y: height * y - height / 2 },
  };

  return {
    ...(attrs[typeShape] || attrs.rect),
    r: 3,
    lineWidth: 2,
    fill: '#ffffff',
    stroke: '#5aaaff',
  };
};

const getAnchorPointDefaultDisabledStyle: GetAnchorPointDisabledStyle = (item, anchorPoint) => {
  const { width, height } = item.getKeyShape().getBBox();

  const [x, y] = anchorPoint;

  return {
    img:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOSIgaGVpZ2h0PSI4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xLjUxNSAxLjE3Mmw1LjY1NyA1LjY1Nm0wLTUuNjU2TDEuNTE1IDYuODI4IiBzdHJva2U9IiNGRjYwNjAiIHN0cm9rZS13aWR0aD0iMS42IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+PC9zdmc+',
    x: width * x - 4,
    y: height * y - 8,
    width: 8,
    height: 8,
  };
};

function activeAnchorPoint(
  this: AnchorPointContextProps,
  item: Node,
  name: string,
  value: boolean,
  getAnchorPointStyle: GetAnchorPointStyle,
) {
  const index = name.slice(-1);
  const group = item.getContainer();
  const shape = group.findByClassName(`anchor${index}`);
  if (isDefined(shape)) {
    const styles = getAnchorPointStyle(item, [], value ? AnchorPointState.Active : AnchorPointState.Default);
    shape.attr({
      ...styles,
    });
  }
}

function drawAnchorPoints(
  this: AnchorPointContextProps,
  item: Node,
  getAnchorPointStyle: GetAnchorPointStyle,
  getAnchorPointDisabledStyle: GetAnchorPointDisabledStyle,
) {
  const group = item.getContainer();
  const model = item.getModel() as NodeModel;
  const anchorPoints = this.getAnchorPoints ? this.getAnchorPoints(model) : [];
  const anchorPointsState = item.get('anchorPointsState') || [];
  anchorPoints.forEach((anchorPoint, index) => {
    if (anchorPointsState[index] === AnchorPointState.Enabled) {
      group.addShape('circle', {
        name: ANCHOR_POINT_NAME,
        className: `anchor${index}`,
        attrs: {
          ...getAnchorPointDefaultStyle(item, anchorPoint),
          ...getAnchorPointStyle(item, anchorPoint),
        },
        isAnchorPoint: true,
        anchorPointIndex: index,
        anchorPointState: AnchorPointState.Enabled,
      });
    } else {
      group.addShape('image', {
        name: ANCHOR_POINT_NAME,
        className: `anchor${index}`,
        attrs: {
          ...getAnchorPointDefaultDisabledStyle(item, anchorPoint),
          ...getAnchorPointDisabledStyle(item, anchorPoint),
        },
        isAnchorPoint: true,
        anchorPointIndex: index,
        anchorPointState: AnchorPointState.Disabled,
      });
    }
  });
}

function removeAnchorPoints(this: AnchorPointContextProps, item: Node) {
  const group = item.getContainer();
  const anchorPoints = group.findAllByName(ANCHOR_POINT_NAME);

  anchorPoints.forEach(anchorPoint => {
    group.removeChild(anchorPoint);
  });
}

function setAnchorPointsState(
  this: AnchorPointContextProps,
  name: string,
  value: string | boolean,
  item: Item,
  getAnchorPointStyle: GetAnchorPointStyle = () => ({}),
  getAnchorPointDisabledStyle: GetAnchorPointDisabledStyle = () => ({}),
) {
  if (name !== ItemState.ActiveAnchorPoints && name.slice(0, -1) !== ItemState.ActiveAnchor) {
    return;
  }

  if (name.slice(0, -1) === ItemState.ActiveAnchor) {
    activeAnchorPoint.call(this, item as Node, name, value as boolean, getAnchorPointStyle);
  } else {
    if (value) {
      drawAnchorPoints.call(this, item as Node, getAnchorPointStyle, getAnchorPointDisabledStyle);
    } else {
      removeAnchorPoints.call(this, item as Node);
    }
  }
}

export { setAnchorPointsState };
