import {
    ChangeEvent,
    useCallback,
    useEffect,
    useState,
    KeyboardEvent
} from 'react';
import {
    DEFAULT_NODE_PORT,
    IDmbtInteractionProps,
    IDmbtNode,
    IDmbtQuestionProps
} from '../../../definitions';


const defaultProps: IDmbtQuestionProps = {
    sendClassName: 'dmbt-answer-btn',
    className: 'dmbt-answer',
    validationErrorMessage: ''
};


export function computeControlProps<T>(node: IDmbtNode) {
    return {
        ...defaultProps,
        ...(node.properties || {})
    } as IDmbtQuestionProps & T;
}

export function useQuestion<T>(
    props: IDmbtInteractionProps
): [
        (
            e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => void,
        (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
        () => void,
        boolean,
        string,
        IDmbtQuestionProps & T
    ] {
    const dispatch = props.dispatcher;
    const [text, setText] = useState<string>('');
    const [valid, setValid] = useState<boolean>(true);
    
    const inpProps: IDmbtQuestionProps & T = computeControlProps(props.node);
    const outType = props.node.output.type;

    const onAnswer = (value: any) => {
        dispatch({
            type: '@answer',
            payload: {
                value,
                port: DEFAULT_NODE_PORT,
                type: outType,
                id: props.node.output.id
            }
        });
    };

    const onSend = () => {
        if (!valid || !text) {
            return false;
        }

        onAnswer(text);
    };

    const onChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setText(e.target.value || '');
    };

    const onKeyDown = (
        e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            onSend();
        }
    };

    const validate = useCallback(
        (val: string) => {
            if (!val) {
                return true;
            }
            if (!inpProps.pattern) {
                return true;
            }
            
            // eslint-disable-next-line
            const regexp = new RegExp(inpProps.pattern);

            return regexp.test(val);
        },
        [inpProps.pattern]
    );

    useEffect(() => {
        const isValid = validate(text);
        setValid(isValid);
        props.onValidation(isValid, inpProps.validationErrorMessage || '');
    }, [text, validate, setValid]);

    return [onChange, onKeyDown, onSend, valid, text, inpProps];
}
