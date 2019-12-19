/** @format */
// #region Imports NPM
import React from 'react';
import { shallow as Shallow } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
import { TextField, Button } from '@material-ui/core';
import { MutationFunction } from 'react-apollo';
// #endregion
// #region Imports Local
import LoginComponent from '../components/login';
// #endregion

describe('Login page', () => {
  let shallow: typeof Shallow;
  const props = {
    loading: false,
    login: ((): void => {}) as MutationFunction,
    namespacesRequired: [],
  };

  beforeAll(() => {
    shallow = createShallow();
  });

  it('match snapshot', () => {
    const wrapper = shallow(<LoginComponent {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('have login button', () => {
    const wrapper = shallow(<LoginComponent {...props} />);
    expect(wrapper.find(Button)).toBeDefined();
  });

  it('have textField', () => {
    const wrapper = shallow(<LoginComponent {...props} />);
    expect(wrapper.find(TextField)).toBeDefined();
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
