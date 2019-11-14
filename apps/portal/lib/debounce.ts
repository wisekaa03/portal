/** @format */

import React, { useState, useEffect } from 'react';

export default (_value: any, _delay: number): any => {
  const [value, setValue] = useState<any>(_value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setValue(_value);
    }, _delay);

    return () => {
      clearTimeout(handler);
    };
  }, [_delay, _value]);

  return value;
};
