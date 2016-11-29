import React, { PropTypes } from 'react';
import VirtualScrollViewport from './virtual-scroll-viewport';
import VirtualScrollItems from './virtual-scroll-items';
import sanitizeProps from './utils/sanitize-props';

function VirtualScroll(props) {
  const viewportProps = sanitizeProps(props, VirtualScroll.PropTypes);

  return (
    <VirtualScrollViewport {...viewportProps}>
      <VirtualScrollItems {...props.wrapperProps} className={props.wrapperClassName}>
        {props.children}
      </VirtualScrollItems>
    </VirtualScrollViewport>
  )
}

VirtualScroll.PropTypes = {
  wrapperClassName: PropTypes.string,
  wrapperProps: PropTypes.object
}

VirtualScroll.VirtualScrollItems = VirtualScrollItems;
VirtualScroll.VirtualScrollViewport = VirtualScrollViewport;

// using module.exports to resolve compatibility issues with CommonJS modules
module.exports = VirtualScroll;