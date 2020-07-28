/** @format */

//#region Imports NPM
import React, {
  useRef,
  forwardRef,
  Component,
  RefForwardingComponent,
  useMemo,
  useEffect,
  useLayoutEffect,
} from 'react';
// import dynamic from 'next/dynamic';
import { withStyles } from '@material-ui/core/styles';
import { Jodit, ButtonsOption, IDictionary } from 'jodit';
import { Jodit as JoditClass } from 'jodit/src/jodit';
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
const configDefault = {
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
  id?: string;
  name?: string;
  onBlur?: React.Dispatch<React.SetStateAction<string>>;
  onChange?: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
  tabIndex?: number;
}

const JoditEditorComponent: RefForwardingComponent<HTMLTextAreaElement, JoditEditorComponentProps> = (
  { value, onBlur, onChange, id, name, disabled = false, tabIndex = -1 },
  ref,
) => {
  const {
    i18n: { language },
  } = useTranslation();

  const textArea = useRef<HTMLTextAreaElement | null>(null);
  const config = useMemo(
    () => ({
      ...configDefault,
      readonly: !!disabled,
      language,
    }),
    [disabled, language],
  );

  useLayoutEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(textArea.current);
      } else {
        ref.current = textArea.current;
      }
    }
  }, [textArea]);

  useEffect(() => {
    const element = textArea.current;
    if (element) {
      if (id) {
        element.id = id;
      }
      if (name) {
        element.name = name;
      }
      const jodit = Jodit.make(element, config);

      jodit.value = value;
      jodit.events.on('blur', () => onBlur && textArea.current?.value && onBlur(textArea.current.value));
      jodit.events.on('change', () => onChange && textArea.current?.value && onChange(textArea.current.value));
      jodit.workplace.tabIndex = tabIndex;

      textArea.current = (jodit as unknown) as HTMLTextAreaElement;

      return () => {
        ((textArea.current as unknown) as JoditClass).destruct();
        textArea.current = element;
      };
    }
  }, [config]);

  useEffect(() => {
    if (textArea?.current && textArea.current.value !== value) {
      textArea.current.value = value;
    }
  }, [textArea, value]);

  return <textarea ref={textArea}></textarea>;
};

export default withStyles(styles)(forwardRef(JoditEditorComponent));
