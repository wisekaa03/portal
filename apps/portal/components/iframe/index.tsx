/** @format */

// #region Imports NPM
import React, { ComponentType } from 'react';
import objectAssign from 'object-assign';
import { IframeInterface } from './types';
// #endregion
// #region Imports Local
// #endregion

const Iframe: ComponentType<IframeInterface> = ({
  url,
  allowFullScreen,
  position,
  display,
  height,
  width,
  overflow,
  styles,
  onLoad,
  onMouseOver,
  onMouseOut,
  scrolling,
  id,
  frameBorder,
  ariaHidden,
  sandbox,
  allow,
  className,
  title,
  ariaLabel,
  ariaLabelledby,
  name,
  target,
  loading,
  importance,
  referrerpolicy,
  allowpaymentrequest,
  src,
  srcDoc,
}: IframeInterface) => {
  const defaultProps = objectAssign({
    'src': src || url,
    'srcDoc': srcDoc || null,
    'target': target || null,
    'style': {
      position: position || null,
      display: display || 'block',
      overflow: overflow || null,
      border: 'none',
    },
    'scrolling': scrolling || null,
    'allowpaymentrequest': allowpaymentrequest || null,
    'importance': importance || null,
    'sandbox': sandbox || null,
    'loading': loading || null,
    'styles': styles || null,
    'name': name || null,
    'className': className || null,
    'referrerpolicy': referrerpolicy || null,
    'title': title || null,
    'allow': allow || null,
    'id': id || null,
    'aria-labelledby': ariaLabelledby || null,
    'aria-hidden': ariaHidden || null,
    'aria-label': ariaLabel || null,
    'width': width || '100%',
    'height': height || '100%',
    'onLoad': onLoad || null,
    'onMouseOver': onMouseOver || null,
    'onMouseOut': onMouseOut || null,
  });
  const props = Object.create(null);

  // TODO: сделать
  // eslint-disable-next-line no-restricted-syntax
  for (const prop of Object.keys(defaultProps)) {
    if (defaultProps[prop] !== null) {
      props[prop] = defaultProps[prop];
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const i of Object.keys(props.style)) {
    if (props.style[i] === null) {
      delete props.style[i];
    }
  }

  if (allowFullScreen) {
    if ('allow' in props) {
      const currentAllow = props.allow.replace('fullscreen', '');
      props.allow = `fullscreen ${currentAllow.trim()}`.trim();
    } else {
      props.allow = 'fullscreen';
    }
  }

  if (frameBorder && frameBorder >= 0) {
    props.style.border = !props.style.hasOwnProperty('border') ? frameBorder : 'none';
  }

  return <iframe title="IFrame" {...props} />;
};

export default Iframe;
