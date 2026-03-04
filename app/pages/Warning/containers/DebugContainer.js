import {connect} from 'react-redux';

import DebugView from '../components/DebugView'

import {
    choseMenuItem
} from '../modules/DebugModule.js'


import {
    reset as logReset
} from '../modules/FaultStatisticsModule.js'



const mapStateToProps =  (state) => {
    return {
        ...state.debug
    }
}


const mapActionCreators = { 
    choseMenuItem,
    logReset,
}


export default connect(mapStateToProps,mapActionCreators)(DebugView)

