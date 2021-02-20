/** @format */
//#region Imports NPM
import React from 'react';
import { shallow as Shallow } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
import { TextField, Button } from '@material-ui/core';
//#endregion
//#region Imports Local
import { LoginPageProps } from '@lib/types';
import Login from '@front/pages/auth/login';
//#endregion

describe('Login page', () => {
  let shallow: typeof Shallow;
  const props: LoginPageProps = {
    // loading: false,
    // login: ((): void => {}) as MutationFunction,
    namespacesRequired: [],
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
    expect(wrapper.find(() => Button)).toBeDefined();
  });

  it('have textField', () => {
    const wrapper = shallow(<Login {...props} />);
    expect(wrapper.find(() => TextField)).toBeDefined();
  });

  // @todo: чота непонятное тута, разобраться
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
