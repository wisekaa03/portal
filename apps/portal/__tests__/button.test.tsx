/** @format */

import { ShallowWrapper } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
import React from 'react';
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutlined';

import ButtonComponent, { ButtonBaseProps } from '../components/button';

describe('Button Component', () => {
  let component: ShallowWrapper;
  const props: ButtonBaseProps = {
    actionType: 'accept',
  };

  const text = 'test button';

  beforeAll(() => {
    component = createShallow({ dive: true })(<ButtonComponent {...props}>{text}</ButtonComponent>);
  });

  it('render correctly', () => {
    expect(component).toMatchSnapshot();
  });

  it('children correctly', () => {
    expect(component.children().text()).toEqual(text);
  });
});
