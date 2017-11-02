import React, {Component} from 'react';
import {Header, Icon, Menu, Segment, Sidebar, Divider} from 'semantic-ui-react';
import '../../public/lib/hammer.min';
import '../../public/lib/hammer-time.min';
import MainEntryPoint from '../App';

class SidebarLeftScaleDown extends Component {
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
                    <MainEntryPoint/>
                </Sidebar.Pusher>
            </Sidebar.Pushable>
        );
    }
}

export default SidebarLeftScaleDown;