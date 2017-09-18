import React, {PropTypes} from 'react';
import Auth from './auth';
import LoginForm from './components/LoginForm.jsx';
import { browserHistory } from 'react-router';

class LoginPage extends React.Component {
    constructor(props, context) {
        super(props, context);

        const storedMessage = localStorage.getItem('successMessage');
        let successMessage = '';

        if (storedMessage) {
            successMessage = storedMessage;
            localStorage.removeItem('successMessage');
        }

        this.state = {
            errors: {},
            successMessage,
            user: {
                name: '',
                password: ''
            }
        };

        this.processForm = this.processForm.bind(this);
        this.changeUser = this.changeUser.bind(this);
    }

    processForm(event) {
        event.preventDefault();

        const username = encodeURIComponent(this.state.user.name);
        const password = encodeURIComponent(this.state.user.password);
        const formData = `username=${username}&password=${password}&returnUrl=/admin/orders`;

        let self = this;

        const xhr = new XMLHttpRequest();
        xhr.open('post', '/admin/api/sign-in');
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {
                    let json = JSON.parse(xhr.response);

                    self.setState({
                        errors: {},
                        successMessage: 'welcome'
                    });

                    Auth.authenticateUser(json.token);

                    browserHistory.push(json.returnUrl || '/');
                } catch (ex) {
                    const errors = ex.message || JSON.stringify(ex);

                    self.setState({
                        errors
                    });
                }
            } else {
                const errors = xhr.response.errors ? xhr.response.errors : {};
                errors.summary = xhr.response.message || xhr.response;

                self.setState({
                    errors
                });
            }
        });
        xhr.send(formData);
    }

    changeUser(event) {
        const field = event.target.name;
        const user = this.state.user;
        user[field] = event.target.value;

        this.setState({
            user
        });
    }

    render() {
        return (
            <div className="ui container">
                <LoginForm onSubmit={this.processForm} errors={this.state.errors}
                           successMessage={this.state.successMessage} user={this.state.user}
                           onChange={this.changeUser}/>
            </div>
        );
    }
};

export default LoginPage;