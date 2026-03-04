import React, { Component } from 'react'
import { Button, Modal, Spin, Input, Upload, Icon, message, Checkbox } from 'antd'
import s from './OrderFlowModalView.css'
import RcViewer from '@hanyk/rc-viewer'
import http from '../../../../common/http'
import appConfig from '../../../../common/appConfig'
import { downloadUrl } from '../../../../common/utils'

// 语言配置
const language = appConfig.language;

// 文本映射
const textMap = {
    zhCN: {
        tip: '提示',
        loading: 'Loading...',
        createdBy: '由',
        createdAt: '创建于',
        workOrderDetails: '工单详情',
        exportPdf: '导出pdf',
        workOrderFlow: '工单流',
        commentSection: '评论区',
        writeComment: '编写评论...',
        submitImageVideoAttachment: '提交图片、视频或附件',
        submitComment: '提交评论',
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
        publishImageFailed: '发表图片失败！'
    },
    en: {
        tip: 'Tip',
        loading: 'Loading...',
        createdBy: 'Created by',
        createdAt: 'at',
        workOrderDetails: 'Work Order Details',
        exportPdf: 'Export PDF',
        workOrderFlow: 'Work Order Flow',
        commentSection: 'Comment Section',
        writeComment: 'Write a comment...',
        submitImageVideoAttachment: 'Submit images, videos or attachments',
        submitComment: 'Submit Comment',
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
        publishImageFailed: 'Publish image failed!'
    }
};

const getText = (key) => {
    return textMap[language] ? textMap[language][key] : textMap.zhCN[key];
};
const { TextArea } = Input;

class OrderFlowModalView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {},
            loading: true,
            fileList: [],
            content: '',
            btnLoading: false,
            imgUrl: 'https://dom-soft-release.oss-cn-shanghai.aliyuncs.com/static/images/fdd/' + localStorage.getItem('projectNameInCloud') + '/'
        }
    }

    componentDidMount() {
        fetch('http://www.baidu.com').then(
            res => {
                if (res.status != 200) {
                    this.setState({
                        imgUrl: appConfig.serverUrl + '/static/ossImgBuffer/'
                    })
                }
            }
        ).catch(err => {
            this.setState({
                imgUrl: appConfig.serverUrl + '/static/ossImgBuffer/'
            })
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.visible != nextProps.visible) {
            if (nextProps.visible == true) {
                this.getOrderFlowData()
            } else {
                this.setState({
                    data: {}
                })
            }
            return true
        }
        if (this.state.loading != nextState.loading) {
            return true
        }
        if (this.state.content != nextState.content) {
            return true
        }
        if (JSON.stringify(this.state.data) != JSON.stringify(nextState.data)) {
            return true
        }
        if (JSON.stringify(this.state.fileList) != JSON.stringify(nextState.fileList)) {
            return true
        }
        if (this.state.btnLoading != nextState.btnLoading) {
            return true
        }
        if (JSON.stringify(this.state.fileList) != JSON.stringify(nextState.fileList)) {
            return true
        }
        return false
    }

    getOrderFlowData = () => {
        http.post('/fdd/getWorkOrderFlow', {
            "userName": this.props.userName,
            "orderId": this.props.id,
        }).then(res => {
            if (res.err == 0) {
                this.setState({
                    data: res.data
                })
                if (document.getElementById('comment')) {
                    document.getElementById('comment').scrollTop = document.getElementById('comment').scrollHeight
                }
            } else {
                Modal.error({
                    title: getText('tip'),
                    content: res.msg
                })
            }
            this.setState({
                loading: false
            })
        }).catch(err => {
            Modal.error({
                title: getText('tip'),
                content: err.message
            })
            this.setState({
                loading: false
            })
        })
    }

    deleteComment = (id) => {
        Modal.confirm({
            title: getText('deleteCommentConfirm'),
            onOk: () => {
                http.post('/fdd/deleteCommentFromWorkOrder', {
                    id: id,
                    userName: this.props.userName,
                }).then(res => {
                    if (res.err == 0) {
                        message.success(getText('deleteCommentSuccess'))
                        this.getOrderFlowData()
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

    editComment = (id, detail) => {
        Modal.confirm({
            title: getText('editCommentTitle'),
            width: 600,
            content: (
                <div style={{ marginTop: 20 }}>
                    <TextArea rows={8} defaultValue={detail} id='detail' />
                </div>
            ),
            okText: getText('confirmEdit'),
            onOk: () => {
                http.post('/fdd/editCommentOfWorkOrder', {
                    userName: this.props.userName,
                    id: id,   // 评论id
                    content: document.getElementById('detail').value,  // 评论文本
                }).then(res => {
                    if (res.err == 0) {
                        message.success(getText('editCommentSuccess'))
                        this.getOrderFlowData()
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

    getFlow = () => {
        const { data } = this.state
        const { userName } = this.props
        if (data.flowList) {
            return data.flowList.map(item => {
                if (item.type == 'ADD_COMMENT') {
                    return <div style={{ backgroundColor: item.user == userName ? 'rgb(51,153,204,0.3)' : '', padding: 5 }}>
                        <div>
                            <span style={{ color: 'greenyellow' }}>{item.userCh}-{item.user} {item.user == userName ? getText('myself') : ''}</span>
                            <span style={{ marginLeft: 5 }}>{item.strTime}</span>
                            {
                                item.user == userName ?
                                    <div style={{ display: 'inline-block' }}>
                                        {
                                            item.content.detail ?
                                                <Button type='link' size='small' className={s['edit']} onClick={() => this.editComment(item.content.commentId, item.content.detail)}>{getText('editButton')}</Button>
                                                :
                                                ''
                                        }
                                        <Button type='link' size='small' className={s['del']} onClick={() => this.deleteComment(item.content.commentId)}>{getText('deleteButton')}</Button>
                                    </div>
                                    :
                                    ''
                            }
                        </div>
                        <div style={{ paddingLeft: 20 }}>
                            <div style={{ whiteSpace: 'pre-line' }}>
                                {item.content.detail}
                            </div>
                            <div style={{ marginTop: 5 }}>
                                <RcViewer>
                                    {
                                        item.imgNameList.map(picName => {
                                            let prefix = picName.slice(-3)
                                            let url = this.state.imgUrl + picName
                                            if (prefix == 'mp4' || prefix == 'wmv') {
                                                return <video width={400} height='auto' controls>
                                                    <source src={url} type="video/mp4" />
                                                </video>
                                            } else if (prefix == 'png' || prefix == 'gif' || prefix == 'peg' || prefix == 'svg' || prefix == 'jpg' || prefix == 'ebp') {
                                                return <div>
                                                    <img src={url} width='auto' height='auto' style={{ maxWidth: 400 }} alt='本地标识和云端标识不一样，请检查项目配置'/>
                                                </div>
                                            } else {
                                                return <div className={s['attachment']} onClick={() => { downloadUrl(url) }} >{getText('attachment')}({picName})</div>
                                            }
                                        })
                                    }
                                </RcViewer>
                            </div>
                        </div>
                    </div>
                }
            })
        }

    }

    getOperate = () => {
        const { data } = this.state
        if (data.flowList) {
            return data.flowList.map((item, index) => {
                if (item.type == 'OPERATE' && index != 0) {
                    return <div>
                        {item.strTime} &nbsp;&nbsp;  {item.content.detail}
                    </div>
                }
            })
        }
    }

    changeContent = (e) => {
        this.setState({
            content: e.target.value
        })
    }

    addComment = () => {
        const { content, fileList } = this.state
        const { id, userName } = this.props
        this.sendComment({
            userName: userName,
            orderId: id,
            content: content,
            imgList: [],
            onduty: appConfig.onduty,
            cloudUserId: appConfig.cloudUser.cloudUserId,
            projectId: appConfig.projectId
        })
    }

    sendComment = (values) => {
        this.setState({
            btnLoading: true
        })
        http.post('/fdd/addCommentToWorkOrder', values).then(res => {
            if (res.err == 0) {
                if (values['content']) {
                    this.setState({
                        content: ''
                    })
                }
                this.setState({
                    fileList: []
                })
                message.success(getText('commentSubmitSuccess'))
                this.getOrderFlowData()
            } else {
                Modal.error({
                    title: getText('tip'),
                    content: res.msg
                })
            }
            this.setState({
                btnLoading: false,
                fileList: []
            })
        }).catch(err => {
            Modal.error({
                title: getText('tip'),
                content: err.message
            })
            this.setState({
                btnLoading: false,
                fileList: []
            })
        })
    }

    uploadPic = (imgList) => {
        const { id, userName } = this.props
        this.setState({
            btnLoading: true
        })
        let formData = new FormData()
        imgList.forEach((item, index) => {
            formData.append('file0' + (index + 1), item)
        })
        formData.append('directory', 'static/images/fdd/' + localStorage.getItem('projectNameInCloud') + '/')
        http.post('/saveImgToOSS', formData, {
            headers: {
                authorization: 'authorization-text',
            }
        }).then(res => {
            if (res.err == 0) {
                this.sendComment({
                    userName: userName,
                    orderId: id,
                    content: '',
                    imgList: res.data,
                    onduty: appConfig.onduty,
                    cloudUserId: appConfig.cloudUser.cloudUserId,
                    projectId: appConfig.projectId
                })
            } else {
                Modal.error({
                    title: getText('tip'),
                    content: res.msg
                })
                this.setState({
                    btnLoading: false
                })
            }
        }).catch(err => {
            Modal.error({
                title: getText('tip'),
                content: err.message
            })
            this.setState({
                btnLoading: false
            })
        })
    }

    exportInPdf = () => {
        const { id } = this.props
        const projName = localStorage.getItem('projectNameInCloud')
        Modal.confirm({
            title: getText('exportPdfConfirm'),
            content: (
                <div style={{ marginTop: 20 }}>
                     <div style={{ marginBottom: 10 }}>
                        <Checkbox id='exportP' defaultChecked={true}>{getText('exportComments')}</Checkbox>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <Checkbox id='exportG' defaultChecked={false}>{getText('exportAuthorInfo')}</Checkbox>
                    </div>
                    <div>
                        <Checkbox id='exportWord' defaultChecked={false}>{getText('exportAsWord')}</Checkbox>
                    </div>
                </div>
            ),
            onOk: () => {
                http.post('/fdd/exportInPdf', {
                    orderId: id,
                    projectName: projName,
                    showComment: document.getElementById('exportP').checked ? 1 : 0, //是否带评论区 （默认带）
                    showFlow: document.getElementById('exportG').checked ? 1 : 0,    //是否带工单流 （默认不带）
                    toWord: document.getElementById('exportWord').checked ? 1 : 0    //是否导出成.docx
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

    render() {
        const { id, userName } = this.props
        const { data, loading, fileList, btnLoading, content } = this.state
        let _this = this
        const imgProps = {
            name: 'file01',
            action: `${appConfig.serverUrl}/saveImgToOSS`,
            data: {
                directory: 'static/images/fdd/' + localStorage.getItem('projectNameInCloud') + '/'
            },
            headers: {
                authorization: 'authorization-text',
            },
            onChange({ file, fileList }) {
                _this.setState({
                    fileList: [...fileList]
                })
                if (file.status == 'done') {
                    if (file.response.err == 0) {
                        _this.sendComment({
                            userName: userName,
                            orderId: id,
                            content: '',
                            imgList: file.response.data,
                            onduty: appConfig.onduty,
                            cloudUserId: appConfig.cloudUser.cloudUserId,
                            projectId: appConfig.projectId
                        })
                    } else {
                        message.error(getText('publishImageFailed'))
                    }
                }
            },
            fileList: fileList
        }
        return (
            <Modal
                visible={this.props.visible}
                onCancel={() => {
                    this.props.handleCancel();
                    this.setState({
                        loading: true
                    })
                }}
                width={1000}
                footer={false}
                maskClosable={false}
                title={getText('workOrderDetails')}
                destroyOnClose={true}
            >
                <Spin spinning={loading} tip={getText('loading')}>
                    <div style={{ userSelect: 'text' }}>
                        <div className={s['title']}>
                            <h2>{data.workOrderName}</h2>
                            <div className={s['subTitle']}>{getText('createdBy')} {data.creatorCh ? data.creatorCh : data.creatorEn} {getText('createdAt')}{data.createTime}</div>
                        </div>
                        <div title={getText('exportPdf')} style={{ position: 'absolute', top: 28, right: 0 }} >
                            <Button type="link" icon="file-pdf" onClick={this.exportInPdf}></Button>
                        </div>
                        <div className={s['content']}>
                            <div>{data.workOrderDetail}</div>
                            <div>
                                <RcViewer>
                                    {
                                        data.imgList && data.imgList.map(picName => {
                                            let prefix = picName.slice(-3)
                                            let url = this.state.imgUrl + picName
                                            if (prefix == 'mp4' || prefix == 'wmv') {
                                                return <video width={400} height='auto' controls>
                                                    <source src={url} type="video/mp4" />
                                                </video>
                                            } else if (prefix == 'png' || prefix == 'gif' || prefix == 'peg' || prefix == 'svg' || prefix == 'jpg' || prefix == 'ebp') {
                                                return <div>
                                                    <img src={url} width='auto' height='auto' style={{ maxWidth: 400 }} alt='本地标识和云端标识不一样，请检查项目配置'/>
                                                </div>
                                            } else {
                                                return <div className={s['attachment']} onClick={() => { downloadUrl(url) }} >{getText('attachment')}({picName})</div>
                                            }
                                        })
                                    }
                                </RcViewer>
                            </div>
                        </div>
                        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
                            {getText('workOrderFlow')}
                        </div>
                        <div className={s['operate']}>
                            {this.getOperate()}
                        </div>
                        <div style={{ fontWeight: 'bold', marginBottom: 5, borderBottom: '1px solid #ddd' }}>
                            {getText('commentSection')}
                        </div>
                        <div className={s['comment']} id='comment'>
                            {this.getFlow()}
                        </div>
                        <div>
                            <div>
                                <TextArea value={content} rows={3} placeholder={getText('writeComment')} onChange={this.changeContent}
                                    onPaste={
                                        (e) => {
                                            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
                                            let newList = []
                                            for (let i = 0; i < items.length; i++) {
                                                if (items[i].type.indexOf("image") !== -1) { // 只处理图片类型
                                                    const file = items[i].getAsFile();
                                                    file.uid = 'paste-' + file.lastModified
                                                    if (items.length == 1 || file.path != '') {
                                                        newList.push(file)
                                                    }
                                                    if (i == (items.length - 1) && newList.length > 0) {
                                                        this.uploadPic(newList)
                                                    }
                                                }
                                            }
                                        }}
                                />
                            </div>
                            <div className={s['addPic']}>
                                <Upload {...imgProps}>
                                    <Button style={{ borderRadius: 5 }} loading={btnLoading}>
                                        <Icon type="upload" />{getText('submitImageVideoAttachment')}
                                    </Button>
                                </Upload>
                            </div>
                            <div className={s['addComment']}>
                                {
                                    content.trim() != '' ?
                                        <Button type='primary' style={{ float: 'right', borderRadius: 5 }} onClick={this.addComment} loading={btnLoading}>{getText('submitComment')}</Button>
                                        :
                                        ''
                                }

                            </div>
                        </div>
                    </div>
                </Spin>
            </Modal>
        )
    }
}

export default OrderFlowModalView
