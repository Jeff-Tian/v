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

function isUserAuthenticated(nextState, replaceState) {
    if (!Auth.isUserAuthenticated()) {
        replaceState({
            nextPathname: nextState.location.pathname
        }, '/admin/sign-in');
    }
}

ReactDOM.render((
    <Router history={browserHistory}>
        <Route path="/" component={App}/>
        <Route path="/v/:vid" component={V}/>
        <Route path="/order/:orderId" component={OrderDetail}/>
        <Route path="/admin/sign-in" component={LoginPage}/>
        <Route path="/admin/orders" component={Orders} onEnter={isUserAuthenticated}/>
    </Router>
), document.getElementById('root'));
