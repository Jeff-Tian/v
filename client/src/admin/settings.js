import React from 'react';
import AdminMenus from './menu';
import config from '../../../config';
import {Checkbox, Container, Message, Segment} from 'semantic-ui-react';
import Client from '../Client';

class Settings extends React.Component {
    state = {config: config};

    toggle = async () => {
        config.trustMode = !this.state.config.trustMode;
        try {
            let newConfig = await Client.updateConfig(config);
            this.setState({config: newConfig});
        } catch (ex) {
            this.setState({error: ex});
        }
    };

    async componentDidMount() {
        this.setState({
            config: await Client.getConfig()
        });
    }

    render() {
        return (
            <Container>
                <AdminMenus/>

                {
                    this.state.error ? (
                        <Message error header="发生了错误" list={[JSON.stringify(this.state.error)]}/>
                    ) : ''
                }

                <Segment raised>
                    <Checkbox label={<label>信任模式（开启将自动审核通过所有声明已付款的订单）</label>} toggle onChange={this.toggle}
                              checked={this.state.config.trustMode}/>
                </Segment>
            </Container>
        );
    }
}

export default Settings;