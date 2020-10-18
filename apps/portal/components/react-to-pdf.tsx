/** @format */

import React from 'react';
import { jsPDF as JsPDF, jsPDFOptions } from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReactToPdfProps {
  filename: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  options?: jsPDFOptions;
  scale?: number;
  onComplete?: () => void;
  trigger: () => React.ReactElement;
  content: () => React.ReactInstance | null;
}

const defaultOptions: jsPDFOptions = {
  orientation: 'portrait',
  unit: 'px',
};

const ReactToPdf: React.FC<ReactToPdfProps> = ({
  trigger,
  content,
  filename,
  x = 0,
  y = 0,
  w = 300,
  h = 150,
  options,
  scale = 8,
  onComplete,
}) =>
  React.cloneElement(trigger(), {
    onClick: () => {
      const contentEl = content();
      if (!contentEl) {
        throw new Error('Content must be used');
      }

      html2canvas((contentEl as unknown) as HTMLElement, {
        logging: true,
        useCORS: true,
        scale,
      }).then((canvas) => {
        const pdf = new JsPDF(Object.assign(defaultOptions, options));
        pdf.addImage(canvas, x, y, w, h);
        pdf.save(filename);

        if (onComplete) onComplete();
      });
    },
  });

export default ReactToPdf;
