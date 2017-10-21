import {shallow, mount} from 'enzyme';
import React from 'react';
import ReactDOM from 'react-dom';

import Auth from '../../src/auth/login-page';
// import Client from '../../src/Client';

// jest.mock('../src/../Client');
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

    it('should fail login when input is bad', () => {
        let input = wrapper.find('input').first();
        input.simulate('change', {
            target: {value: 'badguy'}
        });

        input = wrapper.find('input[name="password"]').first();
        input.simulate('change', {
            target: {value: 'nopass'}
        });

        let button = wrapper.find('button').first();
        button.simulate('click');

        expect(wrapper.state().errors).toEqual({summary: '请验证身份'});
    })
});
