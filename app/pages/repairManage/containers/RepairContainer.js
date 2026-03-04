import {connect} from 'react-redux';
import repairManageModelView from  '../components/RepairManageModelView'
const mapStateToProps = ( state ) => {
    return {
         ...state.repairManage
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
} from '../modules/RepairModule.js'

const mapActionCreator = {
    RepairDataAction,
    ViewMessage,
    viewExperience,
    getRepairData,
    RepairVisiable,
    CurrentData
}

export default connect(mapStateToProps,mapActionCreator)(repairManageModelView) 