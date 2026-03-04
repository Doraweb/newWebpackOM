/**
 * 主应用窗口
 */


import React from 'react';
import { render } from 'react-dom';
import { hashHistory } from 'react-router';
import { AppContainer } from 'react-hot-loader';
import { syncHistoryWithStore } from 'react-router-redux';
import Root from './pages/Root';
import configureStore from './core/configureStore';
import { updateLogoutLastTime } from './pages/layout/modules/LayoutModule';
import { showSwitchUserModal } from './pages/modal/modules/ModalModule'
import { closeApp } from './pages/layout/components/LayoutView';
import appConfig from './common/appConfig.js';
// if (localStorage.getItem('serverTheme')==='light') {
//   require('./themes/light/css/antd-light.global.css');
// } else {
//   require('./themes/dark/css/antd-dark.global.css');
// }
import './themes/dark/css/antd-dark.global.css';  //import静态引入路径
// import './themes/light/css/antd-light.global.css';  //import静态引入路径
// require('./themes/'+localStorage.getItem('serverTheme')+'.global.css');
import '../node_modules/codemirror/lib/codemirror.css';
import './app.global.css';
import { ConfigProvider, Modal } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import enUS from 'antd/es/locale/en_US';
import { ipcRenderer } from 'electron';




const language = appConfig.language
const log = require('electron-log')
var devInnerHeight = 1080.0 // 开发时的InnerHeight
var devInnerWidth = 1920.0 // 开发时的InnerWidth
var devDevicePixelRatio = 1.0// 开发时的devicepixelratio
var devScaleFactor = 1 // 开发时的ScaleFactor
var scaleFactor = require('@electron/remote').screen.getPrimaryDisplay().scaleFactor
var zoomFactor = 1
zoomFactor = (window.innerWidth / devInnerWidth) * (window.devicePixelRatio / devDevicePixelRatio) * (devScaleFactor / scaleFactor)


require('electron').webFrame.setZoomFactor(zoomFactor)

ipcRenderer.on('open-confirm-modal', (event, value) => {
  // console.log(value)
  Modal.confirm({
    title: '是否确定退出应用？',
    content: '点击"确定"按钮退出应用程序。',
    onOk() {
      // console.log('准备关闭应用程序')
      ipcRenderer.send('open-or-close', true)
    },
    onCancel() {
      // console.log('取消关闭应用程序')
      ipcRenderer.send('open-or-close', false)
    }
  })
})







// ipcRenderer.on('context-menu-command-fix-modify',(event,conmmand,id,showGuarantee) => {
//   // if (item.id == id) {
//       showGuarantee(Number(id))
//       // ipcRenderer.removeListener('context-menu-command-fix-modify')
//   // }
// })
// ipcRenderer.on('context-menu-command-fix-remove',(event,conmmand,id,show) => {
//   // if (item.id == id) {
//       Modal.confirm({
//           title: '删除经验',
//           content: '是否删除经验',
//           onOk: () => {
//               http.post('/fix/remove',{
//                   fixId:Number(id) 
//               }).then(
//                   data=>{
//                       if(data.err==0){
//                           show()
//                       }else{
//                           message.info('删除失败')
//                       }
//                   }
//               ).catch(
//                   err=>{
//                       if(err.err==1){
//                           message.info('删除失败')
//                       }
//                   }
//               )
//             }
//       })
//   // }
// })

if (!process.env.HOT) {
  __webpack_public_path__ = 'dist/';
}


export const store = configureStore();
export const history = syncHistoryWithStore(hashHistory, store);

//阻止空白处鼠标右击显示检查元素
window.document.oncontextmenu = (e) => {
  if (e.pageY > 48)
    return false;
}
//点击鼠标，更新超时登出时间
window.document.onmousedown = (e) => {
  if (e.button == 0 || e.button == 2) {
    store.dispatch(updateLogoutLastTime())
  }
}
//按下按键，更新超时登出时间
window.document.onkeydown = (e) => {
  if (e.ctrlKey && e.altKey && e.keyCode == 81) {
    log.error(`用户通过"ctrl+alt+q"快捷键退出软件`);
    closeApp();
  }
  if (e.keyCode == 123) {
    store.dispatch(showSwitchUserModal())
  }
  store.dispatch(updateLogoutLastTime())
  if (e.keyCode == 13) {
    if (document.getElementById('textChangeValue') != undefined) {
      document.getElementById('textChangeValue').click()
    }
    if (document.getElementById('switchChangeBtn') != undefined) {
      document.getElementById('switchChangeBtn').click()
    }
    if (document.getElementById('checkboxChangeBtn') != undefined) {
      document.getElementById('checkboxChangeBtn').click()
    }
    if (document.getElementById('textChangeBtn') != undefined) {
      document.getElementById('textChangeBtn').click()
    }
    if (document.getElementById('radioChangeBtn') != undefined) {
      document.getElementById('radioChangeBtn').click()
    }
    if (document.getElementById('selectChangeBtn') != undefined) {
      document.getElementById('selectChangeBtn').click()
    }
  }
}

window.document.addEventListener('webkitvisibilitychange', function () {
  if (document.webkitVisibilityState == "visible") {
    store.dispatch(updateLogoutLastTime())
  }
})



render(
  <ConfigProvider locale={language == "en" ? enUS : zhCN}>
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>
  </ConfigProvider>,
  document.getElementById('container')
);

if (module.hot) {
  module.hot.accept('./pages/Root', () => {
    const NextRoot = require('./pages/Root'); // eslint-disable-line global-require
    render(
      <ConfigProvider locale={enUS}>
        <AppContainer>
          <NextRoot store={store} history={history} />
        </AppContainer>
      </ConfigProvider>,
      document.getElementById('container')
    );
  });
}

