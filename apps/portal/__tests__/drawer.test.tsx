/** @format */

// #region Imports NPM
import React from 'react';
import { shallow as Shallow } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
// #endregion
// #region Imports Local
import Drawer from '../components/drawer';
import { ProfileContext } from '../lib/context';
import { MOCK_PROFILE } from '../lib/constants';
// #endregion

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
    };
  },
}));

describe('Drawer component', () => {
  let shallow: typeof Shallow;
  const props = {
    open: false,
    isMobile: false,
    handleOpen: (): void => {},
    namespacesRequired: [],
  };
  const linkCount = 9;
  const linkAdminCount = 10;

  describe('Without context', () => {
    beforeAll(() => {
      shallow = createShallow({ dive: true });
    });

    it('match snapshot', () => {
      const wrapper = shallow(<Drawer {...props} />);
      expect(wrapper).toMatchSnapshot();
    });

    it('open correctly', () => {
      const wrapper = shallow(<Drawer {...props} />);
      expect(wrapper.find('WithStyles(ForwardRef(Drawer))').props().open).toEqual(props.open);
    });

    it('count links correctly', () => {
      const wrapper = shallow(<Drawer {...props} />);
      expect(wrapper.find('li')).toHaveLength(linkCount);
    });
  });

  // TODO: почему то контекст не пробрасывается
  // describe('With context', () => {
  //   beforeAll(() => {
  //     component = createShallow({ dive: true })(
  //       <ProfileContext.Provider value={MOCK_PROFILE}>
  //         <Drawer {...props} />
  //       </ProfileContext.Provider>,
  //     );
  //   });

  //   it('count links correctly', () => {
  //     expect(
  //       component
  //         .find('BaseDrawer')
  //         .dive()
  //         .find('li'),
  //     ).toHaveLength(linkAdminCount);
  //   });
  // });
});
