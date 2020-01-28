/** @format */
import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';

const Jodit = dynamic(() => import('jodit-react'), { ssr: false });

const JoditEditor = ({}): React.ReactElement => {
  const editor = useRef(null);
  const [content, setContent] = useState('');

  const config = {
    readonly: false, // all options from https://xdsoft.net/jodit/doc/
  };

  // if (__SERVER__) return null;

  return (
    <Jodit
      ref={editor}
      value={content}
      config={config}
      // preferred to use only this option
      // to update the content for performance reasons
      onBlur={(newContent) => setContent(newContent)}
      onChange={() => {}}
    />
  );
};

export default JoditEditor;
