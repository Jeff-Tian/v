import React, {Component} from 'react';
import Homepage from './homepage';
import '../index.css';
import {browserHistory, Route, Router} from 'react-router';
import LoginPage from '../auth/login-page';
import Orders from '../admin/orders';
import OrderDetail from '../orders/order-detail';
import FakeFace from '../fake-face';
import V from '../v/index';
import Auth from '../auth/auth';
import NotFound404 from '../errors/404';
import Settings from '../admin/settings';
import Config from '../admin/config';
import {Icon, Menu, Segment, Sidebar} from 'semantic-ui-react';
import '../../public/lib/hammer.min';
import '../../public/lib/hammer-time.min';

function isUserAuthenticated(nextState, replaceState) {
    if (!Auth.isUserAuthenticated()) {
        replaceState({
            nextPathname: nextState.location.pathname
        }, '/sign-in');
    }
}

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
                    <Menu.Item name='/' active={activeItem === '/'} onClick={this.handleItemClick}>
                        <Icon.Group>
                            <Icon size="huge" name="user circle outline"/>
                            <Icon corner name="viacoin"/>
                        </Icon.Group>
                        <br/>
                        加 v
                    </Menu.Item>
                    <Menu.Item name="/fake-face" active={activeItem === '/fake-face'} onClick={this.handleItemClick}>
                        <Icon size="huge" name="spy"/>
                        换脸
                    </Menu.Item>
                </Sidebar>
                <Sidebar.Pusher>
                    <Router history={browserHistory}>
                        <Route path="/" component={Homepage}/>
                        <Route path="/v/:vid" component={V}/>
                        <Route path="/v/:vid/:orderId" component={V}/>
                        <Route path="/order/:orderId" component={OrderDetail}/>
                        <Route path="/fake-face" component={FakeFace}/>
                        <Route path="/sign-in" component={LoginPage}/>
                        <Route path="/admin/orders" component={Orders} onEnter={isUserAuthenticated}/>
                        <Route path="/admin/settings" component={Settings} onEnter={isUserAuthenticated}/>
                        <Route path="/admin/api/config" component={Config} onEnter={isUserAuthenticated}/>
                        <Route path="/*" component={NotFound404}/>
                    </Router>
                </Sidebar.Pusher>
            </Sidebar.Pushable>
        );
    }
}

export default Layout;