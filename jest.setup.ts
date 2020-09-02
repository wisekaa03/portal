/** @format */
/* eslint spaced-comment:0, no-underscore-dangle:0 */
/// <reference types="./typings/global" />

import * as enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

enzyme.configure({ adapter: new Adapter() });

global.__SERVER__ = true;
global.__DEV__ = true;
global.__PRODUCTION__ = false;
global.__TEST__ = true;
