/** @format */

import React, { PropsWithChildren } from 'react';

interface ConditionalWrapperProps {
  condition?: boolean;
  wrapper: (children: any) => React.ReactElement;
  children: any;
}

const ConditionalWrapper = ({ condition = true, wrapper, children }: PropsWithChildren<ConditionalWrapperProps>): React.ReactElement =>
  condition ? wrapper(children) : children;

export default ConditionalWrapper;
