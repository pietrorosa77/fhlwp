
import { HtmlRenderer, getPortsArray } from '../../core';
import {
    DEFAULT_NODE_PORT,
  IDmbtChoiceProps,
  IDmbtInteractionProps,
  IDmbtMultichoiceProps,
  IDmbtPort
} from '../../../definitions';
import { Button, ToggleButton } from '@fluentui/react-components';
import * as React from 'react';
import * as Icons from "@fluentui/react-icons";

export const getButtonFromPort = (
  port: IDmbtPort,
  onPress: (port: string, value: any) => void
) => {
  const properties =
    (port.properties as IDmbtChoiceProps) || ({} as IDmbtChoiceProps);
    const Icon =properties.iconId ? (Icons as any)[ properties.iconId] : undefined;

  return (
    <Button
      onClick={() => onPress(port.id, port.value || port.text)}
      key={port.id}
      {...properties}
      icon={Icon ? <Icon/> : undefined}
    >{HtmlRenderer(port.text)}</Button>
  );
};

export const getToggleButtonFromPort = (
    port: IDmbtPort,
    isSelected: boolean,
    onPress: (port: string, value: any) => void
  ) => {
    const properties =
      (port.properties as IDmbtMultichoiceProps) || ({} as IDmbtMultichoiceProps);

    return (
      <ToggleButton
        onClick={() => onPress(port.id, isSelected ? true : false)}
        key={port.id}
        {...properties}
        checked={isSelected}
        appearance={isSelected ? 'primary' : 'secondary'}
        icon={isSelected ? <Icons.CheckmarkCircleFilled/> : <Icons.CheckmarkCircleRegular />}
      >{HtmlRenderer(port.text)}</ToggleButton>
    );
  };

export const SingleChoice = (props: IDmbtInteractionProps) => {
  const dispatch = props.dispatcher;
  const outType = props.node.output.type;
  const ports = getPortsArray(props.node.ports);

  const onPress = (port: string, value: any) => {
    dispatch({
      type: '@answer',
      payload: {
        value,
        port,
        type: outType,
        id: props.node.output.id
      }
    });
  };

  return (
    <div className="flex flex-wrap justify-content-center gap-3">
      {ports.map((p) => {
        return getButtonFromPort(p, onPress);
      })}
    </div>
  );
};

export const MultipleChoice = (props: IDmbtInteractionProps) => {
    const dispatch = props.dispatcher;
    const [valid, setValid] = React.useState(true);
    const controlProperties = props.node.properties as IDmbtMultichoiceProps;
    const [selected, setSelected] = React.useState<string[]>([]);
    const ports = getPortsArray(props.node.ports);
    const minallowed = controlProperties.min || 1;
    const maxAllowed = controlProperties.max || ports.length;
  
    const onPress = (port: string, isSelected: boolean) => {
      const newSelected = isSelected
        ? selected.filter((el) => el !== port)
        : selected.concat([port]);
      setSelected(newSelected);
      const isValid =
        newSelected.length >= minallowed && newSelected.length <= maxAllowed;
      setValid(isValid);
      props.onValidation?.(
        isValid,
        controlProperties.validationErrorMessage || ''
      );
    };
  
    const onSubmit = () => {
      if (!valid || !selected.length) {
        return;
      }
      const value = selected.map((id) => {
        const port = props.node.ports[id];
        return port.value || port.text;
      });
      dispatch({
        type: '@answer',
        payload: {
          value,
          port: selected.length===1 ? selected[0] : DEFAULT_NODE_PORT,
          type: 'array',
          id: props.node.output.id
        }
      });
    };
  
    const btnClass = `dmbt-button-multichoice border-circle shadow-5 border-3 border-double opacity-90 border-solid hover:opacity-100 hover:shadow-8 transition-duration-1000 surface-border${
      !valid ? ' dmbt-button-danger' : ''
    }`;

    return (
      <>
        <div
          className={`flex flex-wrap justify-content-center gap-3`}
         
        >
          {ports.map((p) => {
            const isSelected = selected.indexOf(p.id) >= 0 ? true : false;
            return getToggleButtonFromPort(p, isSelected, onPress);
          })}
        </div>
        <div className="mt-3 flex justify-content-center flex-wrap card-container" >
          <Button className={btnClass} appearance={valid? 'primary': 'transparent'} onClick={onSubmit} icon={<Icons.SendFilled  />} shape='circular' size='large'/>
        </div>
      </>
    );
  };

  export const ButtonsInteraction =(props: IDmbtInteractionProps) => {
    if((props.node.properties as any).allowMultiple) {
        return <MultipleChoice {...props} />
    }

    return <SingleChoice {...props} />
  }
