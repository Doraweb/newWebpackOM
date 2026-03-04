import {connect} from 'react-redux';
import NetworkManageModalView from  '../components/NetworkManageModalView'


import {
    toggleAlarmModal,
    renderList
  } from '../../alarm/modules/AlarmManageModule'

const mapStateToProps = ( state ) => {
    return {
        ...state.alarmModal,
        ...state.warningManage
    }
}


import {
    toggleNetworkManageModal, //报警管理
} from '../modules/NetworkManageModule.js'




const mapActionCreator = {
    toggleAlarmModal,
    toggleNetworkManageModal,
    renderList
}

export default connect(mapStateToProps,mapActionCreator)(NetworkManageModalView) 