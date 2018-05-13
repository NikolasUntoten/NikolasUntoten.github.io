/* Written by Nikolas Gaub, 5/13/2018
 * This class renders one of a set of elements passed as children
 */

//Imports
import React from 'react';

//Component to be exported
class Slideshow extends React.Component {
	constructor(props) {
		super(props);
		
		//Initialize state
		this.state = {
			index:0, //index determines rendered component, from array of children
		};
		
		//Bind functions
		this.changeIndex = this.changeIndex.bind(this);
		this.increment = this.increment.bind(this);
		this.decrement = this.decrement.bind(this);
	}
	
	//Renders currently visible page
	render () {
		var children = this.props.children;
		var numChildren = children.length;
		
		//initialized as none loaded
		//if no children component is passed, will be rendered as initialized
		var visibleComp = <p>No components loaded</p>; 
		
		if (Array.isArray(children)) { //Multiple children passed
			visibleComp = children[this.state.index % numChildren];
			
		} else if (children !== null) { //Only one child passed
			visibleComp = children;
		}
		
		return (
			<div style={this.props.style} >
				<Container increment={this.increment} decrement={this.decrement}>
					{visibleComp}
				</Container>
			</div>
		);
	}
	
	//Changes shown component index by given number (num)
	changeIndex(num) {
		this.setState({
			index:this.state.index+num,
		});
	}
	
	//Increments shown component index
	increment() {
		this.changeIndex(1);
	}
	
	//Decrements shown component index
	decrement() {
		this.changeIndex(-1)
	}
}

class Container extends React.Component {
	render() {
		var style = {
			position:'relative',
			backgroundColor:'gray',
			width:'100%',
			height:'100%',
		};
		return (
			<div style={style}>
				{this.props.children}
				<Button onClick={this.props.increment} flip={true} />
				<Button onClick={this.props.increment} flip={false} />
			</div>
		);
	}
}

class Button extends React.Component {
	render() {
		var style = {
			position:'absolute',
			width:'5%',
			height:'15%',
			top:'42.5%',
			left:(this.props.flip? '0px' : '95%'),
			backgroundColor:'black',
		}
		return (
			<div style={style}>
				
			</div>
		);
	}
}

export default Slideshow;