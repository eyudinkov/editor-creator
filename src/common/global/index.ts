import { guid } from '@/utils';
import { NodeModel } from '@/common/interfaces';

class Global {
  version: string = process.env.EDITOR_VERSION;

  trackable = false;

  clipboard: {
    point: {
      x: number;
      y: number;
    };
    models: NodeModel[];
  } = {
    point: {
      x: 0,
      y: 0,
    },
    models: [],
  };

  component: {
    itemPanel: {
      model: Partial<NodeModel>;
      delegateShapeClassName: string;
    };
  } = {
    itemPanel: {
      model: null,
      delegateShapeClassName: `delegateShape_${guid()}`,
    },
  };

  plugin: {
    itemPopover: {
      state: 'show' | 'hide';
    };
    contextMenu: {
      state: 'show' | 'hide';
    };
    editableLabel: {
      state: 'show' | 'hide';
    };
  } = {
    itemPopover: {
      state: 'hide',
    },
    contextMenu: {
      state: 'hide',
    },
    editableLabel: {
      state: 'hide',
    },
  };
}

export default new Global();
