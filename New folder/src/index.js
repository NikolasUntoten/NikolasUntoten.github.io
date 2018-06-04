/* Written by Nikolas Gaub, 5/12/2018
 * This class renders the currently visible component.
 * To add or remove pages, make changes to the pages constant under imports
 */

//Imports
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import Home from './pages/main/home';
import Slideshow from './components/slideshow';

//Component to be rendered
class App extends React.Component {
	//Renders currently visible page
	render () {
		return (
			<Slideshow style={{height:'500px', width:'500px'}}>
				<Home />
				<Home />
			</Slideshow>
		);
	}
}

//Render component
ReactDOM.render(<App />, document.getElementById('app'));

// Hot-loading
registerServiceWorker();