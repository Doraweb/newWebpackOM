import { connect } from 'react-redux';
import PointView  from '../components/PointModalView'

const mapStateToProps = (state) => {
    if (state.scriptRule.reducer.modal === undefined) {
        state.scriptRule.reducer.modal = {
            type : undefined,
            props : {}
        }
    }
    return {
        modal : state.scriptRule.reducer.modal,
        pointData : state.scriptRule.pointTable.pointData,
        loading:state.scriptRule.pointTable.loading,
        selectedIds : state.scriptRule.pointTable.selectedIds,
        rowKey : 'name',
        pagination : {
            current : state.scriptRule.pointTable.current,
            total : state.scriptRule.pointTable.total,
            pageSize : state.scriptRule.pointTable.pageSize,       
            showSizeChanger: true,
            pageSizeOptions: ['50', '100', '200']
        }
    }
}

import {
    initialize,
    onPaginationChange,
    searchPointData,
    onSelectChange
} from '../modules/PointModalModule.js'

const mapActionCreator = {
    initialize,
    onPaginationChange,
    searchPointData,
    onSelectChange
}

export default connect(mapStateToProps,mapActionCreator)(PointView)
