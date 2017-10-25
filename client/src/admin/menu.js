import React from 'react';
import {Menu} from 'semantic-ui-react';

class AdminMenus extends React.Component {
    state = {activeItem: 'orders'};

    handleItemClick = (e, {name}) => this.setState({activeItem: name});

    render() {
        const {activeItem} = this.state;

        return (
            <Menu color="red" inverted widths={2}>
                <Menu.Item name='orders' active={activeItem === 'orders'} onClick={this.handleItemClick}/>
                <Menu.Item name='settings' active={activeItem === 'settings'} onClick={this.handleItemClick}/>
            </Menu>
        );
    }
}

export default AdminMenus;