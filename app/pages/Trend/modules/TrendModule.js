import http from '../../../common/http'
import { message } from 'antd'
import CheckWorker from '../../../common/checkWorker'
import { syncFunc, addOperation } from '../../../common/utils';
import moment from 'moment';
import { modalTypes } from '../../../common/enum'
import { showModal } from '../../modal/modules/ModalModule'
import { store } from '../../../index';

export const SHOW_TENDENCY = 'Trend.SHOW_TENDENCY';
export const HIDE_TENDENCY = 'Trend.HIDE_TENDENCY';
export function getTendencyModal(point, description, storecycle, initDate) {
  let time = []
  let dataSouce = []
  return function (dispatch, getState) {
    dispatch(showTendencyModal({ time, dataSouce, point, description, echartsVisible: false, storecycle, initDate }))
  }
}

export function getTendencyModalByTime(point, description, initTime) {
  store.dispatch(showTendencyModal({ time: [], dataSouce: [], point, description, echartsVisible: false, initTime }))
}

export function showTendencyModal(tendencyData) {
  return {
    type: SHOW_TENDENCY,
    visible: true,
    tendencyData
  }
}

export function hideTendencyModal() {
  return {
    type: HIDE_TENDENCY
  }
}

const ACTION_HANDLERS = {
  [SHOW_TENDENCY]: (state, action) => {
    return { ...state, tendencyVisible: action.visible, tendencyData: action.tendencyData }
  },
  [HIDE_TENDENCY]: (state) => {
    return { ...state, tendencyVisible: false, tendencyData: { time: [], dataSouce: [], point: '', description: '' } }
  }
}
const initialState = {
  tendencyVisible: false,
  tendencyData: {}
};
export default function homeReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

