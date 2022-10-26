import {mount} from 'enzyme';
import React from 'react';
import ReactDOM from 'react-dom';

import Auth from '../../src/auth/login-page';
import {authErrorMessage} from "../../src/share/constants";
// import Client from '../../src/Client';

// jest.mock('../src/../Client');

const xhrMock = function () {

}

xhrMock.prototype.open = () => {
    console.log('request sent');
}
xhrMock.prototype.setRequestHeader = () => {
    console.log('header set')
}
xhrMock.prototype.addEventListener = function (_, func) {
    console.log('event happend')
    this.func = func;
}
xhrMock.prototype.send = function () {
    console.log('sending...')
    this.status = 401;
    this.response = authErrorMessage;

    this.func();
}

window.XMLHttpRequest = xhrMock;

describe('Auth Basic', () => {
    it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<Auth/>, div);
    });
});

describe('Auth', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(
            <Auth/>
        );
    });

    afterEach(() => {
        // Client.search.mockClear();
    });

    it('should display the login form', () => {
        expect(
            wrapper.find('.ui.form').length
        ).toBe(1);
    });

    it('should fail login when input is bad', async () => {
        const username = wrapper.find('input[name="name"]');
        username.simulate('change', {
            target: {name: 'name', value: 'badguy'}
        });

        const password = wrapper.find('input[name="password"]');
        password.simulate('change', {
            target: {name: 'password', value: 'nopass2'}
        });

        wrapper.find('form').simulate('submit', {
            preventDefault() {
            }
        });

        wrapper.update();

        console.log('stage = ', wrapper.state())

        expect(wrapper.state().errors).toEqual({summary: authErrorMessage});
    })
});
