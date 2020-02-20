/** @format */
// #region Imports NPM
import React from 'react';
import { shallow as Shallow } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
import { TextField, Button } from '@material-ui/core';
import { MutationFunction } from 'react-apollo';
// #endregion
// #region Imports Local
import Login from '../pages/auth/login';
import { LoginPageProps } from '../components/login/types';
// #endregion

describe('Login page', () => {
  let shallow: typeof Shallow;
  const props: LoginPageProps = {
    // loading: false,
    // login: ((): void => {}) as MutationFunction,
    // namespacesRequired: [],
    initUsername: '',
  };

  beforeAll(() => {
    shallow = createShallow();
  });

  it('match snapshot', () => {
    const wrapper = shallow(<Login {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('have login button', () => {
    const wrapper = shallow(<Login {...props} />);
    expect(wrapper.find(Button)).toBeDefined();
  });

  it('have textField', () => {
    const wrapper = shallow(<Login {...props} />);
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
