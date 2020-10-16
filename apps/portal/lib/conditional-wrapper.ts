/** @format */

import React from 'react';

interface ConditionalWrapperProps {
  condition?: boolean;
  wrapper: (children: any) => React.ReactElement;
  children: any;
}

const ConditionalWrapper: React.FC<ConditionalWrapperProps> = ({ condition = true, wrapper, children }) =>
  condition ? wrapper(children) : children;

export default ConditionalWrapper;
