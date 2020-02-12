/** @format */

import { shallow as Shallow } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
import React from 'react';

import ButtonComponent, { ButtonBaseProps } from '../components/ui/button';

describe('Button Component', () => {
  let shallow: typeof Shallow;
  const props: ButtonBaseProps = {
    actionType: 'accept',
  };

  const text = 'test button';

  const Component = <ButtonComponent {...props}>{text}</ButtonComponent>;

  beforeAll(() => {
    shallow = createShallow({ dive: true });
  });

  it('render correctly', () => {
    const wrapper = shallow(Component);
    expect(wrapper).toMatchSnapshot();
  });

  it('children correctly', () => {
    const wrapper = shallow(Component);
    expect(wrapper.children().text()).toEqual(text);
  });
});
