import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import WebFont from 'webfontloader';
import BindingsProvider, {BindingsContext} from "./components/BindingsProvider";

WebFont.load({
    google: {
        families: ['Josefin Sans', 'sans-serif']
    }
});

ReactDOM.render(
  <React.StrictMode>
          <BindingsProvider>
              {/*This pattern allows class-based components to access several contexts if needed.
              Not necessary for functional components.*/}
              <BindingsContext.Consumer>
                  {(context) => (
                      <App bindings={context.bindings}/>
                  )}
              </BindingsContext.Consumer>
          </BindingsProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(undefined);
