
import { ErrorBoundary, prepareInteractionNode } from '../core';
import {
  DmbtDispatch,
  IDmbtInteractionProps,
  IDmbtNode,
  IDmbtState,
  NodeTypes
} from '../../definitions';
import { Question } from './interactions/Question';
import { LoadingStep } from './LoadingStep';
// import { ExternalComponent } from './ExternalComponent';
// import { TagsQuestion } from './TagsQuestion';
import * as React from 'react';
import { ButtonsInteraction } from './interactions/Buttons';
import { MessageBar, MessageBarBody } from '@fluentui/react-components';
import { JSSnippet } from './interactions/JavascriptSnippet';

interface InteractionWrapperProperties {
  state: IDmbtState;
  dispatcher: DmbtDispatch;
  node: IDmbtNode;
  customInteractions?: Map<
    string,
    (props: IDmbtInteractionProps) => JSX.Element
  >;
  onCallHost?: (
    hostFunctionName: string,
    parameters: { [key: string]: any }
  ) => Promise<any>;
  customCssTheme?: string;
}

// const InteractionsMap = new Map<
//   string,
//   (props: IDmbtInteractionProps) => JSX.Element
// >([
//   [NodeTypes.TAGS, TagsQuestion],
//   [NodeTypes.NUMERIC, NumericQuestion],
//   [NodeTypes.EXTERNAL, ExternalComponent],
//   [NodeTypes.COLOR, ColorQuestion],
//   [NodeTypes.DATE, DateTimeQuestion],
//   [NodeTypes.TIME, DateTimeQuestion],
//   [NodeTypes.LONGTEXT, LongTextQuestion],
//   [NodeTypes.QUESTION, Question],
//   [NodeTypes.MASK, MaskQuestion],
//   [NodeTypes.BUTTONS, SingleChoice],
//   [NodeTypes.MULTIBUTTONS, MultipleChoice],
//   [NodeTypes.CODE, JSSnippet]
// ]);
const mockInteraction = () => <div>MockInteraction</div>
const InteractionsMap = new Map<
  string,
  (props: IDmbtInteractionProps) => JSX.Element
>([
  [NodeTypes.TAGS, mockInteraction],
  [NodeTypes.NUMERIC, mockInteraction],
  [NodeTypes.EXTERNAL, mockInteraction],
  [NodeTypes.COLOR, mockInteraction],
  [NodeTypes.DATE, mockInteraction],
  [NodeTypes.TIME, mockInteraction],
  [NodeTypes.LONGTEXT, mockInteraction],
  [NodeTypes.QUESTION, Question],
  [NodeTypes.MASK, mockInteraction],
  [NodeTypes.BUTTONS, ButtonsInteraction],
  [NodeTypes.MULTIBUTTONS, mockInteraction],
  [NodeTypes.CODE, JSSnippet]
]);

export const InnerInteraction = (props: InteractionWrapperProperties) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [validationMessage, setValidationMessage] = React.useState<string>('');
  const className = `dumbot-interaction dumbot-interaction-${
    props.node.properties?.displayAs || 'message'
  } flex flex-column fadein animation-duration-500${
    loading ? ' dumbot-interaction-loading' : ''
  } ${props.node.properties?.className}`;
  const containerRef = React.useRef<HTMLDivElement | null>();
  const customInteractions = props.customInteractions || new Map();
  const nodeSub = prepareInteractionNode(props.node, props.state.variables);
  const InteractionControl =
    customInteractions.get(props.node.type) ||
    InteractionsMap.get(props.node.type);

  React.useEffect(() => {
    if (containerRef.current) {
      const element = containerRef.current;
      window.requestAnimationFrame(() => element.focus());
    }
  }, []);

  const onValidation = (valid: boolean, message: string) => {
    setValidationMessage(valid ? '' : message || 'Please provide a valid answer');
  };

  if (!InteractionControl) {
    throw new Error(`Missing interaction for node type ${props.node.type}`);
  }

  return (
    <div
      className={className}
      tabIndex={0}
      id={props.node.properties?.id}
      ref={(el) => (containerRef.current = el)}
    >
      {loading && <LoadingStep justify="center" />}
      {!loading && props.node.properties?.label && (
        <div className="interaction-label">{props.node.properties?.label}</div>
      )}
      <InteractionControl
        {...props}
        node={nodeSub}
        onLoading={(loading: boolean) => setLoading(loading)}
        onValidation={onValidation}
      />
      {validationMessage && (
         <MessageBar intent='warning' className='mt-2'>
          <MessageBarBody>
            {validationMessage}
          </MessageBarBody>
       </MessageBar>
      )}
    </div>
  );
};

const Interaction = (
  props: InteractionWrapperProperties & { onErrorAction: () => void }
) => (
  <ErrorBoundary onDismiss={props.onErrorAction}>
    <InnerInteraction
      customInteractions={props.customInteractions}
      node={props.node}
      dispatcher={props.dispatcher}
      onCallHost={props.onCallHost}
      state={props.state}
      customCssTheme={props.customCssTheme}
    />
  </ErrorBoundary>
);

export const getInteraction = (
  state: IDmbtState,
  dispatch: DmbtDispatch,
  onErrorAction: () => void,
  node?: IDmbtNode,
  customInteractions?: Map<
    string,
    (props: IDmbtInteractionProps) => JSX.Element
  >,
  onCallHost?: (
    hostFunctionName: string,
    parameters: { [key: string]: any }
  ) => Promise<any>,
  customCssTheme?: string
) => {
  if (!node) {
    return null;
  }

  return (
    <Interaction
      key={node.id}
      node={node}
      dispatcher={dispatch}
      state={state}
      onErrorAction={onErrorAction}
      customInteractions={customInteractions}
      onCallHost={onCallHost}
      customCssTheme={customCssTheme}
    />
  );
};
