import * as React from 'react'
import { Route, Router, Switch } from 'react-router-dom'

import { Home } from './components/Home'
import RegisterForm from './components/RegisterForm'
import { history } from './history'

import { Layout } from 'antd'
import './App.scss'
import LoginPage from './LoginPage'
import { Main } from './components/Main';

class App extends React.Component {
  public render() {
    return (
      <Router history={history}>
        <div className="App">
          <div>
            <Layout>
              <Switch>
                <Route path="/registration" component={RegisterForm} />
                <Route path="login" component={LoginPage} />
                <Route path="/home" exact component={Home} />
                <Route path="/" exact component={Main} />
              </Switch>
            </Layout>
          </div>
        </div>
      </Router>
    )
  }
}

export default App
