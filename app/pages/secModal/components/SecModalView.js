/**
 * 项目统一-二级模态框
 */

import React from 'react';

import { modalTypes, SecModalTypes } from '../../../common/enum';

import ObserverSecModal from './ObserverSecModalView';

class SecModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      alarmVisible: false,
      switchUserVisible: false
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.type === this.props.type && this.props.type === modalTypes.CREATE_DASHBOARD_MODAL) {
      return false
    };
    if (nextProps.type != this.props.type && nextProps.type === modalTypes.SWITCH_USER_MODAL) {
      this.setState({
        switchUserVisible: true
      })
    };
    if (nextProps.alarmVisible == true) {
      if (this.state.alarmVisible == false) {
        this.setState({
          alarmVisible: !this.state.alarmVisible
        })
        return true
      }
      return false
    } else {
      if (this.state.alarmVisible == true) {
        this.setState({
          alarmVisible: !this.state.alarmVisible
        })
      }
      return true
    }
  }

  hideSwitchUserModal = () => {
    this.setState({
      switchUserVisible: false
    })
    this.props.hideModal()
  }

  render() {
    const {
      type,
      props,
      isLoading,
      pointInfo,
      dictBindString,
      switchVisible,
      switchData,
      hideModal,
      optimizeSetting,
      timeSetting,
      showOperatingModal,
      showObserverSecModal,
      operateSwitch,
      switchHide,
      showCheckboxModal,
      checkboxVisible,
      checkboxData,
      checkboxHide,
      checkboxSetting,
      showOperatingTextModal,
      textVisible,
      textData,
      textHide,
      textSetting,
      showRadioModal,
      radioVisible,
      radioData,
      radioHide,
      showSelectControlModal,
      selectVisible,
      selectData,
      selectHide,
      getToolPoint,
      observerSetting,
      showCommonAlarm,
      getTendencyModal,
      alarmHide,
      alarmVisible,
      alarmData,
      checkboxMainSetting,
      bShowTimeShaft,
      dateModal,
      curValue,
      observerModalDict,
      tableCellSetting,
      newTableCellSetting,
      reportCellSetting,
      updatePage,
      modalConditionDict,
      customList,
      customListInModal,
      custom_realtime_data,
      // point_realtime_data,
      tableLoading,
      custom_table_data,
      showModal,
      tableOneClick,
      refreshReportFun,
      refreshBenchmarkFun,
      refreshBenchmark,
      tableLoadingFun,
      getTimePickerRealTimeData,
      getRectanglesPanelData,
      refreshTimePickerData,
      refreshRectanglePanelData,
      refreshCustomData,
      refreshCustomDataInModal,
      getCustomRealTimeData,
      hideTendencyModal,
      tendencyVisible,
      tendencyData,
      showMainInterfaceModal
      // getPointRealTimeData
    } = this.props;
    if (!this.props.type) {
      return null;
    }

    if (type === SecModalTypes.OBSERVER_SEC_MODAL) {
      return (
        <ObserverSecModal
          {...props}
          hideModal={hideModal}
          showOperatingModal={showOperatingModal}
          showObserverSecModal={showObserverSecModal}
          switchVisible={switchVisible}
          switchData={switchData}
          switchHide={switchHide}
          handleOk={operateSwitch}
          isLoading={isLoading}
          pointInfo={pointInfo.pointInfo}
          showCheckboxModal={showCheckboxModal}
          checkboxVisible={checkboxVisible}
          checkboxData={checkboxData}
          checkboxHide={checkboxHide}
          checkboxSetting={checkboxSetting}
          showOperatingTextModal={showOperatingTextModal}
          textVisible={textVisible}
          textData={textData}
          textHide={textHide}
          textSetting={textSetting}
          showRadioModal={showRadioModal}
          radioVisible={radioVisible}
          radioData={radioData}
          radioHide={radioHide}
          showSelectControlModal={showSelectControlModal}
          selectVisible={selectVisible}
          selectData={selectData}
          selectHide={selectHide}
          getToolPoint={getToolPoint}
          observerSetting={observerSetting}
          showCommonAlarm={showCommonAlarm}
          getTendencyModal={getTendencyModal}
          alarmHide={alarmHide}
          alarmVisible={alarmVisible}
          alarmData={alarmData}
          bShowTimeShaft={bShowTimeShaft}
          dateModal={dateModal}
          curValue={curValue}
          observerModalDict={observerModalDict}
          modalConditionDict={modalConditionDict}
          customList={customList}
          custom_realtime_data={custom_realtime_data}
          /* point_realtime_data ={point_realtime_data} */
          tableLoading={tableLoading}
          custom_table_data={custom_table_data}
          showModal={showModal}
          tableOneClick={tableOneClick}
          refreshReportFun={refreshReportFun}
          refreshBenchmarkFun={refreshBenchmarkFun}
          refreshBenchmark={refreshBenchmark}
          tableLoadingFun={tableLoadingFun}
          getTimePickerRealTimeData={getTimePickerRealTimeData}
          getRectanglesPanelData={getRectanglesPanelData}
          refreshTimePickerData={refreshTimePickerData}
          refreshRectanglePanelData={refreshRectanglePanelData}
          refreshCustomData={refreshCustomData}
          refreshCustomDataInModal={refreshCustomDataInModal}
          customListInModal={customListInModal}
          getCustomRealTimeData={getCustomRealTimeData}
          showMainInterfaceModal={showMainInterfaceModal}
        /* getPointRealTimeData ={getPointRealTimeData} */
        />
      );
    } else {
      return null;
    }
  }
}

SecModal.propTypes = {
};

export default SecModal;
