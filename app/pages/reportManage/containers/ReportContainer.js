import {connect} from 'react-redux';
import ReportManageModelView from  '../components/ReportManageModelView'
const mapStateToProps = ( state ) => {
    return {
         ...state.reportManage
    }
}
import {
    ViewMessage,
    viewExperience
}from '../../observer/modules/ObserverModule'
import {
    RepairDataAction,
    getRepairData,
    RepairVisiable,
    CurrentData
} from '../modules/ReportModule.js'

const mapActionCreator = {
    RepairDataAction,
    ViewMessage,
    viewExperience,
    getRepairData,
    RepairVisiable,
    CurrentData
}

export default connect(mapStateToProps,mapActionCreator)(ReportManageModelView) 