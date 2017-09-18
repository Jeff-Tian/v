import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {Router, Route, browserHistory} from 'react-router';
import Auth from './auth/login-page';

class Test extends Component {
    render() {
        return (
            <div>Haha</div>
        );
    }
}

ReactDOM.render((
    <Router history={browserHistory}>
        <Route path="/" component={App}/>
        <Route path="/test" component={Test}/>
        <Route path="/admin/sign-in" component={Auth} />
    </Router>
), document.getElementById('root'));
