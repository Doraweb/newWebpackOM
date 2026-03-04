import { connect } from 'react-redux';
import {
  hideModal,
  optimizeSetting,
  timeSetting,
  showOperatingModal,
  showObserverSecModal,
  operateSwitch,
  switchHide,
  showCheckboxModal,
  showSwitchUserModal,
  checkboxHide,
  checkboxSetting,
  showOperatingTextModal,
  textHide,
  textSetting,
  showRadioModal,
  radioHide,
  showSelectControlModal,
  selectHide,
  observerSetting,
  showCommonAlarm,
  alarmHide,
  checkboxMainSetting,
  observerModalDict,
  tableCellSetting,
  newTableCellSetting,
  reportCellSetting,
  showModal,
  tableOneClick,
  tableLoadingFun,
  showMainInterfaceModal
} from '../modules/SecModalModule';

import {
  // getTendencyModal,
  refreshCustomData,
  refreshCustomDataInModal,
  refreshTimePickerData,
  refreshRectanglePanelData,
  reportCustomData,
  refreshReportFun,
  refreshBenchmarkFun,
  energyCustomData,
  searchData,
  getCustomRealTimeData,
  // getPointRealTimeData,
  getTimePickerRealTimeData,
  getRectanglesPanelData,
  getCustomTableData
} from '../../observer/modules/ObserverModule'

import {
  getTendencyModal
} from '../../Trend/modules/TrendModule'

import { getToolPoint } from '../../history/modules/HistoryModule';

import { updatePage } from '../../dashboard/modules/DashboardModule';

import SecModalView from '../components/SecModalView';

const mapActionCreators = {
  hideModal,
  optimizeSetting,
  timeSetting,
  showOperatingModal,
  showObserverSecModal,
  operateSwitch,
  switchHide,
  showCheckboxModal,
  showSwitchUserModal,
  checkboxHide,
  checkboxSetting,
  showOperatingTextModal,
  textHide,
  textSetting,
  showRadioModal,
  radioHide,
  showSelectControlModal,
  selectHide,
  getToolPoint,
  observerSetting,
  showCommonAlarm,
  alarmHide,
  updatePage,
  checkboxMainSetting,
  observerModalDict,
  tableCellSetting,
  newTableCellSetting,
  reportCellSetting,
  showModal,
  tableOneClick,
  tableLoadingFun,
  refreshCustomData,
  refreshCustomDataInModal,
  refreshTimePickerData,
  refreshRectanglePanelData,
  reportCustomData,
  refreshReportFun,
  refreshBenchmarkFun,
  energyCustomData,
  searchData,
  getCustomRealTimeData,
  showMainInterfaceModal,
  getTimePickerRealTimeData,
  getRectanglesPanelData,
  getCustomTableData,
  getTendencyModal
}
const mapStateToProps = (state) => ({
  ...state.secModal,
  ...state.layout,
  ...state.observer
})

export default connect(mapStateToProps, mapActionCreators)(SecModalView)
