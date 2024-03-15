import { get, isEmpty } from 'lodash';
import {
  IDmbtState,
  IDmbtShape,
  START_NODE_TYPE,
  IDmbtNode,
  IDmbtMessage,
  IDmbtMessageOutput,
  DEFAULT_NODE_PORT,
  IDmbtPort
} from '../../definitions';


// @ts-ignore
import botCss from '!!raw-loader!./baseBot.css';
// @ts-ignore
import utilityCss from '!!raw-loader!./botUtility.css';
// @ts-ignore
import hostCss from '!!raw-loader!./dumbotHost.css';

const navigateObjectPropertiesAndSubastitute = (path: string, bag: any) => {
  return get(bag, path, undefined);
};


export const substituteVars = (
  templateString: string | undefined,
  templateVariables: { [key: string]: any }
): string => {
  if (!templateVariables) {
    return templateString || '';
  }
  if (!templateString) {
    return '';
  }

  return templateString.replace(
    /\${(.*?)}/g,
    (_, g) =>
      navigateObjectPropertiesAndSubastitute(g, templateVariables) || `$\{${g}}`
  );
};

export const substituteVarsInObject = (data: any, metadata: any): any => {
  if (isEmpty(metadata)) {
    return data;
  }

  let text = JSON.stringify(data); // stringify data object
  // eslint-disable-next-line
  const myregexp = /\${([\[\]a-z\d.]+)}/i; // regex to match the content to be replaced in data
  let match;
  let new_data = '';
  while ((match = myregexp.exec(text))) {
    // loop all matches
    try {
      // Example: [0]=${user.name} / [1]=user.name
      new_data = text.replace(match[0], get(metadata, match[1]) || match[1]);
      text = new_data;
    } catch (err: any) {
      console.log("Requested element doesn't exist", err.message);
    }
    match = myregexp.exec(text);
  }

  const ret = new_data ? JSON.parse(new_data) : data;
  return ret;
};

export const getBotStartingNode = (state: IDmbtShape) => {
  const nodes = Object.keys(state.nodes).map((k) => state.nodes[k]);
  const startingNodes = nodes.filter((el: IDmbtNode) => el.type === START_NODE_TYPE || el.properties?.asStart || el.asStart);
  return startingNodes.length ? startingNodes[0] : undefined;
};

export const prepareInteractionNode = (
  node: IDmbtNode,
  variables: any
): IDmbtNode => {
  const ports = Object.keys(node.ports).reduce(
    (acc: { [key: string]: IDmbtPort }, key) => {
      const currPort = node.ports[key];
      const text = substituteVars(currPort.text, variables);
      const value = currPort.value
        ? substituteVars(currPort.value, variables)
        : text;
      return {
        ...acc,
        [`${key}`]: {
          ...currPort,
          text,
          value
        }
      };
    },
    {}
  );
  const properties = {
    ...(node.properties || {}),
    placeholder: node.properties?.placeholder
      ? substituteVars(node.properties?.placeholder, variables)
      : '',
    validationErrorMessage: node.properties?.validationErrorMessage
      ? substituteVars(node.properties?.validationErrorMessage, variables)
      : ''
  } as any;

  return {
    ...node,
    ports,
    properties
  };
};

export const getNodeMessages = (
  node: IDmbtNode | undefined,
  variables: any
): IDmbtMessage[] => {
  if (!node) {
    return [];
  }

  if (!node.content) {
    return [
      {
        id: `${node.id}-silentpart`,
        nodeId: node.id,
        output: {
          id: node.id,
          value: undefined,
          type: 'message',
          port: DEFAULT_NODE_PORT
        },
        content: 'silent message',
        interactive: node.user,
        meta: {
          silent: true,
          time: new Date().toISOString()
        }
      }
    ];
  }

  const nodeContent = Array.isArray(node.content)? node.content : node.content.split('***');

  const messages = nodeContent.map((block, i) => {
    const msg: IDmbtMessage = {
      id: `${node.id}-${i}`,
      nodeId: node.id,
      output: {
        id: node.id,
        value: undefined,
        type: 'message',
        port: DEFAULT_NODE_PORT
      },
      content:substituteVarsInObject(block, variables) , //substituteVars(mesagePart, variables),
      interactive: node.user,
      meta: {
        silent: node.silent ? true : false,
        time: new Date().toISOString()
      }
    };
    return msg;
  });

  return messages;
};

export const getUserAnswer = (
  interactionId: string,
  output: IDmbtMessageOutput,
  meta?: { [key: string]: any }
): IDmbtMessage => {
  return {
    id: `${interactionId}-answer`,
    nodeId: interactionId,
    content: output.value,
    output,
    meta: {
      ...(meta || {}),
      isUser: true,
      silent: meta?.silent || false,
      time: new Date().toISOString()
    }
  };
};

export const getInitialState = (
  shape: IDmbtShape,
  savedState?: IDmbtState,
  externalVariables?: any
): IDmbtState => {
  if (savedState) {
    return savedState;
  }

  const startNode = getBotStartingNode(shape) as IDmbtNode;
  const variables = externalVariables || {};

  return {
    variables,
    processed: [],
    active: getNodeMessages(startNode, variables),
    activeInteraction: undefined,
    interactionProgress: [],
    finished: false,
    loading: false
  };
};

export const getPortsArray = (
  portDictionary: { [key: string]: IDmbtPort },
  keepDefault = false
): IDmbtPort[] =>
    Object.keys(portDictionary).filter((key => keepDefault ? true : key !== DEFAULT_NODE_PORT)).map(key => {
        return {
            key,
            ...portDictionary[key],
            id: key
        }
    })
//   Object.entries(portDictionary)
//     .filter((e) => (keepDefault ? e[1] : e[0] !== DEFAULT_NODE_PORT))
//     .map((e) => ({
//       key: e[0],
//       ...e[1],
//       id: e[0]
//     }));

export const parseTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    hours: date.getHours(),
    minutes: date.getMinutes()
  };
};

export function replacer(key: string, value: any) {
  if (value instanceof RegExp) return '__REGEXP ' + value.toString();
  else return value;
}

export function reviver(key: string, value: any) {
    const pattern = /\/(.*)\/(.*)?/;
  if (value.toString().indexOf('__REGEXP ') === 0) {
    const m = value.split('__REGEXP ')[1].match(pattern);
   // eslint-disable-next-line
    return new RegExp(m[1], m[2] || '');
  } else return value;
}

export const getPorts = (ports: { [key: string]: IDmbtPort }) =>
Object.keys(ports).reduce((acc,portId) => {
    const port = ports[portId];
    acc = {
        [`${portId}`]:port.id,
        ...acc
    }

    return acc;
}, {})
//   Object.entries(ports).reduce((acc, entry) => {
//     acc = {
//       [`${entry[0]}`]: entry[1].id,
//       ...acc
//     };
//     return acc;
//   }, {});

export const computeExternalVariables = (variables: {
  [key: string]: any;
}): {
  [key: string]: any;
} => {
  const merged = {
    url: window.location.href,
    language: navigator.language,
    languages:
      navigator.languages === undefined
        ? [navigator.language]
        : navigator.languages,
    browser: navigator.userAgent,
    os:
      (navigator as any)?.userAgentData?.platform ||
      (navigator as any)?.platform ||
      'unknown',
    botStart: new Date().toUTCString(),
    ...variables
  };

  return merged;
};

export const startsWith = (inp: string, search: string, rawPos: number = 0) => {
  const pos = rawPos > 0 ? rawPos|0 : 0;
  return inp.substring(pos, pos + search.length) === search;
}

export const loadInstanceFromClient = (botId: string) => {
  try {
    return localStorage.getItem(`dumbotbot${botId}`);
  } catch (error) {
    console.error('impossible to load bot progress', error);
  }
};

export const saveInstanceToClient = (botId: string, botState: string) => {
  try {
    localStorage.setItem(`dumbotbot${botId}`, botState);
  } catch (error) {
    console.error('impossible to store bot progress', error);
  }
};

export const renderBotFrameHtml = (customThemeCss: string) => `
<!DOCTYPE html>
  <html>
    <head>
      <title>Dumbot Web Part</title>
      <meta name="keywords" content="react,iframe,component,development" />
      
      <style type='text/css' id='hostcss'>
        ${hostCss}
      </style>
      <style type='text/css' id='botcss'>
        ${botCss}
      </style>
      <style type='text/css' id='utilitycss'>
        ${utilityCss}
      </style>
      <style type='text/css'>
        html,
        body,
        .root-dmbt {
          height:100%;
          width:100%;
          overflow: hidden;
          margin:0;
          padding:0;
          background-color: var(--dmbt-border-color);
        }
      </style>
      <style type="text/css" id="customBotCssOverrides">
        ${customThemeCss || ''}
      </style>
    </head>
    <body>
      <div id="root" class='root-dmbt'></div>
    </body>
</html>`
