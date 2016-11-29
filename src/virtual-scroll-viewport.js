import React, { Component, PropTypes } from 'react';
import sanitizeProps from './utils/sanitize-props';
import VirtualScrollApi from './api'
// import VirtualScrollItem from './virtual-scroll-item';

export default class VirtualScrollViewport extends Component {
  static propTypes = {
    /**
     * Either a fixed row height (number) or a string 'auto'
     * @type {number|string}
     */
    itemHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /**
     * Inline styles
     * @type {object}
     */
    style: PropTypes.object,

    noInlineOverflow: PropTypes.bool,

    onScroll: PropTypes.func
  }

  static childContextTypes = {
    /**
     * Returns current virtual scroll state: visibleRange, totalHeight and etc...
     * @type {Function}
     */
    getState: PropTypes.func.isRequired,
    updateItemHeight: PropTypes.func.isRequired,
    setChildren: PropTypes.func.isRequired,
    listen: PropTypes.func.isRequired
  }

  static defaultProps = {
    itemHeight: 'auto',
    noInlineOverflow: false
  }

  constructor(props) {
    super(props)
    this.api = new VirtualScrollApi({
      itemHeight: props.itemHeight,
      viewportHeight: 400
    });

    this.state = this.api.getState();
  }

  getChildContext() {
    return {
      getState: ::this.api.getState,
      listen: ::this.api.listen,
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
