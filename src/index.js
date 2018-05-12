import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

class App extends React.Component {
  render () {
    return <p> Hello React project</p>;
  }
}

ReactDOM.render(<App/>, document.getElementById('app'));

// Hot-loading
registerServiceWorker();