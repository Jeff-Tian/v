import React from 'react';
import {Label} from 'semantic-ui-react';

const colorMap = {
    白: 'white',
    '灰': '#ebebeb'
    // '透明': 'transparent'
};

const builtInColorMap = {
    黑: 'black'
};

const BackgroundColorSelector = (props) => (
    <div>
        <Label basic color={'red'} pointing="right">
            选取背景色：
        </Label>

        {
            Object.keys(builtInColorMap).map(color => (
                <Label color={builtInColorMap[color]}
                       key={color}
                       pointing={props.selected === builtInColorMap[color]}
                       onClick={() => {
                           props.selectColor(builtInColorMap[color]);
                       }}>
                    {color}
                </Label>
            ))
        }

        {Object.keys(colorMap).map(color => (
            <Label key={color} style={{backgroundColor: colorMap[color], border: '1px solid black'}}
                   pointing={props.selected === colorMap[color]}
                   onClick={() => {
                       props.selectColor(colorMap[color]);
                   }}>{color}</Label>
        ))}
    </div>
);

export default BackgroundColorSelector;