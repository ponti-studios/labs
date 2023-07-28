import { Provider } from "react-redux";
import { MemoryRouter as Router } from "react-router-dom";
import renderer from "react-test-renderer";
import { test, expect, describe } from "vitest";

import { store } from "src/services/store";

import Header from ".";

describe("<Header/>", () => {
  test("should render component", () => {
    const div = renderer.create(
      <Router>
        <Provider store={store}>
          <Header />
        </Provider>
      </Router>,
    );
    expect(div.toJSON()).toMatchSnapshot();
  });
});
