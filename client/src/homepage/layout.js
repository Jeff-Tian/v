import React, {Component} from 'react';
import App from '../App';
import '../index.css';
import {browserHistory, Route, Router} from 'react-router';
import LoginPage from '../auth/login-page';
import Orders from '../admin/orders';
import OrderDetail from '../orders/order-detail';
import V from '../v/index';
import Auth from '../auth/auth';
import NotFound404 from '../errors/404';
import Settings from '../admin/settings';
import Config from '../admin/config';
import {Header, Icon, Menu, Segment, Sidebar, Divider} from 'semantic-ui-react';
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
    state = {visible: false};

    toggleSidebarVisibility = () => this.setState({visible: !this.state.visible});

    showSidebar = () => this.setState({visible: true});
    hideSidebar = () => this.setState({visible: false});

    componentDidMount() {
        let hammertime = new window.Hammer(document.getElementById('root'), {});
        let self = this;
        hammertime.on('swiperight', function (ev) {
            self.showSidebar();
        });
        hammertime.on('swipeleft', function (ev) {
            self.hideSidebar();
        });
    }

    render() {
        const {visible} = this.state;

        return (
            <Sidebar.Pushable as={Segment} basic>
                <Sidebar as={Menu} animation='scale down' width='thin' visible={visible} icon='labeled' vertical
                         inverted>
                    <Menu.Item name='home'>
                        <Icon.Group>
                            <Icon size="huge" name="thin circle"/>
                            <Icon size="big" name="user"/>
                            <Icon corner name="add"/>
                        </Icon.Group>
                        <Divider hidden/>
                        加 v
                    </Menu.Item>
                </Sidebar>
                <Sidebar.Pusher>
                    <Router history={browserHistory}>
                        <Route path="/" component={App}/>
                        <Route path="/v/:vid" component={V}/>
                        <Route path="/v/:vid/:orderId" component={V}/>
                        <Route path="/order/:orderId" component={OrderDetail}/>
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