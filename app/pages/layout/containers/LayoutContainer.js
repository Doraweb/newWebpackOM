import { connect } from 'react-redux';
import { createSelector } from 'reselect'
import {
  searchSchedule,  //初始化
  delSchedule,     //删除日程
  addSchedule,     //添加日程
  editSchedule,    //修改日程
  useSchedule,     //启用、禁用
  obtainSchedule,  //加载数据
  fetchID,         //获取ID
  ModifySchedule,  //修改
  showModal,
  hideModal,
  showAlarmModal,
  hideAlarmModal,
  initialize,
  toggleTimeShaft,
  toggleDateConfigModal,
  getTimeArr,
  upDateCurValue,
  refreshRealWarning,
  refreshChoseKey,
  updateFullPage,
  getWorkerDict,
  recordFailedTime,
  showPointModal,
  saveHealthData,
  changeHealthDataStatus,
  switchUser,
  hidePointModal,
  onTrial,
  searchPoint,
  AddIdSchedule,
  addScene,            //添加场景
  delScene,
  saveSceneListId,
  editScene,
  savePoint,
  preSavePoint,
  changeSceneSavePoint,
  handleSimulation,
  searchList,
  getSceneList,
  addModel,
  getModelList,
  getModeButtonsList,
  saveModelListId,
  delModel,
  editModel,
  copyModel,
  addModelContent,
  editModelContent,
  getModelContent,
  delModelContent,
  updateFaultNum,
  isDeletedUpdate
} from '../modules/LayoutModule';
import {
  getSceneData,
  SceneSelectId,
  SceneLoad
} from '../modules/SceneModule'

import { getToolPoint } from '../../history/modules/HistoryModule';

import {
  resetFailedTime,
  changeReconnectModalVisible
} from '../modules/ReconnectionModule.js';

//AI决策弹窗需要的方法
import {
  addPage,
  removePage,
  updatePage,
  showPointModal as showPointModalAI,
  hidePointModal as hidePointModalAI
} from '../../aiRule/modules/AIRuleModule.js'
import {
  onSelectChangeInput
} from '../../aiRule/modules/InputPointModalModule.js'

import {
  onSelectChangeOutput
} from '../../aiRule/modules/OutputPointModalModule.js'

//规则控制需要的方法
import {
  showPointModal as showPointModalRule,
  hidePointModal as hidePointModalRule
} from "../../scriptRule/modules/ScriptRuleModule.js";

import {
  onSelectChange
} from "../../scriptRule/modules/PointModalModule.js"


//历史曲线
import {
  toggleLayer as toggleHistoryLayer,
  hideLayer,
  addPoint //Observer页面需要的方法
} from '../../history/modules/HistoryModule';

import {
  toggleDebugLayer
} from '../../debug/modules/DebugModule.js'

//Observer页面需要的方法
import {
  showCommonAlarm,
  showMainInterfaceModal,
  showMainCheckboxModal,
  showObserverModal,
  showOptimizeModal,
  showTimeModal,
  hideModal as hide,
  optimizeSetting,
  timeSetting,
  isLoading
} from '../../modal/modules/ModalModule'
import {
  getTendencyModal,
  hideTendencyModal
} from '../../Trend/modules/TrendModule.js'

import {
  hideCommandLogModal
} from '../../commandLog/modules/commandLogModule'

import {
  getAllCalendarWithMode,
  loadingCalendar
} from '../../calender/modules/CalendarManageModule.js'


import {
  toggleAlarmModal,
  renderList
} from '../../alarm/modules/AlarmManageModule'

import {
  toggleWarningManageModal,
} from '../../warningManage/modules/WarningManageModule'

import {
  toggleNetworkManageModal,
} from '../../networkManage/modules/NetworkManageModule'


//observer主页面的reducer
import {
  operateSwitch,
  switchHide,
  checkboxSetting,
  checkboxHide,
  refreshCustomData,
  refreshCustomDataInModal,
  settingTableDataFlagFun,
  createGuarantee,
  SeachGuarantee,
  ViewMessage,
  viewExperience
  // hideTendencyModal
} from '../../observer/modules/ObserverModule.js'
import {
  RepairDataAction,
  getRepairData,
  RepairVisiable
} from '../../repairManage/modules/RepairModule.js'

import {
  scriptRefreshAll
} from '../../scriptRule/modules/ScriptRuleModule';

import LayoutView from '../components/LayoutView';

const mapActionCreators = {
  addPage,
  removePage,
  updatePage,
  showPointModalAI,
  hidePointModalAI,
  showPointModalRule,
  hidePointModalRule,
  onSelectChangeInput,
  onSelectChangeOutput,
  onSelectChange,
  showPointModal,
  hidePointModal,
  showModal,
  hideModal,
  hideAlarmModal,
  showAlarmModal,
  toggleHistoryLayer,
  hideLayer,
  toggleAlarmModal,
  toggleWarningManageModal,
  toggleNetworkManageModal,
  renderList,
  initialize,
  toggleTimeShaft,
  toggleDateConfigModal,
  getTimeArr,
  showCommonAlarm,  //增加
  showMainInterfaceModal,
  showMainCheckboxModal,
  showObserverModal,
  showOptimizeModal,
  showTimeModal,
  switchUser,
  addPoint,
  upDateCurValue,
  operateSwitch,
  switchHide,
  checkboxSetting,
  checkboxHide,
  refreshRealWarning,
  refreshChoseKey,
  updateFullPage,
  getWorkerDict,
  toggleDebugLayer,
  recordFailedTime,
  resetFailedTime,
  changeReconnectModalVisible,
  refreshCustomData,
  refreshCustomDataInModal,
  settingTableDataFlagFun,

  saveHealthData,
  changeHealthDataStatus,
  // hideTendencyModal,
  searchSchedule,   //初始化
  addSchedule,      //添加日程
  editSchedule,    //修改日程
  delSchedule,      //删除日程
  useSchedule,      //启用,禁用
  obtainSchedule,   //加载数据
  fetchID,          //获取ID
  ModifySchedule,    //修改
  onTrial,
  searchPoint,
  AddIdSchedule,
  addScene,           //添加场景
  delScene,
  saveSceneListId,
  editScene,
  savePoint,
  preSavePoint,
  changeSceneSavePoint,
  handleSimulation,
  searchList,
  getSceneList,      //获取场景列表
  addModel,
  getModelList,
  getModeButtonsList,
  saveModelListId,
  delModel,
  editModel,
  copyModel,
  addModelContent,
  editModelContent,
  getModelContent,
  delModelContent,
  hideTendencyModal,
  hideCommandLogModal,
  getSceneData,
  SceneSelectId,
  SceneLoad,
  createGuarantee,
  SeachGuarantee,
  ViewMessage,
  RepairDataAction,
  viewExperience,
  getRepairData,
  RepairVisiable,
  getAllCalendarWithMode,
  hide,
  loadingCalendar,
  getTendencyModal,
  getToolPoint,
  scriptRefreshAll,
  updateFaultNum,
  isDeletedUpdate
}

// ------------------------------------
// selectors
// ------------------------------------


// ------------------------------------
// mapStateToProps
// ------------------------------------
const mapStateToProps = (state) => {
  const { selectedIdsInput, pointDataInput } = state.aiRule.inputPointTable
  const { selectedIdsOutput, pointDataOutput } = state.aiRule.outputPointTable
  const { selectedIds, pointData } = state.alarmManage.pointTable
  return {
    ...state.layout,
    ...state.observer,
    ...state.modal,
    ...state.alarmModal,
    ...state.warningManage,
    ...state.networkManage,
    ...state.reconnection,
    ...state.trend,
    ...state.commandlog,
    ...state.repairManage,
    ...state.SceneModel,
    selectedIds: selectedIds,
    pointData: pointData,
    isHistoryLayerVisible: state.history.visible,
    isAlarmManageVisible: state.alarmManage.alarmModal.visible,
    isWarningManageVisible: state.warningManage.warningManageModalVisible,//报警管理
    isNetworkManageVisible: state.networkManage.networkManageModalVisible, //网络拓扑
    isDebugLayerVisible: state.debug.base.debugVisible,
    dashboardPages: state.dashboard.reducer.pageList,
    selectedData: state.schedulePoint.selectedData,
    selectedIdsInput: selectedIdsInput,
    pointDataInput: pointDataInput,
    selectedIdsOutput: selectedIdsOutput,
    pointDataOutput: pointDataOutput
  }


}

export default connect(mapStateToProps, mapActionCreators)(LayoutView)
