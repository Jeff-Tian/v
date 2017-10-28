import React from 'react';
import AdminMenus from './menu';
import config from '../../../config';

class Settings extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            config: config
        };
    }

    render() {
        return (
            <div className="ui container">
                <AdminMenus/>


            </div>
        );
    }
}

export default Settings;