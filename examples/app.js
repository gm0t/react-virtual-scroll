import React, { Component } from 'react';
import Basic from './basic'
import VariableHeight from './variable-height'

export default class App extends Component {
  render() {
    return (
      <div>
        <VariableHeight />
      </div>
    )
  }
}