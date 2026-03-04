/**
 * 登录页入口
 */
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Login from './Login';
import './Login.global.css';
import {electronLog} from 'electron-log';


// 默认的服务器地址
// 默认的服务器地址
// if (!localStorage.getItem('serverUrl')) {
//   localStorage.setItem('serverUrl', 'localhost:5000');
// }
// process.on('uncaughtException', function (err) {
//   electronLog.error(err.stack);
// });
render(
  <AppContainer>
    <Login />
  </AppContainer>,
  document.getElementById('container')
);

if (module.hot) {
  module.hot.accept('./Login', () => {
    const NextLogin = require('./Login'); // eslint-disable-line global-require
    // process.on('uncaughtException', function (err) {
    //   electronLog.error(err.stack);
    // })
    render(
      <AppContainer>
        <NextLogin />
      </AppContainer>,
      document.getElementById('container')
    );
  });
}

