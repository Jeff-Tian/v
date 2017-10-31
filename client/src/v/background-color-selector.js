import React from 'react';
import {Label, Icon} from 'semantic-ui-react';
import ColorPicker from './color-picker';

const colorMap = {
    白: 'white',
    '灰': '#ebebeb'
    // '透明': 'transparent'
};

const builtInColorMap = {
    黑: 'black'
};

class BackgroundColorSelector extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            colorPickerVisible: false
        };

        this.showColorPicker = this.showColorPicker.bind(this);
        this.hideColorPicker = this.hideColorPicker.bind(this);
        this.customized = this.customized.bind(this);
    }

    showColorPicker() {
        this.setState({
            colorPickerVisible: true
        });
    }

    hideColorPicker() {
        this.setState({
            colorPickerVisible: false
        });
    }

    customized() {
        return Object.keys(colorMap).filter(color => colorMap[color] === this.props.selected)
            .concat(Object.keys(builtInColorMap).filter(color => builtInColorMap[color] === this.props.selected))
            .length <= 0;
    }

    render() {
        return (
            <div>
                <Label basic color={'red'} pointing="right">
                    选取背景色：
                </Label>

                {
                    Object.keys(builtInColorMap).map(color => (
                        <Label color={builtInColorMap[color]}
                               key={color}
                               pointing={this.props.selected === builtInColorMap[color]}
                               onClick={() => {
                                   this.props.selectColor(builtInColorMap[color]);
                               }}>
                            {color}
                        </Label>
                    ))
                }

                {Object.keys(colorMap).map(color => (
                    <Label key={color} style={{backgroundColor: colorMap[color], border: '1px solid black'}}
                           pointing={this.props.selected === colorMap[color]}
                           onClick={() => {
                               this.props.selectColor(colorMap[color]);
                           }}>{color}</Label>
                ))}

                <Label as="a" color="teal" image pointing={this.customized()}>
                    <Icon name="compose" size="small"/>
                    <Label.Detail onClick={this.showColorPicker}>自定义</Label.Detail>
                </Label>


                <ColorPicker open={this.state.colorPickerVisible} onConfirm={(color) => {
                    this.props.selectColor(color);
                    this.hideColorPicker();
                }} initColor={this.props.selected}
                             onCancel={this.hideColorPicker}/>
            </div>
        );
    }
}

export default BackgroundColorSelector;