import React, {Component} from 'react';
import '../index.css';
import {browserHistory} from 'react-router';
import {Icon, Menu, Segment, Sidebar} from 'semantic-ui-react';
import ClientRoutes from "../routes";

class Layout extends Component {
    state = {visible: false, activeItem: window.location.pathname};

    toggleSidebarVisibility = () => this.setState({visible: !this.state.visible});
    handleItemClick = (e, {name}) => {
        this.setState({activeItem: name});
        this.hideSidebar();
        browserHistory.push(name);
    };

    showSidebar = () => this.setState({visible: true});
    hideSidebar = () => this.setState({visible: false});

    toggleSidebar = () => this.setState({visible: !this.state.visible})

    componentDidMount() {
        let hammertime = new window.Hammer(document.getElementById('root'), {});
        let self = this;

        hammertime.on('swiperight panright', function (ev) {
            if (window.location.pathname.indexOf('/order/') < 0) {
                self.showSidebar();
            }
        });
        hammertime.on('swipeleft panleft', function (ev) {
            self.hideSidebar();
        });
    }

    render() {
        const {visible, activeItem} = this.state;

        return (
            <Sidebar.Pushable as={Segment} basic>
                <Sidebar as={Menu} animation='scale down' width='thin' visible={visible} icon='labeled' vertical
                         inverted>
                    <Menu.Item name='/orders' active={activeItem === '/orders'}
                               onClick={this.handleItemClick}>
                        <Icon size="huge" name="yen sign"/>
                        Wall of fame
                    </Menu.Item>
                    <Menu.Item name='/' active={activeItem === '/'} onClick={this.handleItemClick}>
                        <Icon.Group>
                            <Icon size="huge" name="user circle outline"/>
                            <Icon corner name="viacoin"/>
                        </Icon.Group>
                        <br/>
                        加 v
                    </Menu.Item>
                    <Menu.Item name='/tools/sticker' active={activeItem === '/tools/sticker'} onClick={this.handleItemClick}>
                        <Icon size='huge' name='smile'/>
                        微信表情
                    </Menu.Item>
                    <Menu.Item name="/fake-face" active={activeItem === '/fake-face'} onClick={this.handleItemClick}>
                        <Icon size="huge" name="spy"/>
                        换脸
                    </Menu.Item>
                    <Menu.Item name="/tools/image-base64" active={activeItem === '/tools/image-base64'}
                               onClick={this.handleItemClick}>
                        <Icon size="huge" name="file image outline"/>
                        Base64
                    </Menu.Item>
                </Sidebar>
                <Sidebar.Pusher>
                    <Icon name="sliders horizontal" size="huge" onClick={this.toggleSidebar}></Icon>
                    <ClientRoutes/>
                </Sidebar.Pusher>
            </Sidebar.Pushable>
        );
    }
}

export default Layout;
