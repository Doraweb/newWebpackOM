import { connect } from 'react-redux';
import ScriptRuleModalView from '../components/ScriptRuleModalView'
import {
	initializePages,
	addPage,
	removePage,
	updatePage,
	showPointModal,
    hidePointModal
} from '../modules/ScriptRuleModule.js';
import {
	showModal,
	hideModal
} from '../../modal/modules/ModalModule.js';

import {
	onSelectChange
} from '../modules/PointModalModule'

import {
	toggleTimeShaft,
} from '../../layout/modules/LayoutModule'


const mapActionCreators = {
	initializePages,
	addPage,
	removePage,
	showModal,
	updatePage,
	hideModal,
	showPointModal,
    hidePointModal,
	onSelectChange,
	toggleTimeShaft,
}

const mapStateToProps = (state) => {
	const { selectedIds, pointData } = state.alarmManage.pointTable
	return {
		...state.dashboard.reducer,
		selectedIds: selectedIds,
		pointData: pointData,
		scriptRefreshFlag:state.scriptRule.reducer.scriptRefreshFlag,
		bShowTimeShaft: state.layout.bShowTimeShaft,
	}
}

export default connect(mapStateToProps, mapActionCreators)(ScriptRuleModalView)
