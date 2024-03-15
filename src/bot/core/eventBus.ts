import {
    DmbtEventBusUnsubscibeHandle,
    DmbtEvents,
    IDmbtEventBus
  } from '../../definitions';
  
  let _bus: Comment;
  
  const subscribe = (
    event: DmbtEvents,
    callback: (data?: any) => void,
    options?: AddEventListenerOptions
  ): DmbtEventBusUnsubscibeHandle => {
    const cb = (event: CustomEvent) => {
      const eventData = event.detail;
      callback(eventData);
    };
    _bus.addEventListener(
      event,
      cb as EventListenerOrEventListenerObject,
      options
    );
    return cb;
  };
  
  const unSubscribe = (
    event: DmbtEvents,
    unsubscribeHandle: DmbtEventBusUnsubscibeHandle,
    options?: AddEventListenerOptions
  ) => {
    _bus.removeEventListener(
      event,
      unsubscribeHandle as EventListenerOrEventListenerObject,
      options
    );
  };
  
  const emit = (type: DmbtEvents, data: any) => {
    const event = new CustomEvent(type, {
      detail: data
    });
    _bus.dispatchEvent(event);
  };
  
  export const useEventBus = (): IDmbtEventBus => {
    if (!_bus) {
      _bus = document.appendChild(new Comment('mdmbtBot-event-bus'));
    }
  
    return {
      subscribe,
      unSubscribe,
      emit
    };
  };
  