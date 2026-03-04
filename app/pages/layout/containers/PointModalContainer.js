import { connect } from 'react-redux';
import PointView  from '../components/PointModalView'

import {
    initialize,
    onPaginationChange,
    saveSelectedPoint,
    searchPointData
    
} from '../modules/PointModalModule.js'

import {
    showPointModal
} from '../modules/LayoutModule.js'

const mapActionCreator = {
    initialize,
    onPaginationChange,
    saveSelectedPoint,
    searchPointData,
    showPointModal
}

const mapStateToProps = (state) => {
    return { 
        ...state.layout.pointModalDict,
        pointData : state.schedulePoint.pointData,
        loading:state.schedulePoint.loading,
        rowKey : 'name',
        pagination : {
            current : state.schedulePoint.current,
            total : state.schedulePoint.total,
            pageSize : state.schedulePoint.pageSize,       
            showSizeChanger: true,
            pageSizeOptions: ['50', '100', '200']
        }
    }
}



export default connect(mapStateToProps,mapActionCreator)(PointView)
