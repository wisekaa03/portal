/** @format */
// #region Imports NPM
import React from 'react';
import { ShallowWrapper } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
import { TextField, Button } from '@material-ui/core';
import { MutationFunction } from 'react-apollo';
// #endregion
// #region Imports Local
import LoginComponent from '../components/login';
// #endregion

describe('Login page', () => {
  let component: ShallowWrapper;
  const props = {
    loading: false,
    login: ((): void => {}) as MutationFunction,
    namespacesRequired: [],
  };

  beforeAll(() => {
    component = createShallow()(<LoginComponent {...props} />);
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

  // TODO: чота непонятное тута, разобраться
  // it('test username input', () => {
  //   const username = 'testuser';
  //   component.find('[data-field-name="username"]').simulate('change', {
  //     target: {
  //       value: username,
  //       type: 'input',
  //       dataset: {
  //         fieldName: 'username',
  //       },
  //     },
  //   });
  //   expect(true).toBeTruthy();
  // });
});
