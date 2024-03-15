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

const JavascriptNode = {
  id: 'JavascriptNode',
  type: NodeTypes.CODE,
  user: true,
  content: 'Run some JS code',
  position: {
    x: 0,
    y: 0
  },
  title: 'JS code',
  output: {
    id: 'dumbotSnippet_wGmwpsb2Ml',
    type: 'code'
  },
  silent: true,
  preventEdit: ["silent","output"],
  properties: {
    code:'const callApi = async (label) => {\n    //onCallHost will call a function passed as a property into the bot instance if defined. You can cal an api\n    // from the host and provide data out\n    const data = await SnippetContext.onCallHost(label, SnippetContext.variables);\n    return data;\n  }\n\n  // you can use await \n  const res = await callApi(\"testlabel\");\n  console.log(\"RESPONSEEEEE\", res)\n  // set variables on the Bot\n  SnippetContext.onSetVariable(\"aaa\", res);\n  // read variables from the bot\n  console.log(\"Available variables\",SnippetContext.variables);\n  console.log(\"Available ports\",SnippetContext.ports);\n  // proceed with the flow on port default\n return SnippetContext.ports.exit2;'
  },
  ports: {
    default: {
      id: 'default',
      text: 'default',
      index: 1,
      properties: {}
    },
    exit1: {
      id: 'exit1',
      text: 'exit 1',
      index: 2,
      properties: { value: 'exit 1' }
    },
    exit2: {
      id: 'exit2',
      text: 'exit 2',
      index: 3,
      properties: { value: 'exit 2' }
    },
    exit3: {
      id: 'exit3',
      text: 'exit 3',
      index: 4,
      properties: { value: 'exit 3' }
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
    },
    {
      id: 'JSNode',
      title: 'Code',
      icon: 'fa-solid fa-code',
      getNode: () => createNode(JavascriptNode)
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
  
