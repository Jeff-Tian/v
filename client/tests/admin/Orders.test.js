import Enzyme, {shallow} from 'enzyme';
import React from 'react';
import Orders from '../../src/admin/orders';

// import Client from '../../src/Client';

// jest.mock('../src/../Client');

describe('Orders', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(
            <Orders/>
        );
    });

    afterEach(() => {
        // Client.search.mockClear();
    });

    it('should display the orders', () => {
        expect(
            wrapper.find('.ui.container').length
        ).toBe(1);
    });
});
