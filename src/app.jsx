import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MyComponent from './component.jsx';

function render() {
  ReactDOM.render(
      <MyComponent/>
     ,
    document.body
  );
}

render();
