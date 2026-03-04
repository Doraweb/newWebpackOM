import {connect} from 'react-redux';
import TrendModelView from  '../components/TrendModelView'
const mapStateToProps = ( state ) => {
    return {
         ...state.trend
    }
}

import {
    getTendencyModal, 
    hideTendencyModal
} from '../modules/TrendModule.js'

const mapActionCreator = {
    getTendencyModal, 
    hideTendencyModal
}

export default connect(mapStateToProps,mapActionCreator)(TrendModelView) 