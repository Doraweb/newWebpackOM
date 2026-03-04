import { connect } from 'react-redux';
import {
  hideModal,
  optimizeSetting,
  timeSetting,
  showOperatingModal,
  operateSwitch,
  switchHide,
  showCheckboxModal,
  showSwitchUserModal,
  checkboxHide,
  checkboxSetting,
  showOperatingTextModal,
  showObserverModal,
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
} from '../modules/ModalModule';

import {
  showObserverSecModal
} from '../../secModal/modules/SecModalModule';

import {
  // getTendencyModal,
  refreshCustomData,
  refreshCustomDataInModal,
  refreshTimePickerData,
  refreshFloatRectanglePanelData,
  reportCustomData,
  refreshReportFun,
  refreshBenchmarkFun,
  energyCustomData,
  searchData,
  getCustomRealTimeData,
  // getPointRealTimeData,
  getTimePickerRealTimeData,
  getFloatRectanglesPanelData,
  getCustomTableData
} from '../../observer/modules/ObserverModule'

import {
  getTendencyModal
} from '../../Trend/modules/TrendModule'

import { getToolPoint } from '../../history/modules/HistoryModule';

import { updatePage } from '../../dashboard/modules/DashboardModule';

import ModalView from '../components/ModalView';

const mapActionCreators = {
  hideModal,
  optimizeSetting,
  timeSetting,
  showOperatingModal,
  showObserverSecModal,
  showObserverModal,
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
  refreshFloatRectanglePanelData,
  reportCustomData,
  refreshReportFun,
  refreshBenchmarkFun,
  energyCustomData,
  searchData,
  getCustomRealTimeData,
  // getPointRealTimeData,
  getTimePickerRealTimeData,
  getFloatRectanglesPanelData,
  getCustomTableData,
  getTendencyModal,
  showMainInterfaceModal
}
const mapStateToProps = (state) => ({
  ...state.modal,
  ...state.layout,
  ...state.observer
})

export default connect(mapStateToProps, mapActionCreators)(ModalView)
