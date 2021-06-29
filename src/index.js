import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BindingsImpl} from "interacto";
import WebFont from 'webfontloader';

WebFont.load({
    google: {
        families: ['Josefin Sans', 'sans-serif']
    }
});

ReactDOM.render(
  <React.StrictMode>
    <App bindings={new BindingsImpl()}/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
