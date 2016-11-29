import React, { Component } from 'react';

import VirtualScroll from '../src/virtual-scroll'
import stringGenerator from './string-generator';


function createFactory(rowHeight) {
  class cmpClass extends Component {
    static HEIGHT = rowHeight

    onClick() {
      this.setState({counter: (this.state ? this.state.counter : 0) + 1});
    }

    render() {
      const props = this.props
      const counter = this.state ? this.state.counter : 0;

      return (
        <div style={props.style} onClick={() => this.onClick()}>
          <h3>Row #{props.index} state: {counter}</h3>
          <h4>Row height: {rowHeight}</h4>
          {props.children}
        </div>
      )
    }
  }

  cmpClass.HEIGHT = rowHeight;
  return React.createFactory(cmpClass);
}

const factories = [
  [createFactory(160), 160],
  [createFactory(190), 190],
  [createFactory(250), 250],
  [createFactory(350), 350]
]

const buildItems = (count) => {
  let result = [], itemFactory, itemHeight;
  while (count--) {
    [itemFactory, itemHeight] = factories[Math.floor(Math.random() * factories.length)];
    result.push(itemFactory(
      {key: count, index: 100 - count, style: {background: 'lightgrey', height: itemHeight}},
      stringGenerator(5)
    ));
  }

  return result;
}

export default class App extends Component {

  constructor(props) {
    super(props)
    this.state = {items: buildItems(100)};
  }

  add = () => {
    const count = this.state.items.length + 1;
    const [itemFactory, itemHeight] = factories[Math.floor(Math.random() * factories.length)];
    this.state.items.push(itemFactory(
      {key: count, index: count, style: {background: 'lightgrey', height: itemHeight}},
      stringGenerator(5)
    ));

    console.log("addding")
    this.setState({items: this.state.items.slice(0)});
  }

  render() {
    return (
      <div>
        <h1>Variable Height <button onClick={this.add}>add</button></h1>
        <VirtualScroll style={{height: 400, width: 400}}>
          {this.state.items}
        </VirtualScroll>
      </div>
    )
  }
}