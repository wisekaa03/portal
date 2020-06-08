/** @format */

//#region Imports NPM
import React, { forwardRef, LegacyRef, Component, RefForwardingComponent } from 'react';
import dynamic from 'next/dynamic';
import { withStyles } from '@material-ui/core/styles';
// import JoditReact from 'jodit-react';
//#endregion
//#region Imports Local
//#endregion

const JoditReact = dynamic(() => import('jodit-react'), { ssr: false });

const styles = {
  '@global': {
    // Fix jodit_tooltip style
    '.jodit_tooltip': {
      position: 'fixed!important',
    },
    '.jodit_toolbar': {
      border: 'none!important',
      borderBottom: '1px solid #929fb7!important',
      backgroundColor: '#F5FDFF!important',
      // color: '#F5FDFF!important',
    },
    '.jodit_toolbar .jodit_icon': {
      color: '#fff',
    },
    '.jodit_statusbar': {
      border: 'none!important',
      borderTop: '1px solid #929fb7!important',
      backgroundColor: '#F5FDFF!important',
    },
    '.jodit_placeholder': {
      color: '#31312F!important',
    },
    '.jodit_container:not(.jodit_inline) .jodit_workplace': {
      border: 'none',
    },
    '.jodit_container': {
      'border': '2px solid #929fb7',
      'borderRadius': '4px',
      '&:hover': {
        borderColor: '#5e7196',
      },
    },
  },
};

// Должен быть снаружи компонента
// all options from https://xdsoft.net/jodit/doc/
const config = {
  beautifyHTML: false,
  useAceEditor: false,
  sourceEditor: 'area',
  placeholder: 'Подробное описание',
  // TODO: ,image,file
  style: {
    font: '16px "Roboto", "Arial", "Helvetica"',
    backgroundColor: '#F5FDFF',
  },
  buttons:
    'eraser,|,align,outdent,indent,|,ul,ol,|,font,fontsize,brush,paragraph,|,table,link,|,' +
    'undo,redo,cut,copy,|,hr,symbol,print,source',
};

interface JoditEditorComponentProps {
  value: string;
  onBlur?: React.Dispatch<React.SetStateAction<string>>;
  onChange?: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
}

const JoditEditorComponent: RefForwardingComponent<Component, JoditEditorComponentProps> = (
  { value, onBlur, disabled },
  ref,
) => (
  // TODO: не поддерживает ref WTF???
  <JoditReact
    // ref={ref as LegacyRef<JoditReact>}
    value={value}
    config={{ ...config, readonly: !!disabled }}
    // preferred to use only this option to update the content for performance reasons
    onBlur={onBlur}
    onChange={() => {}}
  />
);

export default withStyles(styles)(forwardRef(JoditEditorComponent));
