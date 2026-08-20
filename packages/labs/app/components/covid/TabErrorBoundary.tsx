import { Component } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class TabErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="ui-flat-card text-center">
          <p className="text-muted-foreground text-sm">
            Failed to load data. Please try refreshing the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
