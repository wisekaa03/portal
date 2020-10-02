/** @format */

import React from 'react';
import JsPdf from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReactToPdfProps {
  children: React.ReactNode;
  filename: string;
  x?: number;
  y?: number;
  options?: Record<string, string>;
  scale?: number;
  onComplete?: () => void;
}

export interface ReactToPdfComponentProps {
  toPdf: any;
}

const ReactToPdf = React.forwardRef<HTMLElement, ReactToPdfProps>(
  ({ children, filename, x, y, options, scale, onComplete }, forwardedRef) => {
    const targetComponent = typeof forwardedRef === 'object' && forwardedRef !== null ? forwardedRef.current : null;
    if (children && typeof children === 'function' && targetComponent) {
      html2canvas(targetComponent, {
        logging: false,
        useCORS: true,
        scale,
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg');
        const pdf = new JsPdf(options);
        pdf.addImage(imgData, x || 0, y || 0, 800, 600);
        pdf.save(filename);
        if (onComplete) onComplete();
      });

      return children();
    }

    return null;
  },
);

// constructor(props) {
//   super(props);
//   this.toPdf = this.toPdf.bind(this);
//   this.targetRef = React.createRef();
// }
// toPdf() {
//   const { targetRef, filename, x, y, options, onComplete } = this.props;
//   const source = targetRef || this.targetRef;
//   const targetComponent = source.current || source;
//   if (!targetComponent) {
//     throw new Error('Target ref must be used or informed. See https://github.com/ivmarcos/react-to-pdf#usage.');
//   }
//   html2canvas(targetComponent, {
//     logging: false,
//     useCORS: true,
//     scale: this.props.scale,
//   }).then((canvas) => {
//     const imgData = canvas.toDataURL('image/jpeg');
//     const pdf = new JsPdf(options);
//     pdf.addImage(imgData, 'JPEG', x, y);
//     pdf.save(filename);
//     if (onComplete) onComplete();
//   });
// }
// render() {
//   const { children } = this.props;
//   return children({ toPdf: this.toPdf, targetRef: this.targetRef });
// }
// ReactToPdf.propTypes = {
//   filename: PropTypes.string,
//   x: PropTypes.number,
//   y: PropTypes.number,
//   options: PropTypes.shape({}),
//   scale: PropTypes.number,
//   children: PropTypes.func.isRequired,
//   onComplete: PropTypes.func,
//   targetRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.instanceOf(Element) })]),
// };

// ReactToPdf.defaultProps = {
//   filename: 'download.pdf',
//   options: undefined,
//   x: 0,
//   y: 0,
//   scale: 1,
//   onComplete: undefined,
//   targetRef: undefined,
// };

export default ReactToPdf;
