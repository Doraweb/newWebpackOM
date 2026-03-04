import { connect } from 'react-redux';
import {
    upDateCurValue,
    updateConfigModalProps,
    updateTimeShaftState
} from '../modules/LayoutModule.js';

import TimeShaft from '../components/TimeShaftView';

const mapActionCreators = {
    upDateCurValue,
    updateConfigModalProps,
    updateTimeShaftState
}

const mapStateToProps = (state) => ({
  modalDict : state.modal.modalDict,
  show: state.layout.bShowTimeShaft,
  props : state.layout.dateModal.props,
  timeArr : state.layout.timeArr,
  curValue :state.layout.curValue,
  dateModal : state.layout.dateModal,
  initHistroyData : state.observer.parmsDict.initHistroyData,
  observerDict : state.observer.parmsDict,
  loading : state.observer.loading
})

export default connect(mapStateToProps, mapActionCreators)(TimeShaft)
