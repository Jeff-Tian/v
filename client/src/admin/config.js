import React from 'react';
import config from '../config';
import Client from '../Client';
import {Container} from 'semantic-ui-react';

class Config extends React.Component {
    state = {config: JSON.stringify(config)};

    async componentDidMount() {
        this.setState({config: JSON.stringify(await Client.getConfig())});
    }

    render() {
        return (
            <Container>
                <p>{this.state.config}</p>
            </Container>
        );
    }
}

export default Config;