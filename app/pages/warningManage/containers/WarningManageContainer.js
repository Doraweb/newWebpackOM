import {connect} from 'react-redux';
import WarningManageModalView from  '../components/WarningManageModalView'


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
    toggleWarningManageModal, //报警管理
} from '../modules/WarningManageModule.js'




const mapActionCreator = {
    toggleAlarmModal,
    toggleWarningManageModal,
    renderList
}

export default connect(mapStateToProps,mapActionCreator)(WarningManageModalView) 