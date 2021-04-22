import React from 'react';
import { Redirect, Route, withRouter } from 'react-router-dom';
import routes from './../../config/page-route.jsx';
import { PageSettings } from './../../config/page-settings.js';

function setTitle(path, routeArray) {
	var pageTitle;
	for (var i=0; i < routeArray.length; i++) {
		if (routeArray[i].path === path) {
			pageTitle = 'myEasyLedger | ' + routeArray[i].title;
		}
	}
	document.title = (pageTitle) ? pageTitle : 'myEasyLedger';
}

function handleRedirectToLogin(isAuthenticated, isLoading) {
	if (!isAuthenticated && !isLoading) {
		return <Redirect to="/user/login/form"/>;
	} else {
		return null;
	}
}

class Content extends React.Component {
	componentDidMount() {
		this.props.history.listen(() => {
			setTitle(this.props.history.location.pathname, routes);
		})
	}



  
	render() {
		return (
			<PageSettings.Consumer>
				{({pageContentFullWidth, pageContentClass, pageContentInverseMode, isAuthenticated, isLoading}) => (
					<div className={'content ' + (pageContentFullWidth ? 'content-full-width ' : '') + (pageContentInverseMode ? 'content-inverse-mode ' : '') + pageContentClass}>
						{routes.map((route, index) => (
							<Route
								key={index}
								path={route.path}
								exact={route.exact}
								component={route.component}
							/>
						))}
						{handleRedirectToLogin(isAuthenticated, isLoading)}
					</div>
				)
			}
			</PageSettings.Consumer>
		);
	}
}

export default withRouter(Content);
