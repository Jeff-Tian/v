import React from 'react';
import {Menu} from 'semantic-ui-react';
import {browserHistory} from 'react-router';

class AdminMenus extends React.Component {
    state = {activeItem: 'orders'};
    linkMap = {
        'orders': '/admin/orders',
        'settings': '/admin/settings'
    };
    handleItemClick = (e, {name}) => {
        this.setState({activeItem: name});
        browserHistory.push(this.linkMap[name]);
    };

    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
        Object.keys(this.linkMap).map(i => {
            if (this.linkMap[i] === window.location.pathname) {
                this.setState({
                    activeItem: i
                });
            }
        });
    }

    render() {
        const {activeItem} = this.state;

        return (
            <Menu color="red" inverted widths={3}>
                <Menu.Item header>啪啪米</Menu.Item>
                <Menu.Item name='orders' active={activeItem === 'orders'} onClick={this.handleItemClick}/>
                <Menu.Item name='settings' active={activeItem === 'settings'} onClick={this.handleItemClick}/>
            </Menu>
        );
    }
}

export default AdminMenus;