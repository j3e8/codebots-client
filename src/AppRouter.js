import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';

import AppContext from './context/AppContext';
import GameView from './views/Game';
import PageNotFoundView from './views/PageNotFound';

export default class AppRouter extends React.Component {
  render () {
    return (
      <AppContext.Consumer>
        { ({ history }) => (
          <Router history={ history }>
            <Switch>
              <Route key="default" path="/" render={ () => <GameView /> } />
              <Route key="page-not-found" render={ () => <PageNotFoundView /> } />
            </Switch>
          </Router>
        ) }
      </AppContext.Consumer>
    );
  }
}
