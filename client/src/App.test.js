import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';


if (!window.localStorage) {
    let localStorage = {
        getItem: function () {
            return 'ok';
        },
        setItem: function () {
            return 'ok';
        },
        removeItem: function () {
            return 'ok';
        }
    };

    window.localStorage = localStorage;
}


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
