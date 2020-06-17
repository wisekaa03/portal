/** @format */

//#region Imports NPM
import React, { useState, useRef, useEffect } from 'react';
import { FormControl, InputLabel, MenuItem, Select as MuiSelect } from '@material-ui/core';
//#endregion
//#region Imports Local

interface SelectProps {
  label: string;
  items: string[];
  icons?: string[];
  value: string;
  onChange: (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>,
  ) => Promise<void> | void;
  color?: 'primary' | 'secondary';
}

const Select = ({ label, items, value, onChange, color }: SelectProps): React.ReactElement => {
  const inputLabel = useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = useState(0);

  useEffect(() => {
    if (inputLabel.current) {
      setLabelWidth(inputLabel.current.offsetWidth);
    }
  }, [inputLabel]);

  return (
    <FormControl variant="outlined">
      <InputLabel ref={inputLabel}>{label}</InputLabel>
      <MuiSelect color={color || 'secondary'} value={value} onChange={onChange} labelWidth={labelWidth}>
        {items.map((current) => (
          <MenuItem key={current} value={current}>
            {current}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};

export default Select;
