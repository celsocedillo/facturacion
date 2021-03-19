
import React, { Fragment } from 'react';
import logo from './logo.svg';
import './App.css';

import Cabecera from './components/layouts/cabecera';
import  Facturas  from './components/facturas';
import  Factura  from './components/factura';

import { Layout } from 'antd';
import {  BrowserRouter as Router, Switch, Route, Link, NavLink} from "react-router-dom";

const { Content } = Layout;

function App() {
  return (
    <Fragment>
      
    <Router>
      <Switch>
        <Route exact path={["/facturas", "/factura"]}>
          <Layout>
            <Cabecera/>
            <Content>
              <Route exact path="/facturas" component={Facturas} />
              <Route exact path="/factura" component={Factura} />
            </Content>
          </Layout>
        </Route>
      </Switch>
    </Router>
    </Fragment>
  );
}

export default App;
