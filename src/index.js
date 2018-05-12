/* Written by Nikolas Gaub, 5/12/2018
 * This class renders the currently visible component.
 * To add or remove pages, make changes to the pages constant under imports
 *
 */


//Imports
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import Home from './pages/main/home';

//All pages currently available for display on the website
const pages = new Map([
						['home', <Home />]
					  ]);

//Component to be rendered
class App extends React.Component {
	constructor() {
		super();
		
		//Initialize state
		this.state = {
			page:'home', //Page determines rendered component
		};
		
		//Bind functions
		this.setPage = this.setPage.bind(this);
	}
	
	//Changes page to given argument
	//Made to be used as a callback function for children components
	setPage(newPage) {
		if (pages.has(newPage)) {
			this.setState({
				page:newPage,
			});
		} else {
			console.error("Attempted to load page" + newPage + "; No such page exists.");
		}
	}
	
	//Renders currently visible page
	render () {
		if (pages.has(this.state.page)) {
			return pages.get(this.state.page);
			
		} else {
			return (
				<p>Error Loading Page</p>
			);
		}
	}
}

//Render component
ReactDOM.render(<App />, document.getElementById('app'));

// Hot-loading
registerServiceWorker();