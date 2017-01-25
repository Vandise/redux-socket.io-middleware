import React from 'react';
import { mount } from 'enzyme';

const setup = () => {
  const component = mount(
    <div>
      <p>Hello World!</p>
    </div>
  );
  return {
    component,
  };
};

describe('My Component', () => {
  it('Renders some content', () => {
    const output = setup();
    expect(output.component.length).to.equal(1);
  });
});