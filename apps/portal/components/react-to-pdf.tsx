/** @format */

import React from 'react';
import { jsPDF as JsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReactToPdfProps {
  filename: string;
  x?: number;
  y?: number;
  options?: Record<string, string>;
  scale?: number;
  onComplete?: () => void;
  trigger: () => React.ReactElement;
  content: () => React.ReactInstance | null;
}

const ReactToPdf: React.FC<ReactToPdfProps> = ({ trigger, content, filename, x = 0, y = 0, options, scale = 1, onComplete }) =>
  React.cloneElement(trigger(), {
    onClick: () => {
      const contentEl = content();
      if (!contentEl) {
        throw new Error('Ref must be used or informed.');
      }

      html2canvas((contentEl as unknown) as HTMLElement, {
        logging: true,
        useCORS: true,
        scale,
      }).then((canvas) => {
        const pdf = new JsPDF(options);
        pdf.addImage(canvas, 'JPEG', x, y, 800, 600);
        pdf.save(filename);

        if (onComplete) onComplete();
      });
    },
  });

export default ReactToPdf;
