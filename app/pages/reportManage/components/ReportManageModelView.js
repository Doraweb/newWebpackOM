import React, { Component } from 'react';
import { DatePicker, Row, Col, Form, Button, Select, message, Spin, Input, Layout, Table, Pagination } from 'antd';
import ReactEcharts from '../../../lib/echarts-for-react';
import moment from 'moment';
import http from '../../../common/http';
import '../../../lib/echarts-themes/dark';
import { downloadUrl } from '../../../common/utils';
import { stringify } from 'postcss';
import s from './ReportManageModelView.css'
// 引入语言配置（关键：用于判断中英文环境）
import appConfig from '../../../common/appConfig';

// 1. 语言判断与文本集中管理（便于维护，确保术语统一）
const language = appConfig.language;
const isEnglish = language === 'en';
const TEXT = {
    // 表单相关
    QUICK_SELECT: isEnglish ? 'Quick Selection' : '快速选择',
    TODAY: isEnglish ? 'Today' : '今天',
    THIS_WEEK: isEnglish ? 'This Week' : '本周',
    THIS_MONTH: isEnglish ? 'This Month' : '本月',
    TIME_RANGE: isEnglish ? 'Time Range' : '时间范围',
    QUERY: isEnglish ? 'Query' : '查询',
    // 组件注册信息
    REPORT_DOWNLOAD_COMP: isEnglish ? 'Report Download Component' : '报表下载组件',
    GENERATE_REPORT_DOWNLOAD: isEnglish ? 'Generate Report Download Component' : '生成报表下载组件',
    // 表格列标题
    SERIAL_NO: isEnglish ? 'No.' : '编号',
    FILE_NAME: isEnglish ? 'File Name' : '文件名称',
    DESCRIPTION: isEnglish ? 'Description' : '描述',
    GENERATION_TIME: isEnglish ? 'Generation Time' : '生成时间',
    FILE_SIZE: isEnglish ? 'File Size' : '文件大小',
    INITIATOR: isEnglish ? 'Initiator' : '发起人',
    OPERATION: isEnglish ? 'Operation' : '操作',
    DOWNLOAD: isEnglish ? 'Download' : '下载',
    // 其他
    SELECT_REPORT: isEnglish ? 'Select Report:' : '选择报表：',
    ALL: isEnglish ? 'All' : '全部',
    REPORT_DOWNLOAD_TITLE: isEnglish ? 'Report Download' : '报表下载',
    FETCH_FAILED: isEnglish ? 'Failed to fetch data' : '数据获取失败'
};




const format = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
const ButtonGroup = Button.Group;
const FormItem = Form.Item;
const Option = Select.Option
const TimeFormat = 'YYYY-MM-DD HH:mm:ss'
const Search = Input.Search
const { Header, Content, Footer, Sider } = Layout;



const ModalForm = Form.create()(class defaultModal extends React.Component {

    constructor(props) {
        super(props)
        this.state = {

        }

        this.onSearch = this.onSearch.bind(this);
        this.setTime = this.setTime.bind(this);

    }

    onSearch() {
        let _this = this;
        let startTime, endTime;

        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }

            startTime = values.range[0].format(TimeFormat)
            endTime = values.range[1].format(TimeFormat)
            this.props.searchReport(startTime, endTime)

        });
    }

    setTime(param) {
        let startTime, endTime;
        switch (param) {
            case 'week':
                startTime = moment().startOf('week');
                endTime = moment();
                break;
            case 'month':
                startTime = moment().startOf('month');
                endTime = moment();
                break;
            case 'day':
            default:
                startTime = moment().startOf('day');
                endTime = moment();
                break;
        }

        this.props.form.setFieldsValue({
            range: [startTime, endTime]
        })

        this.props.searchReport(startTime, endTime, "")

    }


    componentWillReceiveProps(nextProps) {
        if (this.props != nextProps) {
        }
        // if (!this.props.autoSearch && nextProps.autoSearch) {
        //   this.points = nextProps.data.values;
        //   this.setTimeRange('hour');
        // }
    }

    componentDidMount() {
        this.setTime('day')
    }

    render() {
        const { form } = this.props;
        const { getFieldDecorator } = form;

        return (
            <Form layout='inline'>
                {/* 快捷选择按钮组 */}
                <FormItem label={TEXT.QUICK_SELECT}>
                    <ButtonGroup size="small">
                        <Button size="small" onClick={() => this.setTime('day')}>{TEXT.TODAY}</Button>
                        <Button size="small" onClick={() => this.setTime('week')}>{TEXT.THIS_WEEK}</Button>
                        <Button size="small" onClick={() => this.setTime('month')}>{TEXT.THIS_MONTH}</Button>
                    </ButtonGroup>
                </FormItem>
                {/* 时间范围选择器 */}
                <FormItem label={TEXT.TIME_RANGE}>
                    {getFieldDecorator('range')(
                        <RangePicker size="small" showTime format={'YYYY-MM-DD HH:mm'} />
                    )}
                </FormItem>
                {/* 查询按钮 */}
                <FormItem>
                    <Button type="primary" size="small" onClick={this.onSearch}>
                        {TEXT.QUERY}
                    </Button>
                </FormItem>
            </Form>
        );
    }
})



/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
// 3. 组件注册信息（国际化文本替换）
const registerInformation = {
    type: 'reportHistory',
    name: TEXT.REPORT_DOWNLOAD_COMP,
    description: TEXT.GENERATE_REPORT_DOWNLOAD,
};


// 4. 表单与表格容器组件（FormWrap）- 国际化改造
class FormWrap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: [],
            data: { total: 0 },
            loading: false,
            current: 1,
            pageSize: 20,
            pagination: {
                current: 1,
                pageSize: 20,
                total: 0,
                showSizeChanger: true // 显示每页条数切换
            },
            startTime: '',
            endTime: '',
            currentType: 'all' // 默认选中“全部”报表类型
        };

        // 绑定方法上下文
        this.searchReport = this.searchReport.bind(this);
        this.download = this.download.bind(this);
        this.onPaginationChange = this.onPaginationChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.getTypeItem = this.getTypeItem.bind(this);
    }

    static get defaultProps() {
        return { points: [], data: [] };
    }

    // 下载报表方法（逻辑不变）
    download(url) {
        downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/projectReports/0/${url}`);
    }

    // 查询报表历史数据（逻辑优化，文本国际化）
    searchReport(startTime, endTime, type, isOnPaginationChange) {
        this.setState({ loading: true, startTime, endTime });
        // 处理报表类型参数（“全部”对应空字符串）
        const name = type !== undefined
            ? (type === "all" ? "" : type)
            : (this.state.currentType === "all" ? "" : this.state.currentType);

        http.post('/report/getReportHistory', {
            lan: language,
            timeFrom: moment(startTime).format(TimeFormat),
            timeTo: moment(endTime).format(TimeFormat),
            pageSize: this.state.pageSize,
            pageNum: isOnPaginationChange ? this.state.current : 1,
            name: name
        }).then(data => {
            if (data.err === 0) {
                // 处理表格数据（添加序号、格式化文件大小）
                const tableData = data.data.reportList.length !== 0
                    ? data.data.reportList.map((item, index) => {
                        item['no'] = index + 1; // 序号
                        // 格式化文件大小为“X.XX M”（优化原字符串分割逻辑）
                        const sizeInMB = item.filesize / (1024.0 * 1024);
                        item['size'] = sizeInMB.toFixed(2) + 'M';
                        return item;
                    })
                    : [];

                this.setState({
                    data: data.data,
                    pagination: { ...this.state.pagination, total: data.data.total },
                    tableData,
                    loading: false
                });
            } else {
                this.setState({ loading: false });
            }
        }).catch(err => {
            message.error(TEXT.FETCH_FAILED); // 错误提示国际化
            this.setState({ loading: false });
        });
    }

    // 分页变更处理（逻辑不变）
    onPaginationChange(pagination) {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        pager.pageSize = pagination.pageSize;
        this.setState({
            pagination: pager,
            current: pagination.current,
            pageSize: pagination.pageSize
        }, () => {
            // 分页变更后重新查询
            this.searchReport(this.state.startTime, this.state.endTime, undefined, true);
        });
    }

    // 生成报表类型下拉选项（逻辑不变，文本由父组件传入）
    getTypeItem() {
        if (this.props.typeList && this.props.typeList.length !== 0) {
            return this.props.typeList.map(item => (
                <Option
                    key={item}
                    style={{ width: 250, backgroundColor: '#D5D5D5', border: '#D5D5D5', color: '#000' }}
                    value={item}
                >
                    {item}
                </Option>
            ));
        }
    }

    // 报表类型选择变更（逻辑不变）
    handleSelect(key) {
        this.setState({ currentType: key }, () => {
            this.searchReport(this.state.startTime, this.state.endTime, key);
        });
    }

    render() {
        const { width, height } = this.props;
        // 表格列配置（国际化文本替换）
        const tableColumns = [
            {
                title: TEXT.SERIAL_NO,
                dataIndex: 'no',
                key: 'no',
                width: '3%'
            },
            {
                title: TEXT.FILE_NAME,
                dataIndex: 'name',
                key: 'name',
                width: '6%'
            },
            {
                title: TEXT.DESCRIPTION,
                dataIndex: 'description',
                key: 'description',
                width: '18%'
            },
            {
                title: TEXT.GENERATION_TIME,
                dataIndex: 'gentime',
                width: '8%',
            },
            {
                title: TEXT.FILE_SIZE,
                dataIndex: 'size',
                width: '6%',
            },
            {
                title: TEXT.INITIATOR,
                dataIndex: 'author',
                width: '6%',
            },
            {
                title: TEXT.OPERATION,
                dataIndex: 'url',
                width: '6%',
                render: (text, record) => (
                    <Button onClick={() => this.download(record.url)}>{TEXT.DOWNLOAD}</Button>
                )
            }
        ];

        return (
            <div style={{ overflow: "hidden", marginTop: "5px" }}>
                {/* 报表类型选择下拉框 */}
                <div style={{ marginLeft: '10px', float: "left" }}>
                    {TEXT.SELECT_REPORT}
                    <Select
                        style={{ width: "250" }}
                        value={this.state.currentType}
                        onSelect={this.handleSelect}
                        dropdownMatchSelectWidth={false}
                    >
                        <Option
                            style={{ width: "250", backgroundColor: '#D5D5D5', border: '#D5D5D5', color: '#000' }}
                            value='all'
                        >
                            {TEXT.ALL}
                        </Option>
                        {this.getTypeItem()}
                    </Select>
                </div>

                {/* 时间查询表单 */}
                <div style={{ float: "right" }}>
                    <ModalForm searchReport={this.searchReport} />
                </div>

                {/* 报表表格 */}
                <div style={{ float: "left", height: height, width: "100%" }} className={s['table-wrap']}>
                    <Layout>
                        <Content>
                            <Table
                                columns={tableColumns}
                                dataSource={this.state.tableData}
                                size="small"
                                rowKey='no'
                                bordered={localStorage.getItem('serverOmd') === "persagy" ? false : true}
                                scroll={{ y: height ? height - 150 : window.innerHeight - 330 }}
                                loading={this.state.loading}
                                pagination={this.state.pagination}
                                onChange={this.onPaginationChange}
                            />
                        </Content>
                    </Layout>
                </div>
            </div>
        );
    }
}


//const efficiencyChartView = Form.create()(FormWrap)

/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class ReportManageModelView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            style: {},
            typeList: [] // 报表类型列表（从接口获取）
        };
        this.getReportType = this.getReportType.bind(this);
    }

    // 重写静态方法（组件类型标识，逻辑不变）
    static get type() {
        return registerInformation.type;
    }

    static get registerInformation() {
        return registerInformation;
    }

    componentDidMount() {
        // 初始化组件样式
        const { style } = this.props;
        this.setState({ style });
        // 获取报表类型列表
        this.getReportType();
    }

    // 获取报表类型列表（逻辑不变）
    getReportType() {
        http.post('/report/getReportNameList', {
            lan: language
        }).then(data => {
            if (data.err === 0) {
                this.setState({ typeList: data.data });
            }
        });
    }

    render() {
        const { style } = this.state;

        return (
            <div style={style} className={s['container']}>
                {/* 组件标题（国际化） */}
                <div style={{ textAlign: "center", fontSize: "20px" }}>{TEXT.REPORT_DOWNLOAD_TITLE}</div>
                {/* 表单与表格容器 */}
                <FormWrap
                    {...this.props}
                    typeList={this.state.typeList}
                />
            </div>
        );
    }
}

export default ReportManageModelView;


