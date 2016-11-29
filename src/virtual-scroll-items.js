import React, { Component, Children, PropTypes } from 'react';
// import VirtualScrollItem from './virtual-scroll-item';

export default class VirtualScrollItems extends Component {
  static contextTypes = {
    getState: PropTypes.func.isRequired,
    setChildren: PropTypes.func.isRequired,
    listen: PropTypes.func.isRequired
  }

  constructor(props, context) {
    super(props, context)
    context.setChildren(Children.toArray(props.children))
    this.state = context.getState();
  }

  shouldComponentUpdate(nprops, nstate) {
    var cprops = this.props,
      cstate = this.state;

    return nprops.children !== cprops.children
      || nstate.visibleRange !== cstate.visibleRange;
  }

  componentWillReceiveProps(nprops) {
    if (nprops.children !== this.props.children) {
      this.context.setChildren(Children.toArray(nprops.children))
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.totalHeight !== this.state.totalHeight) {
      this.refs.wrapper.style.height = nextState.totalHeight + 'px';
    }
  }

  componentDidMount() {
    this.unbind = this.context.listen(state => this.setState(state));
    this.refs.wrapper.style.height = this.state.totalHeight + 'px';
    this.refs.wrapper.style.position = 'relative';
  }

  componentWillUnmount() {
    this.unbind && this.unbind();
  }

  render () {
    return (
      <div ref="wrapper" {...this.props}>
        {this.state.visibleRange}
      </div>
    );
  }
}
