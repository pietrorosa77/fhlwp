import { nanoid } from 'nanoid';
import { NodeTypes } from '../definitions';



export const getInitialSchema = (id: string): any => {
  return {
    id,
    name: 'My Dumbot',
    nodes: {
      node1: {
        id: 'node1',
        title: 'Start!',
        user: false,
        preventRemoval: true,
        content: ['Welcome <strong>your</strong> user with a nice <i>message</i>!😂','Use an array for multiple boubbles'],
        position: {
          x: 300,
          y: 100
        },
        preventEdit: ["ports","output","preventRemoval"],
        type: NodeTypes.START,
        output: {
          type: 'null',
          id: 'start'
        },
        ports: {
          default: {
            id: 'default',
            bgColor: 'brand',
            text: 'default',
            index: 1,
            properties: {}
          }
        }
      }
    },
    links: {},
    selected: {},
    paths: {},
    version: nanoid(10)
  };
};

const MessageNode = {
  id: 'MessageNode',
  type: NodeTypes.MESSAGE,
  user: false,
  content: 'Type your message here',
  position: {
    x: 0,
    y: 0
  },
  preventEdit: ["ports","output"],
  title: 'Message',
  output: {
    id: 'messageout',
    type: 'null'
  },
  ports: {
    default: {
      id: 'default',
      text: 'default',
      index: 0,
      properties: {}
    }
  }
};

const QuestionNode = {
  id: 'QuestionNode',
  type: NodeTypes.QUESTION,
  user: true,
  content: 'Can you answer this?',
  position: {
    x: 0,
    y: 0
  },
  title: 'Question',
  output: {
    id: 'questout',
    type: 'text'
  },
  properties: {
    type: 'text',
    pattern: '',
    validationMessage: '',
    placeholder: '',
    multiline: false,
    displayAs: 'message'
  },
  preventEdit: ["ports"],
  ports: {
    default: {
      id: 'default',
      text: 'default',
      index: 0,
      properties: {}
    }
  }
};

const ButtonsNode = {
  id: 'ButtonsNode',
  type: NodeTypes.BUTTONS,
  user: true,
  content: 'pick the option!',
  position: {
    x: 0,
    y: 0
  },
  title: 'Buttons',
  output: {
    id: 'Buttons',
    type: 'text'
  },
  properties: {
    direction: 'row',
    displayAs: 'message',
    allowMultiple: false
  },
  ports: {
    default: {
      id: 'default',
      text: 'default',
      index: 1,
      properties: {}
    },
    btn1: {
      id: 'button1',
      text: 'sample button',
      index: 2,
      properties: {
        appearance:"primary",
        size:'medium'
      }
    }
  }
};

const createNode = (data: any): any => {
    return {
      ...data,
      id: nanoid(10),
      output: {
        type: data.output.type,
        id: `${data.type}_${nanoid(10)}`
      }
    };
  };

export const availableNodes = [
    {
      id: 'MessageNode',
      title: 'Message',
      icon: 'fas fa-comment',
      getNode: () => createNode(MessageNode)
    },
    {
      id: 'QuestionNode',
      title: 'Question',
      icon: 'fas fa-question-circle',
      getNode: () => createNode(QuestionNode)
    },
    {
      id: 'ButtonsNode',
      title: 'Buttons',
      icon: 'fa-solid fa-circle-dot',
      getNode: () => createNode(ButtonsNode)
    }
  ];

  // sample on how to override editor's theme. to be added after editor placeholder
  // <style type='text/css'>
  // {editorThemeOverride}
  // </style>
  // we can use this or the customtheme property when editor gets instantiated
  export const editorThemeOverride = `
  :root {
    --diagram-width: 100%;
    --diagram-height: 100%;
    --canvas-bg-color: #2a323d;
    --grid-bg-color: rgb(0 0 0 / 0%);
    --grid-lines-color: rgba(141, 208, 255, 0.1);
    --grid-lines-outline-color: none;
    --accent-color: #56bdff;
    --border-color: rgb(248, 248, 248);
    --connection-color: #56bdff;
    --brand-color: #8dd0ff;
    --bars-color: #2a323d;
    --ports-bg-color: #2a323d;
    --diagram-font-family: "Montserrat";
    --diagram-font-size: 16px;
    --node-font-color: #fff;
    --node-bg-color: #000;
    --node-head-font-size: 18px;
    --bg-inactive: rgb(153, 148, 148);
    --warning-color: rgb(248, 172, 59);
    --node-content-bgcolor: #2a323d;
    --node-content-font-color: #fff;
    --node-head-bgcolor:transparent;
    --connection-hover-color: #fff;
    --ck-z-modal:9999999999999999;
  }
`;
  
