/** @format */

import React, { PropsWithChildren } from 'react';

interface ConditionalWrapperProps {
  condition?: boolean;
  wrapper: (children: any) => JSX.Element;
  children: any;
}

const ConditionalWrapper = ({
  condition = true,
  wrapper,
  children,
}: PropsWithChildren<ConditionalWrapperProps>): JSX.Element => {
  return condition ? wrapper(children) : children;
};

export default ConditionalWrapper;
