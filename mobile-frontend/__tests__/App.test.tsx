import React from "react";
import renderer, { act } from "react-test-renderer";
import App from "../src/App";

describe("App", () => {
  it("renders the application without crashing", async () => {
    let tree: renderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = renderer.create(<App />);
    });
    expect(tree).toBeDefined();
    expect(tree!.toJSON()).toBeTruthy();
    await act(async () => {
      tree!.unmount();
    });
  });
});
