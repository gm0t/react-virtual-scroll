import React, { Component } from 'react';

import VirtualScroll from '../src/virtual-scroll'
import stringGenerator from './string-generator';

const buildItems = (itemFactory, count) => {
  let result = [];
  while (count--) {
    result.push(itemFactory(
      {key: count, index: 100 - count, style: {background: 'lightgrey'}},
      stringGenerator(5)
    ));
  }

  return result;
}

const BasicItemFactory = React.createFactory((props) => {
  return (
    <div style={props.style}>
      <h4>Row #{props.index}</h4>
      {props.children}
    </div>
  )
});

export default class App extends Component {
  render() {
    return (
      <div>
        <h1>Basic</h1>
        <VirtualScroll itemHeight={80} style={{height: 400, width: 400}}>
          {buildItems(BasicItemFactory, 100)}
        </VirtualScroll>
      </div>
    )
  }
}