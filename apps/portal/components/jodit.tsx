/** @format */
import React from 'react';
import dynamic from 'next/dynamic';
import { withStyles } from '@material-ui/core/styles';

const JoditReact = dynamic(() => import('jodit-react'), { ssr: false });

const styles = {
  '@global': {
    // Fix jodit_tooltip style
    '.jodit_tooltip': {
      position: 'fixed !important',
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
  buttons:
    'eraser,|,|,ul,ol,|,outdent,indent,|,font,fontsize,brush,paragraph,|,table,link,|,' +
    'align,undo,redo,selectall,cut,copy,|,hr,symbol,print,source',
};

const JoditEditor = ({ value, onChange }): React.ReactElement => {
  return (
    <JoditReact
      value={value}
      config={config}
      // preferred to use only this option to update the content for performance reasons
      onBlur={onChange}
      onChange={() => {}}
    />
  );
};

export default withStyles(styles)(JoditEditor);
