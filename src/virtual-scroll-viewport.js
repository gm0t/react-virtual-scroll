import React, { Component, PropTypes } from 'react';
import sanitizeProps from './utils/sanitize-props';
import VirtualScrollApi from './api'

export default class VirtualScrollViewport extends Component {
  static propTypes = {
    /**
     * Either a fixed row height (number) or a string 'auto'
     * @type {number|string}
     */
    itemHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /**
     * How many items should be prerendered. For example, '2' means that there will be 4 additional items - 2 before visible ones and 2 after visible ones
     * @type {number}
     */
    bufferSize: PropTypes.number,
    /**
     * This value will be used to determine how many items should be rendered during the initial draw.
     * @type {number}
     */
    estimatedViewportHeight: PropTypes.number,

    /**
     * Inline styles
     * @type {object}
     */
    style: PropTypes.object,
    /**
     * By default there will be added "overflow: auto;", if you don't need it, then set this prop to true.
     * @type {boolean}
     */
    noInlineOverflow: PropTypes.bool,

    /**
     * scroll event handler
     * @type {Function}
     */
    onScroll: PropTypes.func,

    /**
     * Will be called with childContext as the first argument
     * @type {Function}
     */
    onInit: PropTypes.func
  }

  static childContextTypes = {
    /**
     * VirtualScrollApi.getState. Returns current virtual scroll state: visibleRange, totalHeight and etc...
     * @type {Function}
     */
    getState: PropTypes.func.isRequired,
    /**
     * VirtualScrollApi.scrollTo.
     * @type {Function}
     */
    scrollTo: PropTypes.func.isRequired,
    /**
     * Can be used to update item's height, if itemHeight = 'auto'
     * @type {Function}
     */
    updateItemHeight: PropTypes.func.isRequired,
    /**
     * VirtualScrollApi.setChildren.
     * @type {Function}
     */
    setChildren: PropTypes.func.isRequired,
    /**
     * VirtualScrollApi.listen. Use it to subsribe for state change (visibleRange, totalHeight...)
     * @type {Function}
     */
    listen: PropTypes.func.isRequired
  }

  static defaultProps = {
    itemHeight: 'auto',
    bufferSize: 5,
    estimatedViewportHeight: 0,
    noInlineOverflow: false
  }

  constructor(props) {
    super(props)
    this.api = new VirtualScrollApi({
      itemHeight: props.itemHeight,
      bufferSize: props.bufferSize,
      viewportHeight: props.estimatedViewportHeight
    });

    this.state = this.api.getState();
    if (props.onInit) {
      props.onInit(this.getChildContext());
    }
  }

  scrollTo = (idx, align = 'top') => {
    const item = this.api.items.get(idx),
      viewportHeight = this.state.viewportHeight;
    if (!item) {
      // TODO: should we throw exception here ?
      return false;
    }

    let scrollTop = item.top;

    if (align === 'bottom') {
      scrollTop = Math.max(0, item.top - viewportHeight + item.height);
    } else if (align === 'middle') {
      scrollTop = Math.max(0, item.top - viewportHeight / 2 + item.height / 2);
    }

    this.refs.viewport.scrollTop = scrollTop;
  }

  getChildContext() {
    return {
      getState: ::this.api.getState,
      listen: ::this.api.listen,
      scrollTo: ::this.scrollTo,
      setChildren: ::this.api.setChildren,
      updateItemHeight: ::this.api.updateItemHeight
    };
  }

  componentDidMount() {
    this.unbind = this.api.listen(state => this.setState(state));

    const viewport = this.refs.viewport;
    this.api.setViewportHeight(viewport.clientHeight);
    viewport.addEventListener('scroll', this.onScroll, {passive: true});
    // TODO: add resize listener
  }

  componentWillUnmount() {
    this.unbind && this.unbind();
    this.refs.viewport.removeEventListener('scroll', this.onScroll, {passive: true});
  }

  onScroll = (e) => {
    this.api.setPosition(e.target.scrollTop);
    if (this.props.onScroll) {
      this.props.onScroll(e);
    }
  }

  render () {
    const props = this.props;

    let style = props.style || {};
    if (!props.noInlineOverflow) {
      style.overflow = 'auto';
    }

    return (
      <div {...sanitizeProps(props, VirtualScrollViewport.propTypes)} style={style} ref="viewport">
        {props.children}
      </div>
    );
  }
}
