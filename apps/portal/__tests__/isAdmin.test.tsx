/** @format */

import { ShallowWrapper } from 'enzyme';
import { Button } from '@material-ui/core';
import { createShallow } from '@material-ui/core/test-utils';
import React from 'react';

import { UserContext } from '@app/portal/user/models/user.dto';
import { LoginService, Gender } from '@app/portal/shared/interfaces';
import { ProfileContext } from '../lib/context';
import IsAdminComponent from '../components/isAdmin';

describe('IsAdmin Component', () => {
  let component: ShallowWrapper;
  const props = {};
  const profile: UserContext = {
    user: {
      isAdmin: true,
      username: '',
      disabled: false,
      settings: {},
      profile: {
        loginService: LoginService.LDAP,
        loginIdentificator: '',
        username: '',
        dn: '',
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        birthday: new Date(),
        gender: Gender.UNKNOWN,
        country: '',
        postalCode: '',
        region: '',
        town: '',
        street: '',
        room: '',
        company: '',
        title: '',
        telephone: '',
        workPhone: '',
        mobile: '',
        fax: '',
        companyEng: '',
        nameEng: '',
        departmentEng: '',
        otdelEng: '',
        positionEng: '',
        disabled: false,
        notShowing: false,
      },
    },
  };

  beforeAll(() => {
    const child = <p>test</p>;

    component = createShallow()(
      <ProfileContext.Provider value={profile}>
        <IsAdminComponent {...props}>{child}</IsAdminComponent>
      </ProfileContext.Provider>,
    );
  });

  it('render correctly', () => {
    expect(component).toMatchSnapshot();
  });

  it('context correctly', () => {
    expect(component.find('p')).toHaveLength(1);
  });
});
