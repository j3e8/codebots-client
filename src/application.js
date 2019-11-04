import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';

import AppContext from './context/AppContext';
import AppRouter from './AppRouter';

window.addEventListener('load', () => {
  const history = createBrowserHistory();

  ReactDOM.render((
    <AppContext.Provider value={{ history }}>
      <AppRouter />
    </AppContext.Provider>
  ), window.document.getElementById('react-container'));
});
