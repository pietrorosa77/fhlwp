import { useEffect, useState } from 'react';
import {
  IDmbtInteractionProps,
  IDmbtJSSnippetProps,
  IDumbotSnippetContext
} from '../../../definitions';
import * as React from 'react';
import { useClientCompiled } from '../../core/codeTranspiler';
declare var _dumbot_user_snippet: Function;
const callSnippetFunction = async (snippetContext: IDumbotSnippetContext) => {
  try {
    const res = await _dumbot_user_snippet(snippetContext);
    if (!res || !snippetContext.ports[res]) {
      console.log('script exit specified');
      return {
        exit: 'default',
        error:
          res && !snippetContext.ports[res]
            ? `specified exit ${res} doesn't exist. Allowed are ${Object.keys(
                snippetContext.ports
              )}`
            : undefined
      };
    }
    return { exit: res, error: undefined };
  } catch (error) {
    console.error(error);
    return { exit: 'default', error: error as any };
  }
};

export const JSSnippet = (props: IDmbtInteractionProps) => {
  const nodeProps = props.node.properties as unknown as IDmbtJSSnippetProps;
  const [loading, setLoading] = useState(true);
  const { ready, failed } = useClientCompiled({
    nonce: '8IBTHwOdqNKAWeKl7plt8g==',
    code: `async function _dumbot_user_snippet(SnippetContext){
            ${nodeProps.code}
        }`
  });

  const [result, setResult] = useState<any>(null);
  const ports = Object.keys(props.node.ports).reduce((acc, portKey) => {
    const port = props.node.ports[portKey]
    acc = {
      [`${portKey}`]: port.id,
      ...acc
    };
    return acc;
  }, {});

  useEffect(() => {
    props.onLoading(loading);
  }, [loading]);

  useEffect(() => {
    if (failed) {
      setResult({
        exit: 'default',
        error: `ERR: snippet ${props.node.id} error loading snippet`
      });
    }
  }, [failed]);

  useEffect(() => {
    if (ready) {
      const callCodeSnippet = async () => {
        await execSnippet();
      };
      callCodeSnippet();
    }
  }, [ready]);

  const execSnippet = async () => {
    const snippetcontext: IDumbotSnippetContext = {
      onCallHost: props.onCallHost as any,
      nodeId: props.node.id,
      ports,
      onSetVariable: (id: string, value: any) =>
        props.dispatcher({ type: '@variable', payload: { id, value } }),
      variables: props.state.variables
    };

    let snippetOutput = {
      exit: 'default',
      error: undefined
    };

    snippetOutput = await callSnippetFunction(snippetcontext);
    setResult(snippetOutput);
  };

  useEffect(() => {
    if (!result) {
      return;
    }

    setLoading(false);
    if (result.error) {
      console.error(result.error);
      props.dispatcher({
        type: '@answer',
        payload: {
          value: `ERR: snippet ${props.node.id} error ${result.error}`,
          port: result.exit,
          type: 'string',
          id: props.node.output.id,
          meta: {
            silent: true
          }
        }
      });
    } else {
      props.dispatcher({
        type: '@answer',
        payload: {
          value: `OK: snippet ${props.node.id} exit result ${result.exit}`,
          port: result.exit,
          type: 'string',
          id: props.node.output.id,
          meta: {
            silent: true
          }
        }
      });
    }
  }, [result]);

  return <></>;
};
