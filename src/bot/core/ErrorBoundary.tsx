import { Component } from 'react';
import { DismissRegular } from "@fluentui/react-icons";
import {
    MessageBar,
    MessageBarTitle,
    MessageBarBody,
    Link,
    makeStyles,
    shorthands,
    MessageBarActions,
    Button,
  } from "@fluentui/react-components";
import * as React from 'react';

const useClasses = makeStyles({
    container: {
      display: "flex",
      flexDirection: "column",
      ...shorthands.gap("10px"),
    },
  });

export class ErrorBoundary extends Component<
  {
    children: any;
    message?: any;
    onDismiss: () => void;
  },
  any
> {
  state = { hasError: false, error: null };
  
  public componentDidCatch(error: any, errorInfo: any) {
    console.log(
      `${new Date().getMilliseconds()} - * ComponentA Did Catch`,
      errorInfo
    );
    this.setState({ hasError: true, error });
  }

  dismissMessage() {
    this.setState({ hasError: false, error: null });
    this.props.onDismiss();
  }


  render() {
    if (this.state.hasError) {
      const classes = useClasses();
      return (
        <div className={classes.container}>
        <MessageBar intent="error">
            <MessageBarBody>
              <MessageBarTitle>Error rendering the bot</MessageBarTitle>
              Message providing information to the user with actionable insights.{" "}
              <Link>Link</Link>
            </MessageBarBody>
            <MessageBarActions
              containerAction={
                <Button
                  onClick={() => this.dismissMessage()}
                  aria-label="dismiss"
                  appearance="transparent"
                  icon={<DismissRegular />}
                />
              }
            />
          </MessageBar>
      </div>
      );
    }
    return this.props.children;
  }
}
