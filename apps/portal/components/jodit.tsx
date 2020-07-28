/** @format */

//#region Imports NPM
import React, { forwardRef, LegacyRef, Component, RefForwardingComponent } from 'react';
import dynamic from 'next/dynamic';
import { withStyles } from '@material-ui/core/styles';
import { ButtonsOption, IDictionary } from 'jodit';
import { Config } from 'jodit/src/config';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
//#endregion

const styles = {
  '@global': {
    // Fix jodit_tooltip style
    '.jodit-tooltip': {
      position: 'fixed!important',
    },
    '.jodit-toolbar': {
      border: 'none!important',
      borderBottom: '1px solid #929fb7!important',
      backgroundColor: '#F5FDFF!important',
    },
    '.jodit-icon': {
      fill: '#6AA7C8!important',
    },
    '.jodit-with-dropdownlist-trigger': {
      color: '#6AA7C8!important',
      fill: '#6AA7C8!important',
    },

    '.jodit-toolbar-btn>a': { color: '#6AA7C8!important' },
    '.jodit-toolbar .jodit_icon': {
      color: '#fff',
    },
    '.jodit-statusbar': {
      border: 'none!important',
      borderTop: '1px solid #929fb7!important',
      backgroundColor: '#F5FDFF!important',
    },
    '.jodit-placeholder': {
      color: '#31312F!important',
    },
    '.jodit-container:not(.jodit_inline) .jodit_workplace': {
      border: 'none!important',
    },
    '.jodit-container': {
      'border': '2px solid #929fb7!important',
      'borderRadius': '4px!important',
      '&:hover': {
        borderColor: '#5e7196!important',
      },
    },
  },
};

// all options from https://xdsoft.net/jodit/doc/
const config = {
  // beautifyHTML: false,
  // useAceEditor: false,
  // sourceEditor: 'area',
  // placeholder: 'Подробное описание',
  // TODO: ,image,file
  style: {
    font: '16px "Roboto", "Arial", "Helvetica"',
    backgroundColor: '#F5FDFF',
  } as IDictionary<string>,
  buttons: [
    'eraser',
    '|',
    'align',
    'outdent',
    'indent',
    '|',
    'ul',
    'ol',
    '|',
    'font',
    'fontsize',
    'brush',
    'paragraph',
    '|',
    'table',
    'link',
    '|',
    'undo',
    'redo',
    'cut',
    'copy',
    '|',
    'hr',
    'symbol',
    'print',
    'source',
  ] as ButtonsOption,
};

interface JoditEditorComponentProps {
  value: string;
  onBlur?: React.Dispatch<React.SetStateAction<string>>;
  onChange?: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
}

const JoditReact = __SERVER__ ? ({} as React.ComponentClass) : dynamic(() => import('jodit-react'), { ssr: false });

const JoditEditorComponent: RefForwardingComponent<Component, JoditEditorComponentProps> = (
  { value, onBlur, disabled },
  ref,
) => {
  const {
    i18n: { language },
  } = useTranslation();

  if (__SERVER__) {
    return <></>;
  } else {
    return (
      <JoditReact
        // ref={ref as LegacyRef<JoditReact>}
        value={value}
        config={
          {
            ...config,
            readonly: !!disabled,
            language,
            // i18n: {
            //   ru: {},
            // },
          } as Config
        }
        // preferred to use only this option to update the content for performance reasons
        onBlur={onBlur}
        onChange={() => {}}
      />
    );
  }
};

export default withStyles(styles)(forwardRef(JoditEditorComponent));
