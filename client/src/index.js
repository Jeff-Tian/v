import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {Router, Route, browserHistory} from 'react-router';
import LoginPage from './auth/login-page';
import Orders from './orders/orders';
import OrderDetail from './orders/order-detail';
import V from './v/index';
import Auth from './auth/auth';
import NotFound404 from './errors/404';

function isUserAuthenticated(nextState, replaceState) {
    if (!Auth.isUserAuthenticated()) {
        replaceState({
            nextPathname: nextState.location.pathname
        }, '/sign-in');
    }
}

ReactDOM.render((
    <Router history={browserHistory}>
        <Route path="/" component={App}/>
        <Route path="/v/:vid" component={V}/>
        <Route path="/v/:vid/:orderId" component={V}/>
        <Route path="/order/:orderId" component={OrderDetail}/>
        <Route path="/sign-in" component={LoginPage}/>
        <Route path="/admin/orders" component={Orders} onEnter={isUserAuthenticated}/>
        <Route path="/*" component={NotFound404}/>
    </Router>
), document.getElementById('root'));
