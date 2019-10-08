/** @format */
// #region Imports NPM
import { ShallowWrapper } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
import { TextField, Button } from '@material-ui/core';
import React from 'react';
// #endregion
// #region Imports Local
import Login from '../pages/auth/login';
// #endregion

describe('Login page', () => {
  let component: ShallowWrapper;

  beforeAll(() => {
    component = createShallow()(<Login />);
  });

  it('match snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('have login button', () => {
    expect(component.find(Button)).toBeDefined();
  });

  it('have textField', () => {
    expect(component.find(TextField)).toBeDefined();
  });
});
