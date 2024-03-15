import * as React from "react";

const botBottomAnchorStyle = {
  height: '100px',
  backgroundColor: 'transparent'
};

export const AutoscrollPanel = (props: { children: any }) => {
  const scrollAnchor = React.useRef<HTMLDivElement>();
  const resizeableRef = React.useRef<HTMLDivElement>();
  const scrollElement = React.useRef<HTMLDivElement | null>();
  const autoscroll = () => {
    requestAnimationFrame(() => {
      if (scrollElement.current) {
        scrollElement.current.scrollTo({
          top: scrollElement.current.scrollHeight,
          behavior: 'smooth'
        });
      }

      // lets also delay the scroll to view of the bottom anchor: give timeto images and video to take
      // additional space
      setTimeout(() => {
        if (scrollAnchor.current) {
          scrollAnchor.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    });
  };
  const resizeObserver = React.useRef<ResizeObserver>(
    new ResizeObserver(() => autoscroll())
  );

  React.useEffect(() => {
    const observed = resizeableRef.current;
    const observer = resizeObserver.current;
    if (observed) {
      observer.observe(observed);
    }
    return () => {
      if (observed) {
        observer.unobserve(observed);
      }
    };
  }, []);

  return (
    <div
      className="autoscrollPanel"
      ref={(ref) => (scrollElement.current = ref)}
    >
      <div ref={resizeableRef as any}>
        {props.children}
        <div
          ref={scrollAnchor as any}
          style={botBottomAnchorStyle}
          id="dumbotBottomAnchor"
        />
      </div>
    </div>
  );
};
