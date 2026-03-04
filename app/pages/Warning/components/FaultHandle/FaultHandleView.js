import React from 'react';
import { Table, Input, Button, DatePicker, Select, Modal, Form, Steps, Spin, Checkbox, Tooltip, Icon, Upload, Row, Col } from 'antd';
import s from './FaultHandleView.css'
import http from '../../../../common/http'
import moment from 'moment';
import { indexOf } from 'lodash';
import Editor from './FaultEditor'
import SearchEditor from './FaultSearchEditor';
import { downloadUrl } from '../../../../common/utils';
import RcViewer from '@hanyk/rc-viewer'
import appConfig from '../../../../common/appConfig';
import PictureManage from './PictureManagement';
import OrderFlowModalView from './OrderFlowModalView';
import { updateNum } from '../../../layout/modules/LayoutModule';
import { store } from '../../../../index'

// 语言配置
const language = appConfig.language;

// 文本映射
const textMap = {
    zhCN: {
        tip: '提示',
        workOrderNameRequired: '工单名称不能为空',
        submitWorkOrder: '提交工单',
        workOrderName: '工单名称',
        workOrderNamePlaceholder: '请填写工单名称',
        workOrderDetail: '工单详情',
        selectProcessor: '选择处理人',
        selectProcessorPlaceholder: '请选择工单处理人',
        selectWorkOrderType: '选择工单类型',
        workOrderFile: '工单文件',
        addImageVideoAttachment: '添加图片、视频或附件',
        expectedCompletionTime: '期望完成时间',
        expectedCompletionTimePlaceholder: '请选择期望完成时间',
        workOrderNameLabel: '工单名称',
        workOrderDetailLabel: '工单详情',
        processorLabel: '处理人',
        workOrderTypeLabel: '工单类型',
        fileLabel: '文件',
        estimatedTimeLabel: '期望完成时间',
        workOrderId: '工单ID',
        workOrderNameCol: '工单名称',
        creator: '创建人',
        processor: '处理人',
        createTime: '创建时间',
        estimatedTime: '期望完成时间',
        status: '状态',
        duration: '处理时长',
        operation: '操作',
        view: '查看',
        edit: '编辑',
        delete: '删除',
        confirm: '确认',
        cancel: '取消',
        loading: 'Loading...',
        createdBy: '由',
        createdAt: '创建于',
        workOrderFlow: '工单流',
        commentSection: '评论区',
        writeComment: '编写评论...',
        submitImageVideoAttachment: '提交图片、视频或附件',
        submitComment: '提交评论',
        workOrderDetails: '工单详情',
        exportPdf: '导出pdf',
        deleteCommentConfirm: '是否要删除该条评论？',
        deleteCommentSuccess: '删除评论成功',
        editCommentTitle: '修改评论内容',
        confirmEdit: '确认修改',
        editCommentSuccess: '评论修改成功',
        commentSubmitSuccess: '评论发表成功',
        exportPdfConfirm: '是否将该工单导出为pdf文件？',
        exportComments: '导出评论',
        exportAuthorInfo: '导出作者信息',
        exportAsWord: '以word文档格式导出',
        attachment: '附件',
        myself: '[自己]',
        editButton: '编辑',
        deleteButton: '删除',
        workOrderImage: '工单图片',
        upload: 'Upload',
        deleteSuccess: '删除成功',
        uploadImageFailed: '上传图片失败！',
        bindWorkOrderFailed: '图片绑定工单接口请求失败！',
        removeImageFailed: '从工单删除图片接口请求失败！',
        publishImageFailed: '发表图片失败！',
        hours: '小时',
        minutes: '分钟',
        position: '位置',
        type: '类型',
        level: '等级',
        occurrenceTime: '发生时间',
        group: '分组',
        creator: '创建人',
        processor: '处理人',
        createTime: '创建时间',
        estimatedTime: '期望完成时间',
        status: '状态',
        duration: '处理时长',
        operation: '操作',
        startProcessingTime: '开始处理时间',
        estimatedCompletionTime: '预计完成时间',
        inProgress: '进行中',
        terminated: '已终止',
        confirmed: '已确认',
        pendingAssignment: '待分派',
        paused: '暂停',
        pendingConfirmation: '待确认',
        assignWorkOrder: '分派工单',
        continueWorkOrder: '继续工单',
        freezeWorkOrder: '冻结工单',
        terminateWorkOrder: '终止工单',
        editWorkOrder: '修改工单',
        unfreezeWorkOrder: '解冻工单',
        completeWorkOrder: '完结工单',
        image: '图片',
        inProgressStatus: '进行中',
        terminatedStatus: '终止',
        confirmedStatus: '已确认',
        mediaSelection: '介质选择：',
        all: '全部',
        workOrderSelection: '工单选择：',
        positionSelection: '位置选择：',
        workOrderStatus: '工单状态：',
        pendingAssignment: '待分派',
        assigned: '已分派',
        submitted: '已提交',
        reviewed: '已审核',
        stopped: '已停止',
        terminated: '已终止',
        workOrderTime: '工单时间：',
        startTime: '开始时间',
        endTime: '结束时间',
        pleaseEnterKeyword: '请输入关键字',
        query: '查询',
        fullTextSearch: '全文查询',
        today: '今日',
        thisWeek: '本周',
        thisMonth: '本月',
        lastMonth: '近一月',
        onlyMine: '仅我的',
        onlyUpdates: '只看更新',
        export: '导出',
        createWorkOrder: '创建工单',
        assignTask: '分派任务',
        selectWorkOrderProcessor: '选择工单处理人员：',
        selectEstimatedCompletionTime: '选择预计完成时间：',
        estimatedCompletionTimePlaceholder: '预计完成时间',
        confirm: '确认',
        cancel: '取消',
        pauseTask: '暂停任务',
        selectPauseReason: '选择暂停原因：',
        pauseReasonPlaceholder: '请选择暂停原因',
        completeTask: '完成任务',
        selectCompletionReason: '选择完成原因：',
        completionReasonPlaceholder: '请选择完成原因',
        workOrderProgress: '工单进度',
        currentProgress: '当前进度',
        noPause: '无暂停',
        hasPause: '有暂停',
        workOrderFlow: '工单流',
        workOrderDetails: '工单详情',
        exportWorkOrder: '导出工单',
        exportAllWorkOrders: '导出所有工单',
        exportAllComments: '导出所有评论',
        exportAllFlow: '导出所有流程',
        exportAllByWord: '以word文档格式导出所有工单',
        exportAllWorkOrdersConfirm: '是否要导出所有工单？',
        exportAllWorkOrdersConfirmContent: '导出所有工单将包含当前筛选条件下的所有工单数据',
        faultHandling: '故障处理',
        currentWorkOrderStatus: '当前工单的处理状态：',
        assign: '分派',
        submitTask: '提交任务',
        pleaseEnterTaskSummary: '请输入提交任务的总结：',
        pleaseEnterSummary: '请输入总结',
        currentWorkOrderStatusColon: '当前工单的处理状态：',
        submitForReview: '提交审核',
        pauseTask: '暂停任务',
        pleaseEnterPauseReason: '请输入暂停任务的原因：',
        pleaseEnterReason: '请输入原因',
        pause: '暂停',
        workOrderTaskProgress: '工单任务进度',
        loadingProgressBar: '正在加载进度条...',
        workOrderProgress: '工单进度',
        currentProgress: '当前进度',
        noPause: '无暂停',
        hasPause: '有暂停',
        workOrderFlow: '工单流',
        workOrderDetails: '工单详情',
        exportWorkOrder: '导出工单',
        exportAllWorkOrders: '导出所有工单',
        exportAllComments: '导出所有评论',
        exportAllFlow: '导出所有流程',
        exportAllByWord: '以word文档格式导出所有工单',
        exportAllWorkOrdersConfirm: '是否要导出所有工单？',
        exportAllWorkOrdersConfirmContent: '导出所有工单将包含当前筛选条件下的所有工单数据',
        workOrderNumber: '工单号',
        // Steps相关文本
        pendingAssignmentStep: '待分派',
        inProgressStep: '进行中',
        pausedStep: '暂停',
        pendingReviewStep: '待审核',
        confirmedStep: '已确认',
        taskNotAssigned: '任务未分派',
        taskInProgress: '任务进行中',
        taskPaused: '任务已暂停',
        taskSubmittedWaitingReview: '任务已提交,等待审核',
        taskCompleted: '任务已结束',
        // 注释相关文本
        unreadBoldText: '如果未读，字体加粗大一号',
        confirmedTerminatedGrayText: '在没有未读的情况下，当工单状态是"已确认"（4），"已终止"（5）时，显示灰色',
        confirmedTerminatedGrayText2: '在没有未读的情况下，当工单状态是"已确认"，"已终止"时，显示灰色',
        // 其他遗漏的文本
        createWorkOrderTitle: '创建工单',
        normalWorkOrder: '普通工单',
        modifyWorkOrder: '修改工单',
        submitModification: '提交修改',
        workOrderNameLabel2: '工单名称',
        workOrderDetailLabel2: '工单详情',
        pleaseFillWorkOrderName: '请填写工单名称',
        // 状态相关文本
        pendingAssignmentStatus: '待分派',
        pendingConfirmationStatus: '待确认',
        noEstimatedTime: '无'
    },
    en: {
        tip: 'Tip',
        workOrderNameRequired: 'Work order name cannot be empty',
        submitWorkOrder: 'Submit Work Order',
        workOrderName: 'Work Order Name',
        workOrderNamePlaceholder: 'Please fill in work order name',
        workOrderDetail: 'Work Order Detail',
        selectProcessor: 'Select Processor',
        selectProcessorPlaceholder: 'Please select work order processor',
        selectWorkOrderType: 'Select Work Order Type',
        workOrderFile: 'Work Order File',
        addImageVideoAttachment: 'Add images, videos or attachments',
        expectedCompletionTime: 'Expected Completion Time',
        expectedCompletionTimePlaceholder: 'Please select expected completion time',
        workOrderNameLabel: 'Work Order Name',
        workOrderDetailLabel: 'Work Order Detail',
        processorLabel: 'Processor',
        workOrderTypeLabel: 'Work Order Type',
        fileLabel: 'File',
        estimatedTimeLabel: 'Expected Completion Time',
        workOrderId: 'Work Order ID',
        workOrderNameCol: 'Work Order Name',
        creator: 'Creator',
        processor: 'Processor',
        createTime: 'Create Time',
        estimatedTime: 'Expected Time',
        status: 'Status',
        duration: 'Duration',
        operation: 'Operation',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        confirm: 'Confirm',
        cancel: 'Cancel',
        loading: 'Loading...',
        createdBy: 'Created by',
        createdAt: 'at',
        workOrderFlow: 'Work Order Flow',
        commentSection: 'Comment Section',
        writeComment: 'Write a comment...',
        submitImageVideoAttachment: 'Submit images, videos or attachments',
        submitComment: 'Submit Comment',
        workOrderDetails: 'Work Order Details',
        exportPdf: 'Export PDF',
        deleteCommentConfirm: 'Are you sure you want to delete this comment?',
        deleteCommentSuccess: 'Comment deleted successfully',
        editCommentTitle: 'Edit Comment Content',
        confirmEdit: 'Confirm Edit',
        editCommentSuccess: 'Comment edited successfully',
        commentSubmitSuccess: 'Comment submitted successfully',
        exportPdfConfirm: 'Export this work order as PDF file?',
        exportComments: 'Export Comments',
        exportAuthorInfo: 'Export Author Info',
        exportAsWord: 'Export as Word document',
        attachment: 'Attachment',
        myself: '[Myself]',
        editButton: 'Edit',
        deleteButton: 'Delete',
        workOrderImage: 'Work Order Image',
        upload: 'Upload',
        deleteSuccess: 'Delete Success',
        uploadImageFailed: 'Upload image failed!',
        bindWorkOrderFailed: 'Bind work order interface request failed!',
        removeImageFailed: 'Remove image from work order interface request failed!',
        publishImageFailed: 'Publish image failed!',
        hours: 'hours',
        minutes: 'minutes',
        position: 'Position',
        type: 'Type',
        level: 'Level',
        occurrenceTime: 'Occurrence Time',
        group: 'Group',
        creator: 'Creator',
        processor: 'Processor',
        createTime: 'Create Time',
        estimatedTime: 'Expected Time',
        status: 'Status',
        duration: 'Duration',
        operation: 'Operation',
        startProcessingTime: 'Start Time',
        estimatedCompletionTime: 'Deadline',
        inProgress: 'In Progress',
        terminated: 'Terminated',
        confirmed: 'Confirmed',
        pendingAssignment: 'Pending Assignment',
        paused: 'Paused',
        pendingConfirmation: 'Pending Confirmation',
        assignWorkOrder: 'Assign Work Order',
        continueWorkOrder: 'Continue Work Order',
        freezeWorkOrder: 'Freeze Work Order',
        terminateWorkOrder: 'Terminate Work Order',
        editWorkOrder: 'Edit Work Order',
        unfreezeWorkOrder: 'Unfreeze Work Order',
        completeWorkOrder: 'Complete Work Order',
        image: 'Image',
        inProgressStatus: 'In Progress',
        terminatedStatus: 'Terminated',
        confirmedStatus: 'Confirmed',
        mediaSelection: 'Media Selection:',
        all: 'All',
        workOrderSelection: 'Selection:',
        positionSelection: 'Position Selection:',
        workOrderStatus: 'Status:',
        pendingAssignment: 'Pending Assignment',
        assigned: 'Assigned',
        submitted: 'Submitted',
        reviewed: 'Reviewed',
        stopped: 'Stopped',
        terminated: 'Terminated',
        workOrderTime: 'Time:',
        startTime: 'Start Time',
        endTime: 'End Time',
        pleaseEnterKeyword: 'Please enter keyword',
        query: 'Query',
        fullTextSearch: 'Full Text Search',
        today: 'Today',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        lastMonth: 'Last Month',
        onlyMine: 'Only Mine',
        onlyUpdates: 'Only Updates',
        export: 'Export',
        createWorkOrder: 'Create Work Order',
        assignTask: 'Assign Task',
        selectWorkOrderProcessor: 'Select Work Order Processor:',
        selectEstimatedCompletionTime: 'Select Estimated Completion Time:',
        estimatedCompletionTimePlaceholder: 'Estimated Completion Time',
        confirm: 'Confirm',
        cancel: 'Cancel',
        pauseTask: 'Pause Task',
        selectPauseReason: 'Select Pause Reason:',
        pauseReasonPlaceholder: 'Please select pause reason',
        completeTask: 'Complete Task',
        selectCompletionReason: 'Select Completion Reason:',
        completionReasonPlaceholder: 'Please select completion reason',
        workOrderProgress: 'Work Order Progress',
        currentProgress: 'Current Progress',
        noPause: 'No Pause',
        hasPause: 'Has Pause',
        workOrderFlow: 'Work Order Flow',
        workOrderDetails: 'Work Order Details',
        exportWorkOrder: 'Export Work Order',
        exportAllWorkOrders: 'Export All Work Orders',
        exportAllComments: 'Export All Comments',
        exportAllFlow: 'Export All Flow',
        exportAllByWord: 'Export All Work Orders as Word Document',
        exportAllWorkOrdersConfirm: 'Export all work orders?',
        exportAllWorkOrdersConfirmContent: 'Exporting all work orders will include all work order data under current filter conditions',
        faultHandling: 'Fault Handling',
        currentWorkOrderStatus: 'Current Work Order Status:',
        assign: 'Assign',
        submitTask: 'Submit Task',
        pleaseEnterTaskSummary: 'Please enter task summary:',
        pleaseEnterSummary: 'Please enter summary',
        currentWorkOrderStatusColon: 'Current Work Order Status:',
        submitForReview: 'Submit for Review',
        pauseTask: 'Pause Task',
        pleaseEnterPauseReason: 'Please enter pause reason:',
        pleaseEnterReason: 'Please enter reason',
        pause: 'Pause',
        workOrderTaskProgress: 'Work Order Task Progress',
        loadingProgressBar: 'Loading progress bar...',
        workOrderProgress: 'Work Order Progress',
        currentProgress: 'Current Progress',
        noPause: 'No Pause',
        hasPause: 'Has Pause',
        workOrderFlow: 'Work Order Flow',
        workOrderDetails: 'Work Order Details',
        exportWorkOrder: 'Export Work Order',
        exportAllWorkOrders: 'Export All Work Orders',
        exportAllComments: 'Export All Comments',
        exportAllFlow: 'Export All Flow',
        exportAllByWord: 'Export All Work Orders as Word Document',
        exportAllWorkOrdersConfirm: 'Export all work orders?',
        exportAllWorkOrdersConfirmContent: 'Exporting all work orders will include all work order data under current filter conditions',
        workOrderNumber: 'No',
        // Steps相关文本
        pendingAssignmentStep: 'Pending Assignment',
        inProgressStep: 'In Progress',
        pausedStep: 'Paused',
        pendingReviewStep: 'Pending Review',
        confirmedStep: 'Confirmed',
        taskNotAssigned: 'Task not assigned',
        taskInProgress: 'Task in progress',
        taskPaused: 'Task paused',
        taskSubmittedWaitingReview: 'Task submitted, waiting for review',
        taskCompleted: 'Task completed',
        // 注释相关文本
        unreadBoldText: 'If unread, bold and larger font',
        confirmedTerminatedGrayText: 'When there are no unread items, display in gray when work order status is "Confirmed" (4) or "Terminated" (5)',
        confirmedTerminatedGrayText2: 'When there are no unread items, display in gray when work order status is "Confirmed" or "Terminated"',
        // 其他遗漏的文本
        createWorkOrderTitle: 'Create Work Order',
        normalWorkOrder: 'Normal Work Order',
        modifyWorkOrder: 'Modify Work Order',
        submitModification: 'Submit Modification',
        workOrderNameLabel2: 'Work Order Name',
        workOrderDetailLabel2: 'Work Order Detail',
        pleaseFillWorkOrderName: 'Please fill in work order name',
        // 状态相关文本
        pendingAssignmentStatus: 'Pending Assignment',
        pendingConfirmationStatus: 'Pending Confirmation',
        noEstimatedTime: 'None'
    }
};

const getText = (key) => {
    return textMap[language] ? textMap[language][key] : textMap.zhCN[key];
};
const Step = Steps.Step;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const Option = Select.Option;
const confirm = Modal.confirm;
const FormItem = Form.Item
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00'

class FormWorkOder extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            estimatedTime: '',
            fileList: [],
            btnLoading: false
        }
    }

    changeEstimatedTime = (value) => {
        let Time = moment(value).format(TIME_FORMAT)
        this.setState({
            estimatedTime: Time,
        })
    }

    handleOk = () => {
        const { fileList, estimatedTime } = this.state
        this.props.form.validateFields((err, values) => {
            if (values.workOderName.match(/^\s*$/)) {
                Modal.info({
                    title: getText('tip'),
                    content: getText('workOrderNameRequired')
                })
                return
            }
            if (!err) {
                this.setState({
                    btnLoading: true
                })
                if (fileList.length == 0) {
                    this.sendOrder({
                        name: values['workOderName'],
                        detail: values['workOderDetail'],
                        creator: this.props.userName,
                        processor: values['processor'],
                        estimatedTime: estimatedTime,
                        onduty: appConfig.onduty,
                        cloudUserId: appConfig.cloudUser.cloudUserId,
                        projectId: appConfig.projectId,
                        nWorkOrderType: values['nWorkOrderType']
                    })
                } else {
                    let formData = new FormData()
                    fileList.forEach((item, index) => {
                        if ((index + 1) < 10) {
                            formData.append('file0' + (index + 1), item)
                        } else {
                            formData.append('file' + (index + 1), item)
                        }
                    })
                    formData.append('bucketName', 'dom-soft-release')
                    formData.append('directory', "static/images/fdd/" + localStorage.getItem('projectNameInCloud') + "/")
                    http.post('/saveImgToOSS', formData, {
                        headers: {
                            authorization: 'authorization-text',
                        }
                    }).then(res => {
                        if (res.err == 0) {
                            this.sendOrder({
                                name: values['workOderName'],
                                detail: values['workOderDetail'],
                                creator: this.props.userName,
                                processor: values['processor'],
                                estimatedTime: estimatedTime,
                                imgList: res.data,
                                onduty: appConfig.onduty,
                                cloudUserId: appConfig.cloudUser.cloudUserId,
                                projectId: appConfig.projectId,
                                nWorkOrderType: values['nWorkOrderType']
                            })
                        } else {
                            Modal.error({
                                title: language == 'en' ? 'Tip' : '提示',
                                content: res.msg
                            })
                            this.setState({
                                btnLoading: false
                            })
                        }
                    }).catch(err => {
                        Modal.error({
                            title: language == 'en' ? 'Tip' : '提示',
                            content: err.message
                        })
                        this.setState({
                            btnLoading: false
                        })
                    })
                }
            } else {
                this.setState({
                    estimatedTime: '',
                })
            }
        })
    }

    sendOrder = (values) => {
        http.post('/fdd/addMaintainanceFault', values).then(
            res => {
                if (res.err && res.err == 1) {
                    Modal.error({
                        title: language == 'en' ? 'Tip' : '提示',
                        content: res.msg
                    })
                } else {
                    this.setState({
                        estimatedTime: '',
                        fileList: []
                    })
                    this.props.onCancel()
                    this.props.search(this.props.StartTime, this.props.EndTime);
                }
                this.setState({
                    btnLoading: false
                })
            }
        ).catch(
            err => {
                this.setState({
                    estimatedTime: '',
                    btnLoading: false
                })
                Modal.error({
                    title: language == 'en' ? 'Tip' : '提示',
                    content: err.message
                })
            }
        )
    }

    //获取人员列表
    getWorkerOptions = () => {
        const { worker, userName } = this.props
        if (worker && worker.length > 0) {
            return worker.map((item, index) => {
                return <Option key={index} value={item.name_en}>{item.name_en} ({item.name_zh})</Option>
            })
        } else {
            return <Option key={1} value={userName}>{userName}</Option>
        }
    }

    render() {
        const { form, workOrderTypeList } = this.props
        const { fileList } = this.state
        const { getFieldDecorator } = form
        const imgProps = {
            onRemove: file => {
                const index = fileList.indexOf(file);
                const newFileList = fileList.slice();
                newFileList.splice(index, 1);
                this.setState({
                    fileList: newFileList
                })
            },
            beforeUpload: file => {
                this.setState({
                    fileList: [...fileList, file]
                })
                return false;
            },
            fileList,
        }
        const nWorkOrderTypeList = workOrderTypeList.map(item => {
            return <Option value={item.nType}>{item.typeName}</Option>
        })
        if (workOrderTypeList.length == 0) {
            nWorkOrderTypeList.push(<Option value={1}>{getText('normalWorkOrder')}</Option>)
        }
        return (
            <div>
                <Modal
                    title={getText('createWorkOrderTitle')}
                    visible={this.props.visible}
                    onCancel={() => {
                        this.setState({
                            estimatedTime: '',
                            fileList: []
                        })
                        this.props.onCancel()
                    }}
                    width={650}
                    maskClosable={false}
                    footer={[
                        <Button key="submit" type="primary" onClick={this.handleOk} loading={this.state.btnLoading}>
                            {getText('submitWorkOrder')}
                        </Button>
                    ]}
                >
                    <Form>
                        <FormItem label={getText('workOrderName')} style={{ marginBottom: 10 }}>
                            {getFieldDecorator('workOderName', {
                                rules: [{ required: true, message: getText('workOrderNamePlaceholder') }]
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem label={getText('workOrderDetail')} style={{ marginBottom: 10 }}>
                            {getFieldDecorator('workOderDetail', {
                            })(
                                <TextArea rows={10} onPaste={
                                    (e) => {
                                        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
                                        for (let i = 0; i < items.length; i++) {
                                            if (items[i].type.indexOf("image") !== -1) { // 只处理图片类型
                                                const file = items[i].getAsFile();
                                                file.uid = 'paste-' + file.lastModified
                                                if (JSON.stringify(fileList).indexOf(file.uid) == -1) {
                                                    this.setState({
                                                        fileList: [...fileList, file]
                                                    })
                                                }
                                            }
                                        }
                                    }} />
                            )}
                        </FormItem>

                        <Row>
                            <Col span={11}>
                                <FormItem label={getText('selectProcessor')} style={{ marginBottom: 10 }}>
                                    {getFieldDecorator('processor', {
                                        rules: [{ required: true, message: getText('selectProcessorPlaceholder') }]
                                    })(
                                        <Select>
                                            {this.getWorkerOptions()}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={2}>
                            </Col>
                            <Col span={11}>
                                <FormItem label={getText('selectWorkOrderType')} style={{ marginBottom: 10 }}>
                                    {getFieldDecorator('nWorkOrderType', {
                                    })(
                                        <Select>
                                            {nWorkOrderTypeList}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={11}>
                                <FormItem label={getText('workOrderFile')}>
                                    <Upload {...imgProps} multiple={true}>
                                        <Button style={{ borderRadius: 5 }} >
                                            <Icon type="upload" />{getText('addImageVideoAttachment')}
                                        </Button>
                                    </Upload>
                                </FormItem>
                            </Col>
                            <Col span={2}>
                            </Col>
                            <Col span={11}>
                                <FormItem label={getText('expectedCompletionTime')} style={{ marginBottom: 10 }}>
                                    {getFieldDecorator('estimatedTime', {
                                    })(
                                        <DatePicker
                                            showTime
                                            onChange={this.changeEstimatedTime}
                                            placeholder={getText('expectedCompletionTimePlaceholder')}
                                            format={TIME_FORMAT}
                                            disabledDate={this.props.disabledDate}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </div>

        )

    }
}
const FormWorkOderWrap = Form.create({
    mapPropsToFields: function (props) {
        return {
            workOderName: Form.createFormField({
                value: ''
            }),
            workOderDetail: Form.createFormField({
                value: ''
            }),
            processor: Form.createFormField({
                value: props.userName
            }),
            estimatedTime: Form.createFormField({
                value: ''
            }),
            nWorkOrderType: Form.createFormField({
                value: 1
            }),
        }
    }
})(FormWorkOder)

class FormModifyWorkOder extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            content: '',
            key: ''
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.selectFaultInfo.detail !== this.props.selectFaultInfo.detail) {
            this.setState({
                content: nextProps.selectFaultInfo.detail
            })
        }
    }

    changeContent = (e) => {
        this.setState({
            content: e.target.value
        })
    }

    handleOk = () => {
        const _this = this;
        _this.props.onCancel()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                http.post("/fdd/edit", {
                    orderId: _this.props.selectFaultInfo.id,
                    userName: _this.props.userName,
                    processor: values.processor,
                    nWorkOrderType: values['nWorkOrderType'],
                    name: values.workOderName,
                    detail: this.state.content, // 如果要修改工单详情则传入，否则不用传入
                    estimatedTime: values.estimatedTime == "" ? undefined : moment(values.estimatedTime).format(TIME_FORMAT)// 如果要修改工单预计完成时间则传入，否则不用传入
                }).then(res => {
                    if (res.err && res.err == 1) {
                        Modal.warning({
                            title: res.msg
                        })
                    } else {
                        _this.props.search()
                    }
                }).catch(err => {

                })
            }
        })
    }

    render() {
        const { form, workOrderTypeList } = this.props
        const { getFieldDecorator } = form
        const nWorkOrderTypeList = workOrderTypeList.map(item => {
            return <Option value={item.nType}>{item.typeName}</Option>
        })
        if (workOrderTypeList.length == 0) {
            nWorkOrderTypeList.push(<Option value={1}>{getText('normalWorkOrder')}</Option>)
        }
        return (
            <Modal
                title={getText('modifyWorkOrder')}
                visible={this.props.visible}
                onCancel={() => {
                    this.setState({
                        SelectWorker: '',
                        estimatedTime: '',
                        key: Math.random()
                    })
                    this.props.onCancel()
                }}
                key={this.state.key}
                width={650}
                maskClosable={false}
                footer={[
                    <Button key="submit" type="primary" onClick={this.handleOk}>
                        {getText('submitModification')}
                    </Button>
                ]}
            >
                <Form>
                    <FormItem label={getText('workOrderNameLabel2')}>
                        {getFieldDecorator('workOderName', {
                            rules: [{ required: true, message: getText('pleaseFillWorkOrderName') }]
                        })(<Input />)}
                    </FormItem>
                    <FormItem label={getText('workOrderDetailLabel2')}>
                        {getFieldDecorator('workOderDetail', {
                            initialValue: ""
                        })(<TextArea
                            content={this.state.content}
                            onChange={this.changeContent}
                        />)}
                    </FormItem>
                    <Row>
                        <Col span={11}>
                            <FormItem label={getText('selectProcessor')}>
                                {getFieldDecorator('processor', {
                                })(
                                    <Select>
                                        {this.props.getWorkerOptions()}
                                    </Select>)}
                            </FormItem>
                        </Col>
                        <Col span={2}>
                        </Col>
                        <Col span={11}>
                            <FormItem label={getText('selectWorkOrderType')} style={{ marginBottom: 10 }}>
                                {getFieldDecorator('nWorkOrderType', {
                                })(
                                    <Select>
                                        {nWorkOrderTypeList}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <FormItem label={getText('expectedCompletionTime')}>
                        {getFieldDecorator('estimatedTime', {
                        })(
                            <DatePicker
                                showTime
                                onChange={this.changeEstimatedTime}
                                placeholder={getText('expectedCompletionTimePlaceholder')}
                                format={TIME_FORMAT}
                                disabledDate={this.props.disabledDate}
                            />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )

    }
}
const FormModifyWorkOderWrap = Form.create({
    mapPropsToFields: function (props) {
        return {
            workOderName: Form.createFormField({
                value: props.selectFaultInfo.name
            }),
            workOderDetail: Form.createFormField({
                value: props.selectFaultInfo.detail
            }),
            processor: Form.createFormField({
                value: props.selectFaultInfo.status == getText('pendingAssignmentStatus') || props.selectFaultInfo.status == getText('pendingConfirmationStatus') ? "" : props.selectFaultInfo.owner
            }),
            estimatedTime: Form.createFormField({
                value: props.selectFaultInfo.estimatedTime == getText('noEstimatedTime') ? "" : moment(props.selectFaultInfo.estimatedTime)
            }),
            nWorkOrderType: Form.createFormField({
                value: props.selectFaultInfo.nWorkOrderType
            })
        }
    }
})(FormModifyWorkOder)


/*
{getText('faultHandling')}
*/
let timer
class FaultHandleView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            media: [],
            FaulType: [],
            position: [],
            worker: [],
            TableData: [],
            view: [],
            category: [],
            medium: [],
            position2: [],
            status: [],
            StartTime: moment().startOf('day').format(TIME_FORMAT),
            EndTime: moment().endOf('day').format(TIME_FORMAT),
            loading: false,
            fenPaiVisible: false,
            zanTingVisible: false,
            wanChengVisible: false,
            SelectWorker: "",
            SelectStatus: "",
            SelectRecord: "",
            userName: "",
            userName_zh: "",
            estimatedTime: "",
            workOderVisible: false,
            modifyWorkOderVisible: false,
            scheduleVisible: false, //鱼骨条模态框visible
            scheduleNumber: "",//鱼骨条：当前的进度
            stepStyle: true,  //鱼骨条：true代表无暂停，fasle代表有暂停
            stepLoading: false, //鱼骨条loading
            handleInfo: [], //鱼骨条：每个流程的时间和操作人员
            selectFaultInfo: {}, //存储被选中的故障信息
            orderFlowVisible: false,   //工单流弹窗
            orderId: '',       //点击的工单id
            updateFddList: [],
            searchValue: "",
            workOrderTypeList: []  //工单类型列表
        }

        this.mediaSelection = this.mediaSelection.bind(this)
        this.typeSelection = this.typeSelection.bind(this)
        this.positionSelection = this.positionSelection.bind(this)
        this.changeTime = this.changeTime.bind(this)
        this.todayTime = this.todayTime.bind(this)
        this.weekTime = this.weekTime.bind(this)
        this.oneMonthTime = this.oneMonthTime.bind(this)
        this.monthTime = this.monthTime.bind(this)
        this.search = this.search.bind(this)
        this.changeWorkerModal = this.changeWorkerModal.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.allStatusBtnClick = this.allStatusBtnClick.bind(this)
        this.allClick = this.allClick.bind(this)
        this.getWorkerOptions = this.getWorkerOptions.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.changeFaultStatusBtn = this.changeFaultStatusBtn.bind(this)
        this.changeFaultStatus = this.changeFaultStatus.bind(this)
        this.changeEstimatedTime = this.changeEstimatedTime.bind(this)
        this.onlyMine = this.onlyMine.bind(this)
        this.showCreateWorkOder = this.showCreateWorkOder.bind(this)
        this.handleWorkOderCancel = this.handleWorkOderCancel.bind(this)
        this.handleScheduleCancel = this.handleScheduleCancel.bind(this)
        this.saveFormRef = this.saveFormRef.bind(this);
        this.scheduleModal = this.scheduleModal.bind(this)
        this.getHandleInfo = this.getHandleInfo.bind(this)
        this.faultEnable = this.faultEnable.bind(this)
        this.disabledDate = this.disabledDate.bind(this)
        this.faultInfo = this.faultInfo.bind(this)
        this.handleModifyWorkOderCancel = this.handleModifyWorkOderCancel.bind(this)
        this.fddExportInfo = this.fddExportInfo.bind(this)
        this.searchAllStr = this.searchAllStr.bind(this)
    }



    //初始化
    componentDidMount() {

    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.workOderVisible == true && nextState.workOderVisible == true) {
            return false
        }
        if (this.state.modifyWorkOderVisible == true && nextState.modifyWorkOderVisible == true) {
            return false
        }
        if (this.state.orderFlowVisible == nextState.orderFlowVisible && nextState.orderFlowVisible == true) {
            return false
        }
        if (this.state.wanChengVisible == nextState.wanChengVisible && nextState.wanChengVisible == true) {
            return false
        }
        if (this.state.zanTingVisible == nextState.zanTingVisible && nextState.zanTingVisible == true) {
            return false
        }
        if (nextProps.visible !== this.props.visible) {
            if (nextProps.visible == true) {
                let media = [], FaulType = [], position = [], userName_zh
                let userName = localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
                    JSON.parse(localStorage.getItem('userInfo')).name : ''
                this.setState({
                    userName: userName
                })
                http.post('/project/getConfig', {
                    key: "fdd_auth"
                }).then(data => {
                    if (data.data) {
                        for (let i in data.data) {
                            if (i == userName) {
                                for (let j in data.data[i]) {
                                    if (j == "name_zh") {
                                        userName_zh = data.data[i][j]
                                    }
                                    if (j == "visable") {
                                        for (let z in data.data[i][j]) {
                                            if (z == "介质") {
                                                media = data.data[i][j][z]
                                            } else if (z == "位置") {
                                                position = data.data[i][j][z]
                                            } else if (z == "类型") {
                                                FaulType = data.data[i][j][z]
                                            } else {
                                                console.log("暂未支持介质、位置、类型之外的配置")
                                            }
                                        }
                                    }
                                }
                                this.setState({
                                    media: media,
                                    FaulType: FaulType,
                                    position: position,
                                    userName_zh: userName_zh
                                })
                            }

                        }
                        //从报警统计页面跳转过来携带的参数，从本地缓存中读取，初始化加载。
                        let selectFaultType = localStorage.getItem('selectFaultType')
                        if (selectFaultType && selectFaultType != "") {
                            if (document.getElementById(selectFaultType)) {
                                document.getElementById(selectFaultType).style.backgroundColor = 'rgb(46,162,248)'
                                let view = []
                                view[0] = selectFaultType
                                this.setState({
                                    view: view,
                                    StartTime: localStorage.getItem('selectStartTime'),
                                    EndTime: localStorage.getItem('selectEndTime')
                                })
                                this.search()
                            }
                        } else {
                            this.monthTime()
                        }
                    }
                }).catch(
                    err => {
                        console.log("读取后台配置失败")
                    }
                )
                //获取手下人员名单
                http.post('/fdd/getGroupMembersOfAdmin', {
                    admin: userName
                }).then(data => {
                    if (data.err != 1) {
                        this.setState({
                            worker: data.data
                        })
                    }
                }).catch(
                    err => {
                        console.log("接口请求失败")
                    }
                )
                //获取工单类型列表
                http.get('/fdd/getWorkOrderTypeList' + (language == 'en' ? '?lan=en' : '')).then(res => {
                    if (res.err == 0) {
                        this.setState({
                            workOrderTypeList: res.data
                        })
                    }
                }).catch(err => {
                    console.log(err.message)
                })

                this.getUpdateFdd(userName)
            }
            return true
        } else {
            if (nextState == this.state) {
                return false
            } else {
                return true
            }
        }
    }

    getUpdateFdd = (userName) => {
        let _this = this
        http.post('/fdd/getWorkOrderUpdate', {
            userName: userName
        }).then(
            data => {
                if (!data.err) {
                    this.setState({
                        updateFddList: data.data
                    })
                }

                timer = setTimeout(function () {
                    _this.getUpdateFdd(userName)
                }, 1000 * 60)
            }
        ).catch(
            err => {
                timer = setTimeout(function () {
                    _this.getUpdateFdd(userName)
                }, 1000 * 60)
            }
        )
    }

    componentWillUnmount() {
        clearTimeout(timer)
    }

    //获取报警介质后台配置
    mediaSelection() {
        return this.state.media.map((item, index) => {
            return (<Button className={s['select-btn']} id={item} key={index} onClick={() => this.btnMediumClick(item)}>{item}</Button>)
        })
    }

    //获取报警位置后台配置
    positionSelection() {
        return this.state.position.map((item, index) => {
            return (<Button className={s['select-btn']} id={item} key={index} onClick={() => this.btnPositionClick(item)}>{item}</Button>)
        })
    }

    //获取报警类型后台配置
    typeSelection() {
        return this.state.FaulType.map((item, index) => {
            if (language == 'en') {
                let type_en = ""
                if (item == '通讯故障') {
                    type_en = 'Communication Failure'
                } else if (item == '安全故障') {
                    type_en = 'Security Fault'
                } else if (item == '效率报警') {
                    type_en = 'Efficiency Alarm'
                } else if (item == '跑冒滴漏') {
                    type_en = 'Running, Emission, Dripping and Leakage'
                } else if (item == '硬件故障') {
                    type_en = 'Hardware Failure'
                } else if (item == '工单') {
                    type_en = 'Work Order'
                } else {
                    type_en = item
                }
                return (<Button className={s['select-btn']} id={item} key={index} onClick={() => this.btnCategoryClick(item)}>{type_en}</Button>)
            } else {
                return (<Button className={s['select-btn']} id={item} key={index} onClick={() => this.btnCategoryClick(item)}>{item}</Button>)
            }
        })
    }

    //获取人员列表
    getWorkerOptions() {
        const { worker, userName } = this.state
        if (worker && worker.length > 0) {
            return worker.map((item, index) => {
                return <Option key={index} value={item.name_en}>{item.name_en} ({item.name_zh})</Option>
            })
        } else {
            return <Option key={1} value={userName}>{userName}</Option>
        }
    }

    //报警介质数组选取
    btnMediumClick(name) {
        let medium = this.state.medium
        let flag = 0, sign
        for (let i = 0; i < medium.length; i++) {
            if (name == medium[i]) {
                flag = 1
                sign = i
            }
        }
        if (flag == 0) {
            medium.push(name)
            document.getElementById(name).style.backgroundColor = 'rgb(46,162,248)'
            if (medium.length == this.state.media.length) {
                document.getElementById('Media').style.backgroundColor = 'rgb(46,162,248)'
            }
        } else {
            document.getElementById(name).style.backgroundColor = ''
            medium.splice(sign, 1)
            if (medium.length != this.state.media.length) {
                document.getElementById('Media').style.backgroundColor = ''
            }
        }
        this.setState({
            medium: medium
        })
    }

    //报警位置数组选取
    btnPositionClick(name) {
        let position2 = this.state.position2
        let flag = 0, sign
        for (let i = 0; i < position2.length; i++) {
            if (name == position2[i]) {
                flag = 1
                sign = i
            }
        }
        if (flag == 0) {
            position2.push(name)
            document.getElementById(name).style.backgroundColor = 'rgb(46,162,248)'
            if (position2.length == this.state.position.length) {
                document.getElementById('Position').style.backgroundColor = 'rgb(46,162,248)'
            }
        } else {
            document.getElementById(name).style.backgroundColor = ''
            position2.splice(sign, 1)
            if (position2.length != this.state.position.length) {
                document.getElementById('Position').style.backgroundColor = ''
            }
        }
        this.setState({
            position2: position2
        })
    }

    //报警类型数组选取
    btnCategoryClick(name) {
        let category = this.state.category
        let flag = 0, sign
        for (let i = 0; i < category.length; i++) {
            if (name == category[i]) {
                flag = 1
                sign = i
            }
        }
        if (flag == 0) {
            category.push(name)
            document.getElementById(name).style.backgroundColor = 'rgb(46,162,248)'
            if (category.length == this.state.FaulType.length) {
                document.getElementById('Type').style.backgroundColor = 'rgb(46,162,248)'
            }
        } else {
            document.getElementById(name).style.backgroundColor = ''
            category.splice(sign, 1)
            if (category.length != this.state.FaulType.length) {
                document.getElementById('Type').style.backgroundColor = ''
            }
        }
        this.setState({
            category: category
        })
    }

    //报警状态数组选取
    btnClick2(id) {
        let status = this.state.status
        let flag = 0, sign
        for (let i = 0; i < status.length; i++) {
            if (id == status[i]) {
                flag = 1
                sign = i
            }
        }
        if (flag == 0) {
            status.push(id)
            document.getElementById(id).style.backgroundColor = 'rgb(46,162,248)'
            if (status.length == 6) {
                document.getElementById("6").style.backgroundColor = 'rgb(46,162,248)'
            }
        } else {
            document.getElementById(id).style.backgroundColor = ''
            status.splice(sign, 1)
            if (status.length != 6) {
                document.getElementById("6").style.backgroundColor = ''
            }
        }
        this.setState({
            status: status
        })
    }

    //时间选择框选择时间范围
    changeTime(value) {
        let StartTime = moment(value[0]).format(TIME_FORMAT)
        let EndTime = moment(value[1]).format(TIME_FORMAT)
        this.setState({
            StartTime: StartTime,
            EndTime: EndTime
        })
    }

    changeEstimatedTime(value) {
        let Time = moment(value).format(TIME_FORMAT)
        this.setState({
            estimatedTime: Time,
        })
    }

    //今日时间选择
    todayTime() {
        let StartTime = moment().startOf('day').format(TIME_FORMAT)
        let EndTime = moment().endOf('day').format(TIME_FORMAT)
        this.setState({
            StartTime: StartTime,
            EndTime: EndTime
        })
        this.search(StartTime, EndTime)
    }

    //本周时间选择
    weekTime() {
        let StartTime = moment().startOf('week').format(TIME_FORMAT)
        let EndTime = moment().endOf('day').format(TIME_FORMAT)
        this.setState({
            StartTime: StartTime,
            EndTime: EndTime
        })
        this.search(StartTime, EndTime)
    }

    //近一月
    oneMonthTime() {
        let StartTime = moment().subtract(1, 'month').format(TIME_FORMAT)
        let EndTime = moment().endOf('day').format(TIME_FORMAT)
        this.setState({
            StartTime: StartTime,
            EndTime: EndTime
        })
        this.search(StartTime, EndTime)
    }

    //本月时间选择
    monthTime() {
        let StartTime = moment().startOf('month').format(TIME_FORMAT)
        let EndTime = moment().endOf('day').format(TIME_FORMAT)
        this.setState({
            StartTime: StartTime,
            EndTime: EndTime
        })
        this.search(StartTime, EndTime)
    }

    //仅查询我处理的故障(默认查最近一年的时间)
    onlyMine() {
        let StartTime = moment().subtract(1, 'year').format(TIME_FORMAT)
        let EndTime = moment().format(TIME_FORMAT)
        this.setState({
            StartTime: StartTime,
            EndTime: EndTime
        })
        this.search(StartTime, EndTime, "Mine")
    }

    //查询函数
    search(start, end, flag) {
        this.setState({
            loading: true,
            selectFaultInfo: {}
        })
        let startTime, endTime
        if (start && end) {
            startTime = start
            endTime = end
        } else {
            startTime = this.state.StartTime
            endTime = this.state.EndTime
        }
        http.post('/fdd/query', {
            category: this.state.category,  // 类型 （如果对类型无筛选要求则无需传入）
            medium: this.state.medium,  // 介质  （如果对介质无筛选要求则无需传入）
            position: this.state.position2,
            status: this.state.status,
            startTime: startTime,
            endTime: endTime,
            userName: this.state.userName,
            keyword: this.state.searchValue != "" ? this.state.searchValue : null,
            lan: language
        }).then(
            res => {
                if (res.err == 0) {
                    res.data.sort((a, b) => a.id - b.id)
                    if (flag == "Mine") {
                        let myData = []
                        res.data.map(item => {
                            if (item.mine == 1) {
                                myData.push(item)
                            }
                        })
                        this.setState({
                            TableData: myData,
                            loading: false
                        })
                    } else {
                        this.setState({
                            TableData: res.data,
                            loading: false
                        })
                    }
                } else {
                    this.setState({
                        loading: false
                    })
                    Modal.error({
                        title: language === 'en' ? 'Work order query failed' : '工单查询失败',
                        content: res.msg
                    });
                }
            }
        ).catch(
            err => {
                this.setState({
                    loading: false
                })
                console.log("工单查询接口请求失败！")
            }
        )
    }

    //报警状态全部点击切换样式
    allStatusBtnClick() {
        if (document.getElementById("6").style.backgroundColor != 'rgb(46, 162, 248)') {
            document.getElementById("0").style.backgroundColor = 'rgb(46,162,248)'
            document.getElementById("1").style.backgroundColor = 'rgb(46,162,248)'
            document.getElementById("2").style.backgroundColor = 'rgb(46,162,248)'
            document.getElementById("3").style.backgroundColor = 'rgb(46,162,248)'
            document.getElementById("4").style.backgroundColor = 'rgb(46,162,248)'
            document.getElementById("5").style.backgroundColor = 'rgb(46,162,248)'
            document.getElementById("6").style.backgroundColor = 'rgb(46,162,248)'
            this.setState({
                status: [0, 1, 2, 3, 4, 5]
            })
        } else {
            document.getElementById("0").style.backgroundColor = ''
            document.getElementById("1").style.backgroundColor = ''
            document.getElementById("2").style.backgroundColor = ''
            document.getElementById("3").style.backgroundColor = ''
            document.getElementById("4").style.backgroundColor = ''
            document.getElementById("5").style.backgroundColor = ''
            document.getElementById("6").style.backgroundColor = ''
            this.setState({
                status: []
            })
        }
    }

    allClick(value) {
        let ctx, arr
        if (value == "Position") {
            let position2 = this.state.position2
            ctx = document.getElementById("Position")
            arr = this.state.position
            if (ctx.style.backgroundColor != 'rgb(46, 162, 248)') {
                ctx.style.backgroundColor = 'rgb(46,162,248)'
                arr.map((item, index) => {
                    if (position2.indexOf(item) == -1) {
                        position2.push(item)
                        document.getElementById(item).style.backgroundColor = 'rgb(46,162,248)'
                    }
                })
            } else {
                ctx.style.backgroundColor = ''
                arr.map((item, index) => {
                    if (position2.indexOf(item) != -1) {
                        for (let i = 0; i < position2.length; i++) {
                            if (item == position2[i]) {
                                position2.splice(i, 1)
                                document.getElementById(item).style.backgroundColor = ''
                                break
                            }
                        }
                    }
                })
            }
            this.setState({
                position2: position2
            })
        } else if (value == "Type") {
            let category = this.state.category
            ctx = document.getElementById("Type")
            arr = this.state.FaulType
            if (ctx.style.backgroundColor != 'rgb(46, 162, 248)') {
                ctx.style.backgroundColor = 'rgb(46,162,248)'
                arr.map((item, index) => {
                    if (category.indexOf(item) == -1) {
                        category.push(item)
                        document.getElementById(item).style.backgroundColor = 'rgb(46,162,248)'
                    }
                })
            } else {
                ctx.style.backgroundColor = ''
                arr.map((item, index) => {
                    if (category.indexOf(item) != -1) {
                        for (let i = 0; i < category.length; i++) {
                            if (item == category[i]) {
                                category.splice(i, 1)
                                document.getElementById(item).style.backgroundColor = ''
                                break
                            }
                        }
                    }
                })
            }
            this.setState({
                category: category
            })
        } else {
            let medium = this.state.medium
            ctx = document.getElementById("Media")
            arr = this.state.media
            if (ctx.style.backgroundColor != 'rgb(46, 162, 248)') {
                ctx.style.backgroundColor = 'rgb(46,162,248)'
                arr.map((item, index) => {
                    if (medium.indexOf(item) == -1) {
                        medium.push(item)
                        document.getElementById(item).style.backgroundColor = 'rgb(46,162,248)'
                    }
                })
            } else {
                ctx.style.backgroundColor = ''
                arr.map((item, index) => {
                    if (medium.indexOf(item) != -1) {
                        for (let i = 0; i < medium.length; i++) {
                            if (item == medium[i]) {
                                medium.splice(i, 1)
                                document.getElementById(item).style.backgroundColor = ''
                                break
                            }
                        }
                    }
                })
            }
            this.setState({
                medium: medium
            })
        }
    }

    //更改处理人
    handleChange(name) {
        this.setState({
            SelectWorker: name
        })
    }

    //选择处理人模态框
    changeWorkerModal(record, text) {
        if (document.getElementById("reason")) {
            document.getElementById("reason").value = ""
        }
        if (document.getElementById("summp")) {
            document.getElementById("summp").value = ""
        }
        this.setState({
            SelectStatus: record.status,
            SelectRecord: record,
        });
        if (text == "fenpai") {
            this.changeEstimatedTime(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
            this.setState({
                fenPaiVisible: true
            });
        } else if (text == "zanting") {
            this.setState({
                zanTingVisible: true
            });
        } else if (text == "wancheng") {
            this.setState({
                wanChengVisible: true
            });
        }
    }

    handleCancel() {
        this.setState({
            fenPaiVisible: false,
            zanTingVisible: false,
            wanChengVisible: false,
        });
    }

    showCreateWorkOder() {
        this.setState({
            SelectWorker: '',
            estimatedTime: '',
            workOderVisible: true
        })
    }

    handleWorkOderCancel() {
        this.setState({
            workOderVisible: false
        });
    }
    handleModifyWorkOderCancel() {
        this.setState({
            modifyWorkOderVisible: false
        });
    }

    handleScheduleCancel() {
        this.setState({
            scheduleVisible: false
        });
    }

    //点击操作按钮，执行故障状态更改
    changeFaultStatusBtn(record, status, targetStatus) {
        this.setState({
            SelectRecord: record,
        });
        if (targetStatus == 5) {
            confirm({
                title: language == 'en' ? 'Do you want to terminate this work order?' : '是否要将此工单终止？',
                content: language == 'en' ? 'After confirming there are no errors, click "Confirm" to proceed.' : '确认无误后,点击确认即可',
                onOk: () => {
                    this.changeFaultStatus(targetStatus)
                },
                onCancel() {

                },
            })
        } else {
            if (this.state.SelectStatus == "待分派") {
                if (this.state.SelectWorker == "" || this.state.estimatedTime == "") {
                    if (targetStatus == 2 && record.allowSubmit == 1) {
                        confirm({
                            title: language == 'en' ? 'Do you want to submit the work order processing result to the administrator for review?' : '是否将工单处理结果提交给管理员审核?',
                            content: language == 'en' ? 'After confirming there are no errors, click "Confirm" to proceed.' : '确认无误后,点击确认即可',
                            onOk: () => {
                                this.changeFaultStatus(targetStatus)
                            },
                            onCancel() {

                            },
                        });
                    } else if (record.allowAdminSubmit == 1) {
                        if (document.getElementById("summp").value == "") {
                            Modal.warning({
                                title: language == 'en' ? 'Please first fill in the summary of the submitted task.' : "请先填写提交任务的总结"
                            })
                        } else {
                            confirm({
                                title: language == 'en' ? 'Do you want to directly submit the work order as completed?' : `是否将工单直接提交完结?`,
                                content: language == 'en' ? 'After confirming there are no errors, click "Confirm" to proceed.' : '确认无误后,点击确认即可',
                                onOk: () => {
                                    this.changeFaultStatus(3)
                                },
                                onCancel() {

                                },
                            });
                        }
                    } else {
                        Modal.warning({
                            title: language == 'en' ? 'Please first select the staff member to whom the task will be assigned and the estimated time to complete the task.' : "请先选择需要分派任务的工作人员和预计结束处理时间"
                        })
                    }
                } else {
                    confirm({
                        title: language == 'en' ? `Do you want to assign the work order task to ${this.state.SelectWorker}?` : `是否将工单任务分派给"${this.state.SelectWorker}"?`,
                        content: language == 'en' ? 'After confirming there are no errors, click "Confirm" to proceed.' : '确认无误后,点击确认即可',
                        onOk: () => {
                            this.changeFaultStatus(targetStatus)
                        },
                        onCancel() {

                        },
                    });
                }
            } else {
                if (targetStatus == 4) {
                    if (document.getElementById("reason").value == "") {
                        Modal.warning({
                            title: language == 'en' ? 'Please first fill in the reason for pausing the task.' : "请先填写暂停任务的原因"
                        })
                    } else {
                        confirm({
                            title: language == 'en' ? 'Do you want to pause this work order task?' : '是否要将此工单任务暂停?',
                            content: language == 'en' ? 'After confirming there are no errors, click "Confirm" to proceed.' : '确认无误后,点击确认即可',
                            onOk: () => {
                                this.changeFaultStatus(targetStatus)
                            },
                            onCancel() {

                            },
                        });
                    }
                } else if (targetStatus == 2) {
                    if (document.getElementById("summp").value == "") {
                        Modal.warning({
                            title: language == 'en' ? 'Please first fill in the summary of the submitted task.' : "请先填写提交任务的总结"
                        })
                    } else {
                        if (record.allowAdminSubmit == 1) {
                            confirm({
                                title: language == 'en' ? 'Do you want to directly submit the work order as completed?' : '是否将工单直接提交完结?',
                                content: language == 'en' ? 'After confirming there are no errors, click "Confirm" to proceed.' : '确认无误后,点击确认即可',
                                onOk: () => {
                                    this.changeFaultStatus(3)
                                },
                                onCancel() {

                                },
                            });
                        } else {
                            confirm({
                                title: language == 'en' ? 'Do you want to submit the work order processing result to the administrator for review?' : '是否将工单处理结果提交给管理员审核?',
                                content: language == 'en' ? 'After confirming there are no errors, click "Confirm" to proceed.' : '确认无误后,点击确认即可',
                                onOk: () => {
                                    this.changeFaultStatus(targetStatus)
                                },
                                onCancel() {

                                },
                            });
                        }
                    }
                } else {
                    confirm({
                        title: language == 'en' ? 'Do you want to change the status of this work order to "Completed"?' : '是否要将此工单修改为完结状态？',
                        content: language == 'en' ? 'After confirming there are no errors, click "Confirm" to proceed.' : '确认无误后,点击确认即可',
                        onOk: () => {
                            this.changeFaultStatus(targetStatus)
                        },
                        onCancel() {

                        },
                    });
                }

            }

        }

    }

    //处理任务
    changeFaultStatus(targetStatus) {
        if (targetStatus == 1) {
            if (this.state.SelectStatus == "暂停") {
                http.post('/fdd/processFault', {
                    userName: this.state.userName,  // 用户名
                    targetStatus: targetStatus, // 目标状态  1-分派（工单在进行中）；2-完成待审核；3-已审核；4-等待，暂停
                    orderId: this.state.SelectRecord.id,  // 工单id
                    opType: 0   // 操作类型 0-修改状态；1-修改预计完成时间
                }).then(
                    res => {
                        if (res.err && res.err == 1) {
                            Modal.warning({
                                title: res.msg
                            })
                        } else {
                            this.search()
                        }
                    }
                ).catch(
                    err => {

                    }
                )
            } else {
                http.post('/fdd/processFault', {
                    userName: this.state.userName,  // 用户名
                    targetStatus: targetStatus, // 目标状态  1-分派（工单在进行中）；2-完成待审核；3-已审核；4-等待，暂停
                    orderId: this.state.SelectRecord.id,  // 工单id
                    processor: this.state.SelectWorker,  // 处理人 （只在分派任务时传入，其他操作无需传入）
                    estimatedTime: this.state.estimatedTime, // 预计完成时间（只有分派任务和修改预计完成时间时传入）
                    opType: 0   // 操作类型 0-修改状态；1-修改预计完成时间
                }).then(
                    res => {
                        if (res.err && res.err == 1) {
                            Modal.warning({
                                title: res.msg
                            })
                        } else {
                            this.search()
                        }
                    }
                ).catch(
                    err => {

                    }
                )
            }

        } else if (targetStatus == 4) {
            let reason = document.getElementById("reason").value
            http.post('/fdd/processFault', {
                userName: this.state.userName,  // 用户名
                targetStatus: targetStatus, // 目标状态  1-分派（工单在进行中）；2-完成待审核；3-已审核；4-等待，暂停
                orderId: this.state.SelectRecord.id,  // 工单id
                reason: reason,  // 故障修改为等待中时需要传入的原因字段，只在修改为等待中时需要传入
                opType: 0   // 操作类型 0-修改状态；1-修改预计完成时间
            }).then(
                res => {
                    if (res.err && res.err == 1) {
                        Modal.warning({
                            title: res.msg
                        })
                    } else {
                        this.search()
                    }
                }
            ).catch(
                err => {

                }
            )
        } else if (targetStatus == 2) {
            let summp = document.getElementById("summp").value
            http.post('/fdd/processFault', {
                userName: this.state.userName,  // 用户名
                targetStatus: targetStatus, // 目标状态  1-分派（工单在进行中）；2-完成待审核；3-已审核；4-等待，暂停
                orderId: this.state.SelectRecord.id,  // 工单id
                reason: summp,
                opType: 0   // 操作类型 0-修改状态；1-修改预计完成时间
            }).then(
                res => {
                    if (res.err && res.err == 1) {
                        Modal.warning({
                            title: res.msg
                        })
                    } else {
                        this.search()
                    }
                }
            ).catch(
                err => {

                }
            )
        } else {
            if (targetStatus == 3 && this.state.SelectRecord.allowAdminSubmit == 1 && this.state.SelectRecord.status != "待确认") {
                http.post('/fdd/processFault', {
                    userName: this.state.userName,  // 用户名
                    targetStatus: targetStatus, // 目标状态  1-分派（工单在进行中）；2-完成待审核；3-已审核；4-等待，暂停
                    orderId: this.state.SelectRecord.id,  // 工单id
                    reason: document.getElementById("summp").value,
                    opType: 0   // 操作类型 0-修改状态；1-修改预计完成时间
                }).then(
                    res => {
                        if (res.err && res.err == 1) {
                            Modal.warning({
                                title: res.msg
                            })
                        } else {
                            this.search()
                        }
                    }
                ).catch(
                    err => {

                    }
                )
            } else {
                http.post('/fdd/processFault', {
                    userName: this.state.userName,  // 用户名
                    targetStatus: targetStatus, // 目标状态  1-分派（工单在进行中）；2-完成待审核；3-已审核；4-等待，暂停
                    orderId: this.state.SelectRecord.id,  // 工单id
                    opType: 0   // 操作类型 0-修改状态；1-修改预计完成时间
                }).then(
                    res => {
                        if (res.err && res.err == 1) {
                            Modal.warning({
                                title: res.msg
                            })
                        } else {
                            this.search()
                        }
                    }
                ).catch(
                    err => {

                    }
                )
            }
        }
        this.handleCancel()
    }

    disabledDate(current) {
        // Can not select days before today and today
        return current && current < moment().endOf('day');
    }

    saveFormRef(form) {
        this.form = form;
    }
    //鱼骨条    
    scheduleModal(text, id) {
        this.setState({
            stepLoading: true,
            scheduleVisible: true
        })
        let stepStyleStatus, scheduleNumber
        http.post('/fdd/flow', {
            orderId: id
        }).then(
            data => {
                if (data.data.flow[2].status == 4) {
                    stepStyleStatus = false
                    if (text == "待分派") {
                        scheduleNumber = 0
                    } else if (text == "进行中") {
                        scheduleNumber = 1
                    } else if (text == "暂停") {
                        scheduleNumber = 2
                    } else if (text == "待确认") {
                        scheduleNumber = 3
                    } else {
                        scheduleNumber = 4
                    }
                } else {
                    stepStyleStatus = true
                    if (text == "待分派") {
                        scheduleNumber = 0
                    } else if (text == "进行中") {
                        scheduleNumber = 1
                    } else if (text == "待确认") {
                        scheduleNumber = 2
                    } else {
                        scheduleNumber = 3
                    }
                }
                this.setState({
                    stepStyle: stepStyleStatus,
                    scheduleNumber: scheduleNumber,
                    stepLoading: false,
                    handleInfo: data.data.flow
                })
            }
        )
    }

    getHandleInfo(status) {
        let handleInfo = this.state.handleInfo
        return handleInfo.map((item) => {
            if (item.status == status) {
                if (item.time) {
                    return <div style={{ marginBottom: 5 }}>
                        <div>{item.time}</div>
                        <div>操作人员：{item.name}</div>
                    </div>
                }
            }
        })
    }

    faultEnable(orderId, enable) {
        confirm({
            title: enable == 0 ? language == 'en' ? 'Do you want to temporarily freeze this work order?' : '是否要将此工单暂时冻结？' : language == 'en' ? 'Do you want to unfreeze this work order?' : '是否要将此工单解除冻结？',
            content: language == 'en' ? 'After confirming there are no errors, click "Confirm" to proceed.' : '确认无误后,点击确认即可',
            onOk: () => {
                http.post('/fdd/enableFault', {
                    orderId: orderId,
                    enable: enable,
                    userName: JSON.parse(localStorage.getItem('userInfo')).name
                }).then((res) => {
                    if (res.err && res.err == 1) {
                        Modal.warning({
                            title: res.msg
                        })
                    } else {
                        setTimeout(() => {
                            this.search()
                        }, 1000)
                    }
                })
            },
            onCancel() {

            },
        });
    }

    //存储选中的故障信息
    faultInfo(record) {
        this.setState({
            selectFaultInfo: record
        })
    }

    fddExportInfo() {
        // http.post('/fdd/export', {
        //     category: this.state.category,
        //     medium: this.state.medium,
        //     position: this.state.position2,
        //     status: this.state.status,
        //     startTime: this.state.StartTime,
        //     endTime: this.state.EndTime,
        //     userName: this.state.userName
        // }).then(
        //     res => {
        //         if (res.err == 0) {
        //             downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${res.data}`)
        //         } else {
        //             message.warning(res.msg)
        //         }
        //     }
        // )
        const { TableData } = this.state
        if (TableData.length == 0) {
            Modal.info({
                title: language == 'en' ? 'Tip' : '提示',
                content: language == 'en' ? 'There is no work order data in the currently displayed list.' : '当前显示列表中无工单数据'
            })
            return
        }
        Modal.confirm({
            title: language == 'en' ? 'Do you want to export all the work order contents displayed in the list?' : '是否导出显示列表中的所有工单内容？',
            content: (
                <div style={{ marginTop: 20 }}>
                    <div style={{ marginBottom: 10 }}>
                        <Checkbox id='exportAllComment' defaultChecked={true}>{language == 'en' ? 'Export Comments' : '导出评论'}</Checkbox>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <Checkbox id='exportAllFlow' defaultChecked={false}>{language == 'en' ? 'Export Author Information' : '导出作者信息'}</Checkbox>
                    </div>
                    <div>
                        <Checkbox id='exportAllByWord' defaultChecked={true}>{language == 'en' ? 'Export in Word document format' : '以word文档格式导出'}</Checkbox>
                    </div>
                </div>
            ),
            onOk: () => {
                let orderIdList = TableData.map(item => {
                    return item.id
                })

                http.post('/fdd/MultiExportInPdf', {
                    orderIdList: orderIdList,
                    projectName: localStorage.getItem('projectNameInCloud'),
                    showComment: document.getElementById('exportAllComment').checked ? 1 : 0, //是否带评论区 （默认带）
                    showFlow: document.getElementById('exportAllFlow').checked ? 1 : 0,    //是否带工单流 （默认不带）
                    toWord: document.getElementById('exportAllByWord').checked ? 1 : 0    //是否导出成.docx
                }).then(res => {
                    if (res.err == 0) {
                        downloadUrl(appConfig.serverUrl + '/static/temp/' + res.data)
                    } else {
                        Modal.error({
                            title: getText('tip'),
                            content: res.msg
                        })
                    }
                }).catch(err => {
                    Modal.error({
                        title: getText('tip'),
                        content: err.message
                    })
                })
            }
        })
    }

    changeFaultInfo = (record) => {
        this.setState({
            selectFaultInfo: record,
            modifyWorkOderVisible: true
        })
    }

    //增加一次工单访问记录
    addVisit = (id) => {
        http.post('/fdd/addVisit', {
            userName: this.state.userName,
            orderId: id
        }).then(res => {
            if (res.err == 0) {
                http.post('/fdd/getWorkOrderUpdate', {
                    userName: this.state.userName
                }).then(
                    data => {
                        if (!data.err) {
                            this.setState({
                                updateFddList: data.data
                            })
                            store.dispatch(updateNum(data.data.length))
                        }
                    }
                ).catch(
                    err => {

                    }
                )
            } else {
                console.log("记录一次访问工单，接口请求报错" + res.msg)
            }
        }).catch(err => {
            console.log("记录一次访问工单，接口请求失败" + err)
        })
    }

    showOrderFlow = (id) => {
        //增加一次访问记录
        this.addVisit(id)
        this.setState(() => {
            return {
                orderId: id
            }
        }, () => {
            this.setState({
                orderFlowVisible: true
            })
        })
    }

    closeOrderFlow = () => {
        this.setState({
            orderFlowVisible: false
        })
    }

    searchByKeyword = (e) => {
        this.setState({
            searchValue: e.target.value
        }, this.search())
    }

    changeValue = (e) => {
        this.setState({
            searchValue: e.target.value
        })
    }

    //全文查询函数
    searchAllStr() {
        this.setState({
            loading: true,
            selectFaultInfo: {}
        })

        const { category, medium, position2, status, StartTime, EndTime, userName, searchValue } = this.state

        http.post('/fdd/query', {
            category: category,  // 类型 （如果对类型无筛选要求则无需传入）
            medium: medium,  // 介质  （如果对介质无筛选要求则无需传入）
            position: position2,
            status: status,
            startTime: StartTime,
            endTime: EndTime,
            userName: userName,
            keyword: searchValue != "" ? searchValue : null,
            globalSearch: 1,
            lan: language
        }).then(
            res => {
                if (res.err == 0) {
                    res.data.sort((a, b) => a.id - b.id)
                    this.setState({
                        TableData: res.data,
                        loading: false
                    })
                } else {
                    this.setState({
                        loading: false,
                        TableData: []
                    })
                    Modal.error({
                        title: language == 'en' ? 'Tip' : '提示',
                        content: res.msg
                    })
                }
            }
        ).catch(
            err => {
                this.setState({
                    loading: false,
                    TableData: []
                })
                Modal.error({
                    title: language == 'en' ? 'Tip' : '提示',
                    content: language == 'en' ? 'The network request to the on-site server failed.' : '就地服务器网络请求失败'
                })
            }
        )
    }

    onlyUpdate = () => {
        this.setState({
            loading: true,
            selectFaultInfo: {}
        })

        http.post('/fdd/queryUnreadWorkOrder', {
            userName: this.state.userName,
            hideTopped: 1
        }).then(res => {
            if (res.err == 0) {
                res.data.sort((a, b) => a.id - b.id)
                this.setState({
                    TableData: res.data,
                    loading: false
                })
            } else {
                this.setState({
                    loading: false,
                    TableData: []
                })
                Modal.error({
                    title: language === 'en' ? 'Unread work order query failed' : '未读工单查询失败',
                    content: res.msg
                });
            }
        }).catch(err => {
            this.setState({
                loading: false,
                TableData: []
            })
            Modal.error({
                title: getText('tip'),
                content: err.message
            })
        })

    }

    render() {
        let handleInfo = this.state.handleInfo
        const { loading } = this.state
        return (
            <Modal
                visible={this.props.visible}
                onCancel={this.props.onCancel}
                width={1800}
                footer={null}
                maskClosable={false}
            >
                <div className={s['container']}>
                    <div className={s['header']}>
                        {
                            this.state.media && this.state.media[0] == undefined ?
                                ""
                                :
                                <div style={{ marginBottom: 15, height: 30 }}>
                                    <span>{getText('mediaSelection')} </span>
                                    <Button className={s['select-btn']} id="Media" onClick={() => this.allClick("Media")}>{getText('all')}</Button>
                                    {this.mediaSelection()}
                                </div>
                        }
                        {
                            this.state.FaulType && this.state.FaulType[0] == undefined ?
                                ""
                                :
                                <div style={{ marginBottom: 15, height: 30 }}>
                                    <span>{getText('workOrderSelection')} </span>
                                    <Button className={s['select-btn']} id="Type" onClick={() => this.allClick("Type")}>{getText('all')}</Button>
                                    {this.typeSelection()}
                                </div>
                        }
                        {
                            this.state.position && this.state.position[0] == undefined ?
                                ""
                                :
                                <div style={{ marginBottom: 15, height: 30 }}>
                                    <span>{getText('positionSelection')} </span>
                                    <Button className={s['select-btn']} id="Position" onClick={() => this.allClick("Position")}>{getText('all')}</Button>
                                    {this.positionSelection()}
                                </div>
                        }
                        <div style={{ marginBottom: 15 }}>
                            <span>{getText('workOrderStatus')} </span>
                            <Button className={s['select-btn']} id="6" onClick={this.allStatusBtnClick}>{getText('all')}</Button>
                            <Button className={s['select-btn']} id="0" onClick={() => this.btnClick2(0)}>{getText('pendingAssignment')}</Button>
                            <Button className={s['select-btn']} id="1" onClick={() => this.btnClick2(1)}>{getText('assigned')}</Button>
                            <Button className={s['select-btn']} id="2" onClick={() => this.btnClick2(2)}>{getText('submitted')}</Button>
                            <Button className={s['select-btn']} id="3" onClick={() => this.btnClick2(3)}>{getText('reviewed')}</Button>
                            <Button className={s['select-btn']} id="4" onClick={() => this.btnClick2(4)}>{getText('stopped')}</Button>
                            <Button className={s['select-btn']} id="5" onClick={() => this.btnClick2(5)}>{getText('terminated')}</Button>
                        </div>
                        <div className={s['button-container']}>
                            <span>{getText('workOrderTime')} </span>
                            <RangePicker
                                allowClear={false}
                                format={TIME_FORMAT}
                                showTime={{ format: 'HH:mm:00' }}
                                placeholder={[getText('startTime'), getText('endTime')]}
                                style={{ width: 350, marginRight: 10 }}
                                onChange={this.changeTime}
                                value={[moment(this.state.StartTime), moment(this.state.EndTime)]}
                            />
                            <Input value={this.state.searchValue} style={{ width: 150, marginRight: 10 }} placeholder={getText('pleaseEnterKeyword')} onChange={this.changeValue} onPressEnter={this.searchByKeyword} />
                            <Button disabled={loading} className={s['select-btn']} onClick={this.search}>{getText('query')}</Button>
                            <Button disabled={loading} className={s['select-btn']} onClick={this.searchAllStr}>{getText('fullTextSearch')}</Button>
                            <Button disabled={loading} className={s['select-btn']} onClick={this.todayTime}>{getText('today')}</Button>
                            <Button disabled={loading} className={s['select-btn']} onClick={this.weekTime}>{getText('thisWeek')}</Button>
                            <Button disabled={loading} className={s['select-btn']} onClick={this.monthTime}>{getText('thisMonth')}</Button>
                            <Button disabled={loading} className={s['select-btn']} onClick={this.oneMonthTime}>{getText('lastMonth')}</Button>
                            <Button disabled={loading} className={s['select-btn']} onClick={this.onlyMine}>{getText('onlyMine')}</Button>
                            <Button disabled={loading} className={s['select-btn']} onClick={this.onlyUpdate}>{getText('onlyUpdates')}</Button>
                            <Button disabled={loading} className={s['select-btn']} style={{ float: 'right' }} onClick={this.fddExportInfo}>{getText('export')}</Button>
                            <Button disabled={loading} className={s['select-btn']} style={{ float: 'right', backgroundColor: '#3399CC' }} onClick={this.showCreateWorkOder}>{getText('createWorkOrder')}</Button>
                        </div>
                    </div>
                    <div className={s['table-content']}>
                        <FaultTable
                            data={this.state.TableData}
                            loading={loading}
                            changeFaultInfo={this.changeFaultInfo}
                            changeWorkerModal={this.changeWorkerModal}
                            changeFaultStatusBtn={this.changeFaultStatusBtn}
                            scheduleModal={this.scheduleModal}
                            faultEnable={this.faultEnable}
                            worker={this.state.worker}
                            faultInfo={this.faultInfo}
                            search={this.search}
                            showOrderFlow={this.showOrderFlow}
                            updateFddList={this.state.updateFddList}
                            searchValue={this.state.searchValue}
                        />
                    </div>
                    <Modal
                        title={getText('assignTask')}
                        visible={this.state.fenPaiVisible}
                        onCancel={this.handleCancel}
                        style={{ top: 200, width: 300 }}
                        maskClosable={false}
                        footer={null}
                    >
                        <div style={{ fontSize: 16, marginBottom: 20 }}>
                            <div>
                                <div style={{ marginBottom: 20 }}>
                                    {getText('selectWorkOrderProcessor')}
                                    <Select style={{ width: 195 }} onChange={this.handleChange}>
                                        {this.getWorkerOptions()}
                                    </Select>
                                </div>
                                <div>
                                    {getText('selectEstimatedCompletionTime')}
                                    <DatePicker
                                        showTime
                                        onChange={this.changeEstimatedTime}
                                        placeholder={getText('estimatedCompletionTimePlaceholder')}
                                        format={TIME_FORMAT}
                                        disabledDate={this.disabledDate}
                                        value={moment(this.state.estimatedTime)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: 16, marginBottom: 10 }}>
                            {getText('currentWorkOrderStatus')}{this.state.SelectStatus}
                            <Button className={s['Handle-Btn']} onClick={() => this.changeFaultStatusBtn(this.state.SelectRecord, getText('inProgressStatus'), 1)}>{getText('assign')}</Button>
                        </div>
                    </Modal>
                    <Modal
                        title={getText('submitTask')}
                        visible={this.state.wanChengVisible}
                        onCancel={this.handleCancel}
                        style={{ top: 200, width: 300 }}
                        maskClosable={false}
                        destroyOnClose={true}
                        footer={null}
                    >
                        <div style={{ fontSize: 16, marginBottom: 20 }}>
                            {getText('pleaseEnterTaskSummary')}<p></p><TextArea id="summp" placeholder={getText('pleaseEnterSummary')} autoSize={{ minRows: 3, maxRows: 6 }} />
                        </div>
                        <div style={{ fontSize: 16, marginBottom: 10 }}>
                            {getText('currentWorkOrderStatus')}{this.state.SelectStatus}
                            <Button className={s['Handle-Btn']} onClick={() => this.changeFaultStatusBtn(this.state.SelectRecord, getText('pendingConfirmation'), 2)}>{getText('submitForReview')}</Button>
                        </div>
                    </Modal>
                    <Modal
                        title={getText('pauseTask')}
                        visible={this.state.zanTingVisible}
                        onCancel={this.handleCancel}
                        style={{ top: 200, width: 300 }}
                        maskClosable={false}
                        destroyOnClose={true}
                        footer={null}
                    >
                        <div style={{ fontSize: 16, marginBottom: 20 }}>
                            {getText('pleaseEnterPauseReason')}<p></p><TextArea id="reason" placeholder={getText('pleaseEnterReason')} autoSize={{ minRows: 3, maxRows: 6 }} />
                        </div>
                        <div style={{ fontSize: 16, marginBottom: 10 }}>
                            {getText('currentWorkOrderStatus')}{this.state.SelectStatus}
                            <Button className={s['Handle-Btn']} onClick={() => this.changeFaultStatusBtn(this.state.SelectRecord, getText('paused'), 4)}>{getText('pause')}</Button>
                        </div>
                    </Modal>
                    <FormWorkOderWrap
                        todayTime={this.todayTime}
                        visible={this.state.workOderVisible}
                        onCancel={this.handleWorkOderCancel}
                        getWorkerOptions={this.getWorkerOptions}
                        handleChange={this.handleChange}
                        changeEstimatedTime={this.changeEstimatedTime}
                        disabledDate={this.disabledDate}
                        ref={this.saveFormRef}
                        userName={this.state.userName}
                        worker={this.state.worker}
                        StartTime={this.state.StartTime}
                        EndTime={this.state.EndTime}
                        search={this.search}
                        workOrderTypeList={this.state.workOrderTypeList}
                    />
                    <FormModifyWorkOderWrap
                        search={this.search}
                        visible={this.state.modifyWorkOderVisible}
                        onCancel={this.handleModifyWorkOderCancel}
                        getWorkerOptions={this.getWorkerOptions}
                        disabledDate={this.disabledDate}
                        ref={this.saveFormRef}
                        userName={this.state.userName}
                        selectFaultInfo={this.state.selectFaultInfo}
                        workOrderTypeList={this.state.workOrderTypeList}
                    />
                    <OrderFlowModalView
                        visible={this.state.orderFlowVisible}
                        handleCancel={this.closeOrderFlow}
                        id={this.state.orderId}
                        userName={this.state.userName}
                    />
                    <Modal
                        title={getText('workOrderTaskProgress')}
                        visible={this.state.scheduleVisible}
                        onCancel={this.handleScheduleCancel}
                        style={{ top: 200 }}
                        width={666}
                        maskClosable={false}
                        footer={null}
                    >
                        {
                            this.state.stepLoading ?
                                <div style={{ width: '100%', height: 70, textAlign: 'center', marginTop: '30px' }}>
                                    <Spin tip={getText('loadingProgressBar')} />
                                </div>
                                :
                                <div style={{ marginBottom: 10 }}>
                                    {
                                        this.state.stepStyle ?
                                            <div>
                                                <Steps current={Number(this.state.scheduleNumber)}>
                                                    <Step title={getText('pendingAssignmentStep')} description={getText('taskNotAssigned')} />
                                                    <Step title={getText('inProgressStep')} description={getText('taskInProgress')} />
                                                    <Step title={getText('pendingReviewStep')} description={getText('taskSubmittedWaitingReview')} />
                                                    <Step title={getText('confirmedStep')} description={getText('taskCompleted')} />
                                                </Steps>
                                                {
                                                    handleInfo != [] && handleInfo[0] != undefined ?
                                                        <div style={{ marginTop: 5 }}>
                                                            <div style={{ display: 'inline-block', width: 170 }}>{this.getHandleInfo(0)}</div>
                                                            <div style={{ display: 'inline-block', verticalAlign: 'top', width: 180 }}>{this.getHandleInfo(1)}</div>
                                                            <div style={{ display: 'inline-block', verticalAlign: 'top', width: 170 }}>{this.getHandleInfo(2)}</div>
                                                            <div style={{ display: 'inline-block', verticalAlign: 'top' }}>{this.getHandleInfo(3)}</div>
                                                        </div>
                                                        :
                                                        ''
                                                }
                                            </div>
                                            :
                                            <div>
                                                <Steps current={Number(this.state.scheduleNumber)}>
                                                    <Step title={getText('pendingAssignmentStep')} description={getText('taskNotAssigned')} />
                                                    <Step title={getText('inProgressStep')} description={getText('taskInProgress')} />
                                                    <Step title={getText('pausedStep')} description={getText('taskPaused')} />
                                                    <Step title={getText('pendingReviewStep')} description={getText('taskSubmittedWaitingReview')} />
                                                    <Step title={getText('confirmedStep')} description={getText('taskCompleted')} />
                                                </Steps>
                                                {
                                                    handleInfo != [] && handleInfo[0] != undefined ?
                                                        <div style={{ marginTop: 5 }}>
                                                            <div style={{ display: 'inline-block', width: 125 }}>{this.getHandleInfo(0)}</div>
                                                            <div style={{ display: 'inline-block', verticalAlign: 'top', width: 130 }}>{this.getHandleInfo(1)}</div>
                                                            <div style={{ display: 'inline-block', verticalAlign: 'top', width: 133 }}>{this.getHandleInfo(4)}</div>
                                                            <div style={{ display: 'inline-block', verticalAlign: 'top', width: 131 }}>{this.getHandleInfo(2)}</div>
                                                            <div style={{ display: 'inline-block', verticalAlign: 'top' }}>{this.getHandleInfo(3)}</div>
                                                        </div>
                                                        :
                                                        ''
                                                }
                                            </div>
                                    }
                                </div>
                        }

                    </Modal>
                </div>
            </Modal>
        )
    }
}

class FaultTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            record: [],
            picVisible: false
        }
    }

    componentDidMount() {
    }

    onClickRow = (record, index) => {
        this.props.faultInfo(record)
        var faults = document.getElementsByClassName('fault');
        for (let i = 0; i < faults.length; i++) {
            faults[i].parentNode.style.backgroundColor = '';
            faults[i].parentNode.parentNode.firstChild.style.backgroundColor = '';
        }
        faults[index * 13].parentNode.parentNode.firstChild.style.backgroundColor = '#3399CC';
        faults[index * 13].parentNode.style.backgroundColor = '#3399CC';
        faults[index * 13 + 1].parentNode.style.backgroundColor = '#3399CC';
        faults[index * 13 + 2].parentNode.style.backgroundColor = '#3399CC';
        faults[index * 13 + 3].parentNode.style.backgroundColor = '#3399CC';
        faults[index * 13 + 4].parentNode.style.backgroundColor = '#3399CC';
        faults[index * 13 + 5].parentNode.style.backgroundColor = '#3399CC';
        faults[index * 13 + 6].parentNode.style.backgroundColor = '#3399CC';
        faults[index * 13 + 7].parentNode.style.backgroundColor = '#3399CC';
        faults[index * 13 + 8].parentNode.style.backgroundColor = '#3399CC';
        faults[index * 13 + 9].parentNode.style.backgroundColor = '#3399CC';
        faults[index * 13 + 10].parentNode.style.backgroundColor = '#3399CC';
        faults[index * 13 + 11].parentNode.style.backgroundColor = '#3399CC';
        faults[index * 13 + 12].parentNode.style.backgroundColor = '#3399CC';
    }

    imgAddOrDelete = (record) => {
        this.setState({
            record: record,
            picVisible: true
        })
    }

    handlePicCancel = () => {
        this.setState({
            picVisible: false
        })
    }

    render() {

        const columns = [
            {
                title: getText('workOrderNumber'),
                dataIndex: 'id',
                key: 'id',
                width: 25,
                render: (text, record) => {
                    let flag = false
                    if (this.props.updateFddList != undefined && this.props.updateFddList.length != 0) {
                        this.props.updateFddList.forEach(item => {
                            if (item.orderId == text) {
                                flag = true
                            }
                        })
                        if (flag) {
                            //如果未读，字体加粗大一号
                            return (
                                <div className='fault' style={{ textAlign: 'center', fontWeight: 'bolder', color: '#64ca64' }}>{text}</div>
                            )
                        } else {
                            //在没有未读的情况下，当工单状态是“已确认”，“已终止”时，显示灰色
                            if (record['status'] === getText('terminated') || record['status'] === getText('confirmed')) {
                                return (
                                    <div className='fault' style={{ textAlign: 'center', color: 'gray' }}>{text}</div>
                                )
                            } else {
                                return (
                                    <div className='fault' style={{ textAlign: 'center' }}>{text}</div>
                                )
                            }
                        }
                    } else {
                        //在没有未读的情况下，当工单状态是“已确认”（4），“已终止”（5）时，显示灰色
                        if (record['status'] === "已终止" || record['status'] === "已确认") {
                            return (
                                <div className='fault' style={{ textAlign: 'center', color: 'gray' }}>{text}</div>
                            )
                        } else {
                            return (
                                <div className='fault' style={{ textAlign: 'center' }}>{text}</div>
                            )
                        }
                    }

                }
            }, {
                title: getText('workOrderNameCol'),
                dataIndex: 'name',
                key: 'name',
                width: 150,
                ellipsis: true,
                render: (text, record) => {
                    let flag = false
                    if (this.props.updateFddList != undefined && this.props.updateFddList.length != 0) {
                        this.props.updateFddList.forEach(item => {
                            if (item.orderId == record['id']) {
                                flag = true
                            }
                        })
                        if (flag) {
                            //如果未读，字体加粗大一号
                            return (
                                <div className='fault' onClick={() => {
                                    this.props.showOrderFlow(record['id'])
                                }} style={{ userSelect: 'text', cursor: 'pointer', fontWeight: 'bolder', color: '#64ca64' }}>{text}</div>
                            )
                        } else {
                            //在没有未读的情况下，当工单状态是"已确认"（4），"已终止"（5）时，显示灰色
                            if (record['status'] === getText('terminated') || record['status'] === getText('confirmed')) {
                                return (
                                    <div className='fault' onClick={() => {
                                        this.props.showOrderFlow(record['id'])
                                    }} style={{ userSelect: 'text', cursor: 'pointer', color: 'gray' }}>{text}</div>
                                )
                            } else {
                                return (
                                    <div className='fault' onClick={() => {
                                        this.props.showOrderFlow(record['id'])
                                    }} style={{ userSelect: 'text', cursor: 'pointer' }}>{text}</div>
                                )
                            }
                        }
                    } else {
                        //在没有未读的情况下，当工单状态是"已确认"，"已终止"时，显示灰色
                        if (record['status'] === getText('terminated') || record['status'] === getText('confirmed')) {
                            return (
                                <div className='fault' onClick={() => {
                                    this.props.showOrderFlow(record['id'])
                                }} style={{ userSelect: 'text', cursor: 'pointer', color: 'gray' }}>{text}</div>
                            )
                        } else {
                            return (
                                <div className='fault' onClick={() => {
                                    this.props.showOrderFlow(record['id'])
                                }} style={{ userSelect: 'text', cursor: 'pointer' }}>{text}</div>
                            )
                        }
                    }
                }
            }, {
                title: getText('position'),
                dataIndex: 'position',
                key: 'position',
                width: 35,
                render: (text) => {
                    return (
                        <div className='fault' style={{ userSelect: 'text' }}>{text}</div>
                    )
                }
            }, {
                title: getText('type'),
                dataIndex: 'view',
                key: 'view',
                width: 45,
                render: (text, record) => {
                    return (
                        <div className='fault' style={{ userSelect: 'text' }}>{text + '-' + record['strWorkOrderType']}</div>
                    )
                }
            }, {
                title: getText('level'),
                dataIndex: 'level',
                key: 'level',
                width: 30,
                render: (text) => {
                    return (
                        <div className='fault' style={{ userSelect: 'text' }}>{text}</div>
                    )
                }
            }, {
                title: getText('occurrenceTime'),
                dataIndex: 'time',
                key: 'time',
                width: 55,
                render: (text) => {
                    return (
                        <div className='fault' style={{ userSelect: 'text' }}>{text}</div>
                    )
                }
            }, {
                title: getText('group'),
                dataIndex: 'group',
                key: 'group',
                width: 30,
                render: (text) => {
                    return (
                        <div className='fault' style={{ userSelect: 'text' }}>{text}</div>
                    )
                }
            }, {
                title: getText('processor'),
                dataIndex: 'processor',
                key: 'processor',
                width: 40,
                render: (text) => {
                    return (
                        <div className='fault' style={{ userSelect: 'text' }}>{text}</div>
                    )
                }
            }, {
                title: getText('status'),
                dataIndex: 'status',
                key: 'status',
                width: 30,
                render: (text, record) => {
                    return (
                        <span className='fault' style={{ cursor: "pointer" }} onClick={() => this.props.scheduleModal(text, record.id)}>{text}</span>
                    )
                }
            }, {
                title: getText('operation'),
                dataIndex: 'handle',
                key: 'handle',
                width: 50,
                render: (text, record) => {
                    if (record.enabled == 0) {
                        return (
                            <div className='fault'>
                                {
                                    record.allowEnable == 1 ?
                                        <Tooltip title={getText('unfreezeWorkOrder')}>
                                            <Icon
                                                type="fire"
                                                style={{
                                                    cursor: 'pointer',
                                                    marginRight: '8px'
                                                }}
                                                onClick={() => { this.props.faultEnable(record.id, 1) }}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                }
                                {
                                    record.allowTerminate == 1 ?
                                        <Tooltip title={language == 'en' ? 'Terminate the work order' : "终止工单"}>
                                            <Icon
                                                type="stop"
                                                style={{
                                                    cursor: 'pointer',
                                                    marginRight: '8px'
                                                }}
                                                onClick={() => { this.props.changeFaultStatusBtn(record, "终止", 5) }}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                }
                                {
                                    record.allowEdit == 1 ?
                                        <Tooltip title={language == 'en' ? 'Modify the work order' : "修改工单"}>
                                            <Icon
                                                type="edit"
                                                style={{
                                                    cursor: 'pointer',
                                                    marginRight: '8px'
                                                }}
                                                onClick={() => { this.props.changeFaultInfo(record) }}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                }
                                {
                                    record.allowEdit == 1 || record.allowSubmit == 1 ?
                                        <Tooltip title={getText('image')}>
                                            <Icon
                                                type="file-image"
                                                style={{
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => { this.imgAddOrDelete(record) }}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                }
                            </div>
                        )
                    } else {
                        if (record.status == getText('pendingAssignment')) {
                            return (
                                <div className='fault'>
                                    {
                                        record.mine == 1 ?
                                            <Tooltip title={getText('assignWorkOrder')}>
                                                <Icon
                                                    type="user-add"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeWorkerModal(record, "fenpai") }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowSubmit == 1 ?
                                            <Tooltip title={language == 'en' ? 'Submit the work order' : "提交工单"}>
                                                <Icon
                                                    type="issues-close"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeWorkerModal(record, "wancheng") }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowAdminSubmit == 1 ?
                                            <Tooltip title={language == 'en' ? 'Submit the completed work order' : "提交完结工单"}>
                                                <Icon
                                                    type="check-circle"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeWorkerModal(record, "wancheng") }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowEnable == 1 ?
                                            <Tooltip title={getText('freezeWorkOrder')}>
                                                <Icon
                                                    type="warning"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.faultEnable(record.id, 0) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowTerminate == 1 ?
                                            <Tooltip title={getText('terminateWorkOrder')}>
                                                <Icon
                                                    type="stop"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeFaultStatusBtn(record, getText('terminatedStatus'), 5) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowEdit == 1 ?
                                            <Tooltip title={getText('editWorkOrder')}>
                                                <Icon
                                                    type="edit"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeFaultInfo(record) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowEdit == 1 || record.allowSubmit == 1 ?
                                            <Tooltip title={getText('image')}>
                                                <Icon
                                                    type="file-image"
                                                    style={{
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => { this.imgAddOrDelete(record) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                </div>
                            )
                        } else if (record.status == "进行中") {
                            return (
                                <div className='fault'>
                                    {
                                        record.allowSubmit == 1 ?
                                            <Tooltip title={language == 'en' ? 'Submit the work order' : "提交工单"}>
                                                <Icon
                                                    type="issues-close"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeWorkerModal(record, "wancheng") }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowAdminSubmit == 1 ?
                                            <Tooltip title={language == 'en' ? 'Submit the completed work order' : "提交完结工单"}>
                                                <Icon
                                                    type="check-circle"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeWorkerModal(record, "wancheng") }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowPause == 1 ?
                                            <Tooltip title={language == 'en' ? 'Pause the work order' : "暂停工单"}>
                                                <Icon
                                                    type="pause"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeWorkerModal(record, "zanting") }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowEnable == 1 ?
                                            <Tooltip title={getText('freezeWorkOrder')}>
                                                <Icon
                                                    type="warning"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.faultEnable(record.id, 0) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowTerminate == 1 ?
                                            <Tooltip title={getText('terminateWorkOrder')}>
                                                <Icon
                                                    type="stop"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeFaultStatusBtn(record, getText('terminatedStatus'), 5) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowEdit == 1 ?
                                            <Tooltip title={getText('editWorkOrder')}>
                                                <Icon
                                                    type="edit"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeFaultInfo(record) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowEdit == 1 || record.allowSubmit == 1 ?
                                            <Tooltip title={getText('image')}>
                                                <Icon
                                                    type="file-image"
                                                    style={{
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => { this.imgAddOrDelete(record) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                </div>
                            )
                        } else if (record.status == getText('paused')) {
                            return (
                                <div className='fault'>
                                    {
                                        record.mine == 1 ?
                                            <Tooltip title={getText('continueWorkOrder')}>
                                                <Icon
                                                    type="play-circle"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeFaultStatusBtn(record, getText('inProgressStatus'), 1) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowEnable == 1 ?
                                            <Tooltip title={getText('freezeWorkOrder')}>
                                                <Icon
                                                    type="warning"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.faultEnable(record.id, 0) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowTerminate == 1 ?
                                            <Tooltip title={getText('terminateWorkOrder')}>
                                                <Icon
                                                    type="stop"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeFaultStatusBtn(record, getText('terminatedStatus'), 5) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowEdit == 1 ?
                                            <Tooltip title={getText('editWorkOrder')}>
                                                <Icon
                                                    type="edit"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeFaultInfo(record) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowEdit == 1 || record.allowSubmit == 1 ?
                                            <Tooltip title={getText('image')}>
                                                <Icon
                                                    type="file-image"
                                                    style={{
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => { this.imgAddOrDelete(record) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                </div>

                            )
                        } else if (record.status == getText('pendingConfirmation')) {
                            return (
                                <div className='fault'>
                                    {
                                        record.mine == 1 ?
                                            <Tooltip title={getText('completeWorkOrder')}>
                                                <Icon
                                                    type="check-circle"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeFaultStatusBtn(record, getText('confirmedStatus'), 3) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowEnable == 1 ?
                                            <Tooltip title={getText('freezeWorkOrder')}>
                                                <Icon
                                                    type="warning"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.faultEnable(record.id, 0) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowTerminate == 1 ?
                                            <Tooltip title={getText('terminateWorkOrder')}>
                                                <Icon
                                                    type="stop"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeFaultStatusBtn(record, getText('terminatedStatus'), 5) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowEdit == 1 ?
                                            <Tooltip title={getText('editWorkOrder')}>
                                                <Icon
                                                    type="edit"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeFaultInfo(record) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowEdit == 1 || record.allowSubmit == 1 ?
                                            <Tooltip title={getText('image')}>
                                                <Icon
                                                    type="file-image"
                                                    style={{
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => { this.imgAddOrDelete(record) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                </div>
                            )
                        } else {
                            return (
                                <div className='fault'>
                                    {
                                        record.allowTerminate == 1 ?
                                            <Tooltip title={getText('terminateWorkOrder')}>
                                                <Icon
                                                    type="stop"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeFaultStatusBtn(record, getText('terminatedStatus'), 5) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowEdit == 1 ?
                                            <Tooltip title={getText('editWorkOrder')}>
                                                <Icon
                                                    type="edit"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                    onClick={() => { this.props.changeFaultInfo(record) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                    {
                                        record.allowEdit == 1 || record.allowSubmit == 1 ?
                                            <Tooltip title={getText('image')}>
                                                <Icon
                                                    type="file-image"
                                                    style={{
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => { this.imgAddOrDelete(record) }}
                                                ></Icon>
                                            </Tooltip>
                                            :
                                            ''
                                    }
                                </div>
                            )
                        }
                    }
                }
            }, {
                title: getText('startProcessingTime'),
                dataIndex: 'startTime',
                key: 'startTime',
                width: 55,
                render: (text) => {
                    return (
                        <div className='fault' style={{ userSelect: 'text' }}>{text}</div>
                    )
                }
            }, {
                title: getText('estimatedCompletionTime'),
                dataIndex: 'estimatedTime',
                key: 'estimatedTime',
                width: 55,
                render: (text, record) => {
                    if (record.status == getText('inProgress')) {
                        if (new Date() > new Date(text)) {
                            return <span className='fault' style={{ color: 'red' }}>{text}</span>
                        } else {
                            return <span className='fault'>{text}</span>
                        }
                    } else {
                        return <span className='fault'>{text}</span>
                    }
                }
            }, {
                title: getText('duration'),
                dataIndex: 'duration',
                key: 'duration',
                width: 40,
                render: (text, record) => {
                    let handleTime = (new Date(record.estimatedTime) - new Date(record.startTime)) / 1000 / 60  //分钟
                    if (text.indexOf(getText('hours')) != -1) {
                        if (text.slice(0, -2) > (handleTime / 60)) {
                            return <span className='fault' style={{ color: 'red' }}>{text}</span>
                        } else {
                            return <span className='fault'>{text}</span>
                        }
                    } else {
                        if (text.slice(0, -2) > handleTime) {
                            return <span className='fault' style={{ color: 'red' }}>{text}</span>
                        } else {
                            return <span className='fault'>{text}</span>
                        }
                    }
                }
            }
        ]

        return (
            <div>
                <Table
                    columns={columns}
                    dataSource={this.props.data}
                    bordered={true}
                    loading={this.props.loading}
                    scroll={{ y: 550 }}
                    pagination={false}
                    onRowClick={this.onClickRow}
                >
                </Table>
                <PictureManage
                    handleCancel={this.handlePicCancel}
                    visible={this.state.picVisible}
                    record={this.state.record}
                    search={this.props.search}
                />
            </div>
        )
    }
}

export default FaultHandleView