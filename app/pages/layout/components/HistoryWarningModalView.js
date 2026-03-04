import React from 'react';
import { Modal, Table, DatePicker, Button, Input, Row, Tooltip } from 'antd'
import s from './HistoryWarningModalView.css'
import moment from 'moment';
import { getTendencyModalByTime } from '../../Trend/modules/TrendModule';
import http from '../../../common/http';
import { downloadUrl } from '../../../common/utils'
import appConfig from '../../../common/appConfig';


const TimeFormat = 'YYYY-MM-DD HH:mm'
const TimeFormatDownLoad = 'YYYY-MM-DD HH:mm:ss'
const DateFormat = 'YYYY-MM-DD'
const Search = Input.Search
const language = appConfig.language

let str, dateBtn, btnStyle, searchBtn, level01Style, level02Style, level03Style;
if (localStorage.getItem('serverOmd') == "best") {
	str = 'warning-config-best'
} else {
	str = ''
}
if (localStorage.getItem('serverOmd') == "persagy") {
	str = 'persagy-warningManage-table';
	level01Style = {
		background: 'rgba(247,256,192,1)',
		borderRadius: '9px',
		fontSize: '12px',
		fontFamily: 'PingFangSC-Regular,PingFang SC',
		fontWeight: '400',
		color: '#eee',
		padding: '4px'
	}
	level02Style = {
		background: 'rgba(250,241,209,1)',
		borderRadius: '9px',
		fontSize: '12px',
		fontFamily: 'PingFangSC-Regular,PingFang SC',
		fontWeight: '400',
		color: 'rgba(170,120,3,1)',
		padding: '4px'
	}
	level03Style = {
		background: 'rgba(253,226,226,1)',
		borderRadius: '9px',
		fontSize: '12px',
		fontFamily: 'PingFangSC-Regular,PingFang SC',
		fontWeight: '400',
		color: 'rgba(172,47,40,1)',
		padding: '4px'
	}
	dateBtn = {
		background: "rgba(255,255,255,1)",
		color: "#0091FF",
		border: 'none',
		fontSize: '14px',
		fontFamily: 'MicrosoftYaHei',
		lineHeight: '28px'
	}
	btnStyle = {
		background: "rgba(255,255,255,1)",
		border: '1px solid rgba(195,198,203,1)',
		color: "rgba(38,38,38,1)",
		borderRadius: '4px',
		fontSize: "12px",
		fontFamily: 'MicrosoftYaHei',
		float: 'right',
		marginRight: '10px'
	}
	searchBtn = {
		border: '1px solid rgba(195,198,203,1)',
		borderRadius: '4px',
		fontSize: "12px",
		fontFamily: 'MicrosoftYaHei'
	}
} else {
	str = ''
	btnStyle = {
		float: 'right',
		marginRight: '10px'
	}
}

const columns = [{
	title: language == 'en' ? 'Start Time' : '开始时间',
	dataIndex: 'time',
	key: 'time',
	width: 120,
	sorter: (a, b) => Date.parse(a.time.replace('-', '/').replace('-', '/')) - Date.parse(b.time.replace('-', '/').replace('-', '/'))
}, {
	title: language == 'en' ? 'End Time' : '结束时间',
	dataIndex: 'endtime',
	key: 'endtime',
	width: 120,
	sorter: (c, d) => Date.parse(c.endtime.replace('-', '/').replace('-', '/')) - Date.parse(d.endtime.replace('-', '/').replace('-', '/'))
}, {
	title: language == 'en' ? 'Title' : '标题',
	dataIndex: 'info',
	width: 180,
	render: (text) => {
		return <Tooltip title={text} placement="bottomRight"><div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', userSelect: 'text' }}>{text}</div></Tooltip>
	}
}, {
	title: language == 'en' ? 'Detailed Information' : '详细信息',
	dataIndex: 'detail',
	width: 280,
	render: (text) => {
		return <Tooltip title={text} placement="bottomRight"> <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', userSelect: 'text' }}>{text}</div></Tooltip>
	}
}, {
	title: language == 'en' ? 'Level' : '等级',
	dataIndex: 'level',
	width: 50,
	render: (text) => {
		if (text == 1) {
			return (
				<span style={level01Style} >{language == 'en' ? 'Information' : '信息'}</span>
			)
		} else if (text == 2) {
			return (
				<span style={level02Style} >{language == 'en' ? 'Warning' : '警告'}</span>
			)
		} else {
			return (
				<span style={level03Style} >{language == 'en' ? 'Fault' : '故障'}</span>
			)
		}
	}
}, {
	title: language == 'en' ? 'Relevant Point' : '相关点名',
	dataIndex: 'strBindPointName',
	width: 150,
	render: (text, record) => {
		return (
			<Tooltip title={text} placement="bottomRight"><div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', userSelect: 'text' }}><Button type='link' size='small' title={language == 'en' ? 'Historical Trends' : '历史趋势'} icon='line-chart' onClick={() => getTendencyModalByTime(text, record['info'], record['time'])}></Button>{text}</div></Tooltip>
		)
	}
}];


class HistoryWarningView extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			startTime: moment().startOf('days'),
			endTime: moment(),
			endOpen: false,
			tableData: [],
			loading: false,
			startDate: moment().startOf('days'),
			endDate: moment(),
			showExportModal: false
		}

		this.dateOffset = 0;

		this.loadTable = this.loadTable.bind(this)
		this.handleOk = this.handleOk.bind(this)
		this.exportHistoryRecords = this.exportHistoryRecords.bind(this)
		this.handleChangeDate = this.handleChangeDate.bind(this)
		this.disabledStartDate = this.disabledStartDate.bind(this);
		this.disabledEndDate = this.disabledEndDate.bind(this);
		this.handleStartOpenChange = this.handleStartOpenChange.bind(this);
		this.handleEndOpenChange = this.handleEndOpenChange.bind(this);
		this.searchPoint = this.searchPoint.bind(this);
	}

	UNSAFE_componentWillMount() {
		this.searchPoint("")
	}

	componentDidMount() {
		this.loadTable()
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextState != this.state) {
			return true
		}
		if (nextProps.visible != this.props.visible) {
			return true
		}
		return false
	}

	loadTable() {
		const { startTime, endTime } = this.state
		const _this = this
		this.setState({
			loading: true
		})
		http.post('/warning/getHistory', {
			timeFrom: moment(startTime).format(TimeFormat), //变量
			timeTo: moment(endTime).format(TimeFormat),
			lan: language == 'en' ? 'en' : ''
		}).then(
			data => {
				_this.setState({
					tableData: data.map((item, i) => {
						item['no'] = i + 1
						if (item['level'] == 1) {
							item['level'] = '一般'
						}
						if (item['level'] == 2) {
							item['level'] = '严重'
						}
						if (item['level'] == 3) {
							item['level'] = '非常严重'
						}
						return item
					}),
					loading: false
				})
			}
		)
	}

	disabledStartDate(startValue) {
		const endValue = this.state.endTime;
		if (!startValue || !endValue) {
			return false;
		}
		return startValue.valueOf() > endValue.valueOf();

	}

	disabledEndDate(endValue) {
		const startValue = this.state.startTime;
		if (!endValue || !startValue) {
			return false;
		}
		return endValue.valueOf() <= startValue.valueOf();
	}

	handleStartOpenChange(open) {
		if (!open) {
			this.setState({ endOpen: true })
		}
	}

	handleEndOpenChange(open) {
		this.setState({ endOpen: open })
	}

	handleStartTimeChange = (value) => {
		this.setState({
			startTime: value,
			startDate: value
		})
	}

	handleEndTimeChange = (value) => {
		this.setState({
			endTime: value,
			endDate: value
		})
	}

	handleOk() {
		this.loadTable()
	}
	//增加时间快捷选项，时间段做加减一天的处理
	handleChangeDate(offset) {
		let s_time, end_time;
		if (offset == 0) {
			s_time = moment().startOf('day').format(TimeFormat),
				end_time = new Date()
		} else {
			this.dateOffset = typeof offset === 'undefined' ? 0 : offset;
			s_time = moment(this.state.startTime).add(this.dateOffset, 'days').format(TimeFormat);
			end_time = moment(this.state.endTime).add(this.dateOffset, 'days').endOf('day').format(TimeFormat);
		}
		this.setState({
			startTime: s_time,
			endTime: end_time
		}, this.loadTable);

	}
	searchPoint(value) {
		const { startTime, endTime } = this.state
		const _this = this
		this.setState({
			loading: true
		})
		http.post('/warning/getHistory', {
			timeFrom: moment(startTime).format(TimeFormat), //变量
			timeTo: moment(endTime).format(TimeFormat),
			lan: language == 'en' ? 'en' : ''
		}).then(
			data => {
				_this.setState({
					tableData: data.filter((item, i) => {
						item['no'] = i + 1
						return new RegExp(value, "i").test(item.strBindPointName) || new RegExp(value, "i").test(item.info)
					}),
					loading: false
				})
			}
		)
	}

	disabledStartDateEx = (startValue) => {
		const endValue = this.state.endDate;
		if (!startValue || !endValue) {
			return false;
		}
		return startValue.valueOf() > endValue.valueOf();
	}

	disabledEndDateEx = (endValue) => {
		const startValue = this.state.startDate;
		if (!endValue || !startValue) {
			return false;
		}
		return endValue.valueOf() <= startValue.valueOf();
	}

	handleStartTimeChangeEx = (value) => {
		this.setState({
			startDate: value
		})
	}

	handleEndTimeChangeEx = (value) => {
		this.setState({
			endDate: value
		})
	}
	//下载查询的历史报警
	handleDownload = () => {
		const { startTime, endTime } = this.state

		http.post('/warning/exportHistory', {
			"beginTime": moment(startTime).format(TimeFormatDownLoad),
			"endTime": moment(endTime).format(TimeFormatDownLoad)
		}).then(
			data => {
				if (data.err == 0) {
					downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/temp/${data.data}`)
					this.setState({
						loading: false
					});
				} else {
					Modal.error({
						title: language == 'en' ? 'Tip' : '提示',
						content: `${data.msg}`
					})
					this.setState({
						loading: false
					});
				}
			}
		).catch(
			err => {
				Modal.error({
					title: language == 'en' ? 'Tip' : '提示',
					content: language == 'en' ? 'Retrieval Failed' : '获取失败或无内容'
				})
				this.setState({
					loading: false
				});
			}
		)
	}

	handleExport = () => {
		this.setState({
			showExportModal: true
		})

	}

	//导出报警
	exportHistoryRecords() {
		const { startDate, endDate } = this.state
		this.setState({
			loading: true
		})

		http.post('/warning/download', {
			"beginTime": startDate.format(DateFormat),
			"endTime": endDate.format(DateFormat)
		}).then(
			data => {
				if (data.err == 0) {
					downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/temp/${data.data}`)
					this.setState({
						loading: false
					});
				} else {
					Modal.error({
						title: language == 'en' ? 'Tip' : '提示',
						content: `${data.msg}`
					})
					this.setState({
						loading: false
					});
				}
			}
		).catch(
			err => {
				Modal.error({
					title: language == 'en' ? 'Tip' : '提示',
					content: language == 'en' ? 'Retrieval Failed' : '获取失败或无内容'
				})
				this.setState({
					loading: false
				});
			}
		)
	}

	handleHide = () => {
		this.setState({
			showExportModal: false
		})
	}

	render() {
		const { endTime, startTime, endOpen, showExportModal, startDate, endDate } = this.state
		return (
			<Modal
				title={language == 'en' ? 'Historical Alarms' : '历史报警'}
				visible={this.props.visible}
				onCancel={this.props.handleCancel}
				maskClosable={false}
				footer={null}
				width={window.innerWidth - 100}
			>
				<div className={str}>
					<div className={s['date-btns-wrap']}>
						<Row>
							<DatePicker
								showTime
								placeholder={language == 'en' ? 'Start Time' : "开始时间"}
								allowClear={false}
								format={TimeFormat}
								value={moment(startTime, TimeFormat)}
								disabledDate={this.disabledStartDate}
								onChange={this.handleStartTimeChange}
								onOpenChange={this.handleStartOpenChange}
								style={{ minWidth: 150, width: 155 }}
							/>
							<DatePicker
								showTime
								placeholder={language == 'en' ? 'End Time' : "结束时间"}
								allowClear={false}
								format={TimeFormat}
								value={moment(endTime, TimeFormat)}
								disabledDate={this.disabledEndDate}
								open={endOpen}
								onChange={this.handleEndTimeChange}
								onOpenChange={this.handleEndOpenChange}
								style={{ minWidth: 150, width: 155 }}
							/>

							<Button onClick={() => { this.handleChangeDate(-1) }} style={dateBtn}>{language == 'en' ? ' The day before' : '前一日'}</Button>
							<Button onClick={() => { this.handleChangeDate(0) }} style={dateBtn}>{language == 'en' ? 'Today' : '今天'}</Button>
							<Button onClick={() => { this.handleChangeDate(1) }} style={dateBtn}>{language == 'en' ? 'The next day' : '后一日'}</Button>

							<Button icon="search" type="primary" onClick={() => { this.handleOk() }} style={searchBtn}>{language == 'en' ? 'Search' : '查询'}</Button>
							<Button icon="export"
								style={btnStyle}
								onClick={() => { this.handleExport() }}
							>{language == 'en' ? 'Batch Export' : '批量导出'}</Button>
							<Search
								style={{
									width: 400,
									marginLeft: 15,
									display: 'inline-block'
								}}
								onSearch={(value) => { this.searchPoint(value) }}
								placeholder={language == 'en' ? 'According to roll call or information screening' : '根据点名或信息筛选'}
							/>
							<Button icon="download" style={{ marginLeft: 5 }}
								type="primary"
								onClick={() => { this.handleDownload() }}
							>{language == 'en' ? 'Download' : '下载'}</Button>

						</Row>
					</div>
					<div>
						<Table
							columns={columns}
							pagination={{
								pageSize: 100
							}}
							dataSource={this.state.tableData}
							size="small"
							rowKey='no'
							bordered
							scroll={{ y: 350 }}
							loading={this.state.loading}
						/>
					</div>
					<Modal
						title={language == 'en' ? 'Export Range' : "导出范围"}
						width={300}
						visible={showExportModal}
						onCancel={this.handleHide}
						onOk={this.exportHistoryRecords}
						maskClosable={false}
						cancelText={language == 'en' ? 'Cancel' : "取消"}
						okText={language == 'en' ? 'Confirm' : "确定"}
					>
						<div>
							{language == 'en' ? 'Start Date' : "开始日期"}：<DatePicker
								placeholder={language == 'en' ? 'Start Date' : "开始日期"}
								allowClear={false}
								format={DateFormat}
								value={moment(startDate, DateFormat)}
								disabledDate={this.disabledStartDateEx}
								onChange={this.handleStartTimeChangeEx}
								style={{ minWidth: 150, width: 155 }}
							/>
							<div style={{ marginTop: 20 }}>
								{language == 'en' ? 'End Date' : "结束日期"}：<DatePicker
									placeholder={language == 'en' ? 'End Date' : "结束日期"}
									allowClear={false}
									format={DateFormat}
									value={moment(endDate, DateFormat)}
									disabledDate={this.disabledEndDateEx}
									onChange={this.handleEndTimeChangeEx}
									style={{ minWidth: 150, width: 155 }}
								/>
							</div>

						</div>
					</Modal>
				</div>
			</Modal>

		)
	}
}

export default HistoryWarningView