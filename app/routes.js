import React from 'react';
import { Route, IndexRoute, Router, hashHistory } from 'react-router';
import { push } from 'react-router-redux';

import Layout from './pages/layout';
import Home from './pages/home';
import Observer from './pages/observer';
import Error from './pages/error';
import HistoryCurveScreen from './pages/history';
import CxScreen from './pages/debug';
import AssetScreen from './pages/asset';
import DashboardScreen from './pages/dashboard';
import DashboardLine from './pages/dashboardLine';
import ExpertOptimizeScreen from './pages/expertOptimize';
import ScriptRuleScreen from './pages/scriptRule';
import AIRuleScreen from './pages/aiRule';
import CalenderScreen from './pages/calender';
import RepairManage from './pages/repairManage';
import ReportManage from './pages/reportManage';
import AlarmSystemManageScreen from './pages/Warning';
import EnergyManage from './pages/energyManage';
import KnowledgeView from './pages/knowledge/Knowledge';
import DataAnalysis from './pages/dataAnalysis/dataAnalysis';

import { initialize as initializeLayout } from './pages/layout/modules/LayoutModule';

import { store } from './index';

const handler = (hookAction, doneAction, errorAction) => {
  return (nextState, replace, callback) => {
    Promise.resolve(
      store.dispatch(hookAction())
    ).then(
      () => {
        callback();
        if (typeof doneAction === 'function') {
          store.dispatch(doneAction())
        }
      }
    ).catch(
      err => {
        console.error(err);
        callback();
        if (typeof errorAction === 'function') {
          store.dispatch(errorAction())
        }
      }
    );
  }
}
const jumpToDefaultPage = () => {
  let menus = store.getState().layout.menus;
  if (menus.length) {
    return push('/observer/' + menus[0].id);
  } else {
    // TODO 404 page
    return push('/error');
  }
}

export default (
  <Route path="/" components={Layout} >
    <IndexRoute component={Home} onEnter={handler(initializeLayout, jumpToDefaultPage)} />
    <Route path="observer/:id" component={Observer} />
    <Route path="systemToolHistoryCurve" component={HistoryCurveScreen} />
    <Route path="systemToolCx" component={CxScreen} />
    <Route path="AssetToolCx" component={AssetScreen} />
    <Route path="systemToolDashboard" component={DashboardScreen} />
    <Route path="systemToolExpertOptimize" component={ExpertOptimizeScreen} />
    <Route path="systemToolScriptRule" component={ScriptRuleScreen} />
    <Route path="systemToolAIRule" component={AIRuleScreen} />
    <Route path="systemToolCalender" component={CalenderScreen} />
    <Route path="repairManage" component={RepairManage} />
    <Route path="reportManage" component={ReportManage}/>
    <Route path="energyManage" component={EnergyManage}/>
    <Route component={DashboardScreen} >
        <Route path="dashboard/:name" component={DashboardLine} />
      </Route>
    <Route path="error" component={Error} />
    <Route path="AlarmSystemManage" component={AlarmSystemManageScreen} />
    <Route path="KnowledgeManage" component={KnowledgeView} />
    <Route path="systemToolDataAnalysis" component={DataAnalysis}/>
  </Route>
);



  

