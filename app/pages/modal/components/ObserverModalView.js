/**
 * 报警配置页面
 */
import React from 'react';
import { Modal, Spin, Alert, InputNumber, Table, Select, Form, Input, Button, Col, Row, Checkbox, Icon, message, Tabs, Upload, Slider, Card, TimePicker } from 'antd'
import s from './ObserverModalView.css'
import { getWidgetByType } from '../../observer/components/widgets'
import ObserverScreen from '../../observer/components/core/observerScreen';
import http from '../../../common/http';
import appConfig from '../../../common/appConfig';
import LimitDrag from './LimitDrag';

const language = appConfig.language
const isEnglish = language === 'en';
import RcViewer from '@hanyk/rc-viewer'
import MainInterfaceModal from './CommonAlarmModalView';
import EditHighLowAlarmModal from './EditHighLowAlarmModalView';
import EditBoolAlarmModal from './EditBoolAlarmModalView';
import EditCodeAlarmModal from './EditCodeAlarmModalView';
import ModelText from '../../observer/components/core/entities/modelText';
import moment from 'moment';

const InputPwd = Input.Password;
const { TabPane } = Tabs;
const Option = Select.Option;
const FormItem = Form.Item;
const format = 'HH:mm';

let pwd = ''
let cardWrap = "rectanglePanelCard"
let cardWrapList = ["rectanglePanelCard", "", "ractanglesDark"]

const formItemLayout = {
    labelCol: {
        sm: { span: 3 },
    },
    wrapperCol: {
        sm: { span: 21 },
    },
};

const formItemLayoutInfo = {
    labelCol: {
        sm: { span: 5 },
    },
    wrapperCol: {
        sm: { span: 19 },
    },
};

const formItemLayoutNum = {
    labelCol: {
        sm: { span: 14 },
    },
    wrapperCol: {
        sm: { span: 10 },
    },
};

const formItemInfo = {
    labelCol: {
        sm: { span: 4 },
    },
    wrapperCol: {
        sm: { span: 20 },
    },
};

let nameList = [
    { No: isEnglish ? "No." : "编号", Width: 50 },
    { Year: isEnglish ? "Purchase Year" : "购买年份", Width: 50 },
    { Name: isEnglish ? "Name" : "名称", Width: 110 },
    { RatingCoolingCapacity: isEnglish ? "Rated Cooling Capacity" : "额定冷量", Width: 80 },
    { RatingCOP: isEnglish ? "Rated COP" : "额定COP", Width: 80 },
    { RatingPower: isEnglish ? "Rated Power" : "额定功率", Width: 80 },
    { Brand: isEnglish ? "Brand" : "品牌", Width: 80 },
    { Model: isEnglish ? "Model" : "型号", Width: 100 },
    { RatingH: isEnglish ? "Rated Head" : "额定扬程", Width: 50 },
    { RatingFlow: isEnglish ? "Rated Flow" : "额定流量", Width: 80 },
    { WithVSD: isEnglish ? "VSD" : "是否变频", Width: 50 },
    { RatingAirVolume: isEnglish ? "Rated Air Volume" : "额定风量", Width: 80 },
    { Head: isEnglish ? "Head" : "扬程", Width: 50 },
    { TotalHead: isEnglish ? "Total Head" : "全压", Width: 100 },
    { RoomName: isEnglish ? "Room Name" : "房间名称", Width: 100 },
    { SystemNo: isEnglish ? "System No." : "系统编号", Width: 50 },
    { EquipName: isEnglish ? "Equipment Name" : "设备名称", Width: 100 },
    { Type: isEnglish ? "Type & Specs" : "型号及规格", Width: 100 },
    { Quantity: isEnglish ? "Quantity" : "数量", Width: 50 },
    { Size: isEnglish ? "Dimensions" : "外形尺寸", Width: 100 },
    { AirVolumn: isEnglish ? "Air Volume" : "风量", Width: 80 },
    { PressDrop: isEnglish ? "Pressure Drop" : "压损", Width: 80 },
    { HeatLoad: isEnglish ? "Heat Load" : "热量", Width: 80 },
    { HotWaterFlow: isEnglish ? "Hot Water Flow" : "热水流量", Width: 80 },
    { Remark: isEnglish ? "Remark" : "备注", Width: 100 },
    { FlowVelocity: isEnglish ? "Flow Velocity" : "流速", Width: 80 },
    { HotWaterDiam: isEnglish ? "Hot Water Diameter" : "热水口径", Width: 60 },
    { Length: isEnglish ? "Length" : "管长", Width: 50 },
    { AbsRoughNess: isEnglish ? "Pipe Roughness" : "管道绝对粗糙度", Width: 80 },
    { NorminalDiam: isEnglish ? "Nominal Diameter" : "管道公称直径", Width: 50 },
    { WaterDensity: isEnglish ? "Water Density" : "冷水密度", Width: 60 },
    { CrossSecArea: isEnglish ? "Cross Section Area" : "计算断面积", Width: 80 },
    { Efficiency: isEnglish ? "Efficiency" : "效率", Width: 80 },
    { MinimumFlow: isEnglish ? "Minimum Flow" : "最小流量", Width: 80 },
    { RatingHeatingCapacity: isEnglish ? "Rated Heating Capacity" : "制热量", Width: 80 },
    { CoolingEfficiency: isEnglish ? "Cooling Efficiency" : "制冷效率", Width: 80 },
    { HeatingEfficiency: isEnglish ? "Heating Efficiency" : "制热效率", Width: 80 },
    { Form: isEnglish ? "Pump Type" : "泵形式", Width: 80 },
    { Voltage: isEnglish ? "Voltage" : "电压", Width: 50 },
    { idCom: isEnglish ? "Equipment ID" : "设备标识", Width: 100 },
    { Specs: isEnglish ? "Specifications" : "规格", Width: 80 },
    { WorkPressure: isEnglish ? "Working Pressure" : "工作压力", Width: 80 }
]
let str, instructionStr;
if (localStorage.getItem('serverOmd') == "best") {
    str = 'vertical-center-modal-equipment-best'
    instructionStr = 'warning-config-best'
} else {
    str = 'vertical-center-modal-equipment'
    instructionStr = ''
}

const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 8 },
    },
};

//添加报警
class AddWarningForm extends React.Component {
    constructor(props) {
        super(props)

        this.toggleHighLowModal = this.toggleHighLowModal.bind(this)

    }

    //报警配置的方法
    handleModalHide() { //关闭模态窗并添加报警配置
        const { form } = this.props
        const { getFieldsValue, validateFields } = form
        const fields = getFieldsValue()
        let hhenable = this.props.form.getFieldValue('hhenable')
        let henable = this.props.form.getFieldValue('henable')
        let llenable = this.props.form.getFieldValue('llenable')
        let lenable = this.props.form.getFieldValue('lenable')
        let hhlimit = this.props.form.getFieldValue('hhlimit')
        let hlimit = this.props.form.getFieldValue('hlimit')
        let llimit = this.props.form.getFieldValue('llimit')
        let lllimit = this.props.form.getFieldValue('lllimit')
        let hhinfo = this.props.form.getFieldValue('hhinfo')
        let hinfo = this.props.form.getFieldValue('hinfo')
        let llinfo = this.props.form.getFieldValue('llinfo')
        let linfo = this.props.form.getFieldValue('linfo')
        let ofPosition = this.props.form.getFieldValue('ofPosition')
        let ofDepartment = this.props.form.getFieldValue('ofDepartment')
        let ofGroup = this.props.form.getFieldValue('ofGroup')
        let ofSystem = this.props.form.getFieldValue('ofSystem')
        let tag = this.props.form.getFieldValue('tag')
        //e.preventDefault()
        validateFields(['pointname', 'warningGroup'], (err, value) => {
            if (!err) {
                this.props.alarmHide();
                //增加报警
                http.post('/warningConfig/add', {
                    "pointname": value.pointname,
                    "boolWarningLevel": 2,
                    "warningGroup": value.warningGroup,
                    "boolWarningInfo": "",
                    "type": 0,
                    "hhenable": hhenable ? 1 : 0,
                    "henable": henable ? 1 : 0,
                    "llenable": llenable ? 1 : 0,
                    "lenable": lenable ? 1 : 0,
                    "hhlimit": hhlimit,
                    "hlimit": hlimit,
                    "llimit": llimit,
                    "lllimit": lllimit,
                    "hhinfo": hhinfo,
                    "hinfo": hinfo,
                    "llinfo": llinfo,
                    "linfo": linfo,
                    "ofPosition": ofPosition ? ofPosition : '',
                    "ofDepartment": ofDepartment ? ofDepartment : '',
                    "ofGroup": ofGroup ? ofGroup : '',
                    "ofSystem": ofSystem ? ofSystem : '',
                    "tag": tag ? tag : '',
                    lan: language
                }).then(
                    data => {
                        if (!data.err) {
                            Modal.success({
                                title: '信息提示',
                                content: '添加成功'
                            })
                        } else {
                            Modal.error({
                                title: '错误信息',
                                content: data.msg
                            })
                        }
                    }
                )
            }
        })
    }

    toggleHighLowModal() {
        this.props.alarmHide()
    }


    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                visible={this.props.visible}
                onCancel={this.props.alarmHide}
                footer={null}
                title={isEnglish ? 'Add High/Low Limit Alarm' : '添加高低限报警'}
                width={550}
            >
                <Form>
                    <Row gutter={60} >
                        <Col span={24} >
                            <FormItem
                                label={isEnglish ? 'Point Name' : '点名'}
                                {...formItemLayout}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('pointname', {
                                    rules: [{
                                        required: true, message: isEnglish ? 'Please select point name' : '请选择点名'
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    {/* <Row gutter={60} >
                        <Col span={24} >
                            <FormItem
                                label='分组'
                                {...formItemLayout}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('warningGroup', {
                                    rules: [{
                                        pattern: /^[A-Za-z0-9\u4e00-\u9fa5_-]+$/,
                                        message: '可填写大小写字母／数字／汉字'
                                    }, {
                                        required: true, message: "请填写分组"
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row> */}
                    <Row gutter={60}>
                        <Col span={12}>
                            <FormItem
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('hhenable', {
                                    valuePropName: 'checked',
                                    initialValue: 0
                                })(
                                    <Checkbox>{isEnglish ? 'Enable High-High Limit Alarm' : '是否启用高高限值报警'}</Checkbox>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12} >
                            <FormItem
                                label={isEnglish ? 'High-High Limit Value' : '高高限报警数值'}
                                className={s['row-margin']}
                                {...formItemLayoutNum}
                            >
                                {getFieldDecorator('hhlimit', {
                                    initialValue: '',
                                    rules: [{
                                        pattern: /^-|[0-9]+$/,
                                        message: isEnglish ? 'Numbers 0-9' : '0-9数字'
                                    }, {
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback(isEnglish ? 'Please enter a value' : '请填写数值')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={24} >
                            <FormItem
                                label={isEnglish ? 'High-High Limit Alarm Info' : '高高限报警信息'}
                                {...formItemLayoutInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('hhinfo', {
                                    initialValue: '',
                                    rules: [{
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback(isEnglish ? 'Please enter information' : '请填写信息')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60}>
                        <Col span={12}>
                            <FormItem
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('henable', {
                                    valuePropName: "checked",
                                    initialValue: 0,
                                })(
                                    <Checkbox>{isEnglish ? 'Enable High Limit Alarm' : '是否启用高限值报警'}</Checkbox>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12} >
                            <FormItem
                                label={isEnglish ? 'High Limit Value' : '高限报警数值'}
                                className={s['row-margin']}
                                {...formItemLayoutNum}
                            >
                                {getFieldDecorator('hlimit', {
                                    initialValue: '',
                                    rules: [{
                                        pattern: /^-|[0-9]+$/,
                                        message: isEnglish ? 'Numbers 0-9' : '0-9数字'
                                    }, {
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback(isEnglish ? 'Please enter a value' : '请填写数值')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={24} >
                            <FormItem
                                label={isEnglish ? 'High Limit Alarm Info' : '高限报警信息'}
                                {...formItemLayoutInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('hinfo', {
                                    initialValue: "",
                                    rules: [{
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback(isEnglish ? 'Please enter information' : '请填写信息')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60}>
                        <Col span={12}>
                            <FormItem
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('lenable', {
                                    valuePropName: 'checked',
                                    initialValue: 0
                                })(
                                    <Checkbox>{isEnglish ? 'Enable Low Limit Alarm' : '是否启用低限值报警'}</Checkbox>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12} >
                            <FormItem
                                label={isEnglish ? 'Low Limit Value' : '低限报警数值'}
                                className={s['row-margin']}
                                {...formItemLayoutNum}
                            >
                                {getFieldDecorator('llimit', {
                                    initialValue: "",
                                    rules: [{
                                        pattern: /^-|[0-9]+$/,
                                        message: isEnglish ? 'Numbers 0-9' : '0-9数字'
                                    }, {
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback(isEnglish ? 'Please enter a value' : '请填写数值')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={24} >
                            <FormItem
                                label={isEnglish ? 'Low Limit Alarm Info' : '低限报警信息'}
                                {...formItemLayoutInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('linfo', {
                                    initialValue: "",
                                    rules: [{
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback(isEnglish ? 'Please enter information' : '请填写信息')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60}>
                        <Col span={12}>
                            <FormItem
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('llenable', {
                                    valuePropName: 'checked',
                                    initialValue: 0,
                                })(
                                    <Checkbox>{isEnglish ? 'Enable Low-Low Limit Alarm' : '是否启用低低限值报警'}</Checkbox>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12} >
                            <FormItem
                                label={isEnglish ? 'Low-Low Limit Value' : '低低限报警数值'}
                                className={s['row-margin']}
                                {...formItemLayoutNum}
                            >
                                {getFieldDecorator('lllimit', {
                                    initialValue: '',
                                    rules: [{
                                        pattern: /^-|[0-9]+$/,
                                        message: '0-9数字'
                                    }, {
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback(isEnglish ? 'Please enter a value' : '请填写数值')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={24} >
                            <FormItem
                                label={isEnglish ? 'Low-Low Limit Alarm Info' : '低低限报警信息'}
                                {...formItemLayoutInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('llinfo', {
                                    initialValue: '',
                                    rules: [{
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback(isEnglish ? 'Please enter information' : '请填写信息')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={24} >
                            <FormItem
                                label={isEnglish ? 'Alarm Position' : '报警位置'}
                                {...formItemLayout}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofPosition'
                                )(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={12}>
                            <FormItem
                                label={isEnglish ? 'Department' : '部门'}
                                {...formItemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofDepartment'
                                )(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                label={isEnglish ? 'Group' : '分组'}
                                {...formItemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofGroup'
                                )(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={12}>
                            <FormItem
                                label={isEnglish ? 'System' : '系统'}
                                {...formItemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('ofSystem'
                                )(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                label={isEnglish ? 'Tag' : '标签'}
                                {...formItemInfo}
                                className={s['row-margin']}
                            >
                                {getFieldDecorator('tag'
                                )(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <FormItem
                        {...formItemLayoutWithOutLabel}
                    >
                        <Button onClick={this.toggleHighLowModal} className={s['cancel-btn']} >{isEnglish ? 'Cancel' : '取消'}</Button>
                        <Button onClick={() => { this.handleModalHide() }} >{isEnglish ? 'Confirm' : '确定'}</Button>
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
const AddWarningFormModal = Form.create({
    mapPropsToFields: (props) => {
        return {
            pointname: Form.createFormField({
                value: props.pointname
            })
        }
    }
})(AddWarningForm)


//ObserverModalForm组件
class ObserverModalForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: null,
            textValue: this.props.textData.currentValue,
            selectValue: this.props.selectData.currentValue,
            isLimit: false,
            customListInModal: [],
            LinkList: [],
            id: "",
            infoModalVisible: false,
            dataSource: [],
            equipmentColumns: [],
            titleName: '',
            assetModalVisible: false,
            dataAssetSource: [],
            assetLoading: false,
            activeKey: '1',
            activeKey2: '1',
            activeKey3: '1',
            fileList: [],
            pngList01: [],
            pngList02: [],
            pngList03: [],
            equipmentImages: null,
            keyImgValid: null
        };

        this.container = null;
        this.observerScreen = null;

        this.onOk = this.onOk.bind(this);
        this.showLoading = this.showLoading.bind(this);
        this.hideLoading = this.hideLoading.bind(this);
        this.handleText = this.handleText.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.renderScreen = this.renderScreen.bind(this);
        this.initHistroyModal = this.initHistroyModal.bind(this);
        this.initCheckboxs = this.initCheckboxs.bind(this);
        this.handleChange = this.handleChange.bind(this)
        this.getComponent = this.getComponent.bind(this)
        this.getRectanglePanel = this.getRectanglePanel.bind(this);
        this.getPanel = this.getPanel.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
    }
    componentDidMount() {
        if (this.props.navigation && this.props.navigation != "" && this.props.navigation != undefined) {
            let navigationStr = JSON.parse(this.props.navigation).content
            if (navigationStr && navigationStr != undefined && navigationStr != "") {
                let arr = navigationStr.split("|")
                let brr = []
                if (arr != [] && arr[0] != undefined && arr[0] != "") {
                    brr = arr.map((item, index) => {
                        let crr = item.split(",")
                        if (crr[3] && crr[3] != undefined) {
                            return { name: crr[0], roomName: crr[1], id: crr[2], link: crr[3] }
                        } else {
                            return { name: crr[0], roomName: crr[1], id: crr[2] }
                        }

                    })
                    this.setState({
                        LinkList: brr,
                        id: this.props.templateConfig["2"]
                    })
                }
            }
        } else if (this.props.navJsonConfig && this.props.navJsonConfig != "" && this.props.navJsonConfig != undefined) {
            let navigationStr = JSON.parse(this.props.navJsonConfig).content
            if (navigationStr && navigationStr != undefined && navigationStr != "") {
                let arr = navigationStr.split("|")
                let brr = []
                if (arr != [] && arr[0] != undefined && arr[0] != "") {
                    brr = arr.map((item, index) => {
                        let crr = item.split(",")
                        return { name: crr[0], id: crr[1] }
                    })
                    this.setState({
                        LinkList: brr,
                        id: brr[0] ? brr[0].id : ""
                    })
                }
            }
        } else {

        }

        // 重置状态，避免显示其他设备的状态
        this.setState({
            equipmentImages: null,
            keyImgValid: null
        });

        setTimeout(() => {
            console.log(this.container); // 访问DOM元素或组件实例
            // 强制等待idCom更新完成后再加载图片
            this.waitForIdComUpdate();
            this.renderScreen(this.props.pageId, this.props.isTemplate, this.props.templateConfig, this.props.templateFileName);
            new LimitDrag(`.${str} .ant-modal-content`);
        }, 0)
    }
    // 计算h5控件宽高和坐标
    getStyle = (calH, calW, calX, calY) => {
        var catchedContainerStyle = window.getComputedStyle(document.getElementById('observerModalContainer'))
        // console.info( catchedContainerStyle.width,catchedContainerStyle.height )
        let width = Math.floor(parseInt(catchedContainerStyle.width) * calW),
            height = Math.floor(parseInt(catchedContainerStyle.height) * calH),
            left = Math.floor(parseInt(catchedContainerStyle.width) * calX) - parseInt(catchedContainerStyle.x),
            top = Math.floor(parseInt(catchedContainerStyle.height) * calY) - parseInt(catchedContainerStyle.y)
        return { width, height, left, top }
    }

    componentWillReceiveProps(newProps) {
        let description
        if (this.props.pointInfo) {
            if (this.props.pointInfo.hight > this.props.pointInfo.low || (this.props.pointInfo.hight == undefined && this.props.pointInfo.low) || (this.props.pointInfo.hight && this.props.pointInfo.low == undefined)) {  //判断有无高低限
                this.setState({
                    isLimit: true
                })
            };
            description = this.props.pointInfo && this.props.pointInfo.description
        }

        // 获取到每个h5控件的实例，包含属性points数组，每个点里包含的数据，根据当前这个实例的type
        if (this.props.customListInModal !== newProps.customListInModal) {
            // customList是实例
            let calCustomList = newProps.customListInModal.map(custom => {
                const { width, height, left, top } = this.getStyle(custom['calH'], custom['calW'], custom['calX'], custom['calY'])
                custom['style']['width'] = width
                custom['style']['height'] = height
                custom['style']['left'] = left
                custom['style']['top'] = top
                return custom
            })
            console.info("===observerView componentWillReceiveProps" + calCustomList)
            // 先获取容器计算的w,h
            this.setState({
                customListInModal: calCustomList
            })
        }
    }

    componentWillUnmount() {
        if (this.observerScreen) {
            //   console.log("575行，observerModalView文件componentWillUnmount，执行observerScreen.close")      
            this.observerScreen.close();
            this.observerScreen.refreshCustomData(this.props.customList)
        }

        // 清理定时器
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }

        // 清理超时定时器
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        // 清理idCom检查定时器
        if (this.idComCheckInterval) {
            clearInterval(this.idComCheckInterval);
            this.idComCheckInterval = null;
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.textVisible !== this.props.textVisible) {
            if (nextProps.textVisible == true) {
                this.setState({
                    textValue: this.props.textData.currentValue == "--" ? undefined : this.props.textData.currentValue
                })
            }

            return true
        }
        if (JSON.stringify(nextProps.float_rectangles_panel_data) != JSON.stringify(this.props.float_rectangles_panel_data)) {
            return true
        }
        if (nextState.textValue !== this.state.textValue) {
            return true
        }
        if (nextState.loading !== this.state.loading) {
            return true;
        }
        if (nextState.selectValue !== this.state.selectValue) {
            return true
        }
        if (nextProps.switchVisible !== this.props.switchVisible) {
            return true;
        }
        if (nextProps.checkboxVisible !== this.props.checkboxVisible) {
            return true;
        }
        if (nextProps.radioVisible !== this.props.radioVisible) {
            return true;
        }
        if (nextState.infoModalVisible !== this.state.infoModalVisible) {
            return true;
        }
        if (nextState.assetModalVisible !== this.state.assetModalVisible) {
            return true;
        }
        if (nextState.dataAssetSource !== this.state.dataAssetSource) {
            return true;
        }
        if (nextProps.isLoading !== this.props.isLoading) {
            return true;
        }
        if (nextState.assetLoading !== this.state.assetLoading) {
            return true;
        }
        if (nextState.activeKey !== this.state.activeKey) {
            return true;
        }
        if (nextState.activeKey2 !== this.state.activeKey2) {
            return true;
        }
        if (nextState.activeKey3 !== this.state.activeKey3) {
            return true;
        }
        if (nextState.fileList !== this.state.fileList) {
            return true;
        }
        if (nextState.pngList01 !== this.state.pngList01) {
            return true;
        }
        if (nextState.pngList02 !== this.state.pngList02) {
            return true;
        }
        if (nextState.pngList03 !== this.state.pngList03) {
            return true;
        }
        if (nextState.equipmentImages !== this.state.equipmentImages) {
            return true;
        }
        if (nextState.keyImgValid !== this.state.keyImgValid) {
            return true;
        }
        if (nextProps.alarmVisible !== this.props.alarmVisible) {
            return true;
        }
        return false
    }

    onOk() {
        this.props.onOk(this.state.selectedPoint);
        this.props.hideModal();
    }

    showLoading() {
        this.setState({
            loading: true
        });
    }
    hideLoading() {
        this.setState({
            loading: false
        });
    }
    //切换历史数据
    initHistroyModal(modalDict) {
        return this.observerScreen.initHistroyData(modalDict, true)
    }

    initCheckboxs(dateDict) {
        this.observerScreen.initCheckboxs(dateDict)
    }

    renderScreen(id, isTemplate, templateConfig, templateFileName, dbRefFlage) {
        this.observerScreen = new ObserverScreen(id, this.container, {
            showLoading: this.showLoading,
            hideLoading: this.hideLoading,
            isTemplate: isTemplate,
            templateConfig: templateConfig,
            dbRefFlage: dbRefFlage,
            templateFileName: templateFileName,
            showObserverSecModal: this.props.showObserverSecModal,
            showOperatingModal: this.props.showOperatingModal, //弹出设备开关模态框的方法传递
            showCheckboxModal: this.props.showCheckboxModal, //弹出优化选项模态框的方法传递
            showOperatingTextModal: this.props.showOperatingTextModal, //弹出设备详情中所有设置值的模态框的方法传递
            showRadioModal: this.props.showRadioModal, //弹出设备详情里的启用／禁用
            showSelectControlModal: this.props.showSelectControlModal, //弹出设备详情里的控制模式选项
            getToolPoint: this.props.getToolPoint,
            showCommonAlarm: this.props.showCommonAlarm,
            getTendencyModal: this.props.getTendencyModal,
            bShowTimeShaft: this.props.bShowTimeShaft, //判断值，判断是否开启实时刷新
            dateProps: this.props.dateModal.props,
            curValue: this.props.curValue, //当前时间轴拖动的值（对应时间数组的索引）
            refreshCustomData: this.props.refreshCustomData,
            refreshCustomDataInModal: this.props.refreshCustomDataInModal,
            getCustomRealTimeData: this.props.getCustomRealTimeData,
            //   getPointRealTimeData : this.props.getPointRealTimeData,
            getTimePickerRealTimeData: this.props.getTimePickerRealTimeData,
            getRectanglesPanelData: this.props.getRectanglesPanelData,
            refreshRectanglePanelData: this.props.refreshRectanglePanelData,
            refreshRectangleData: this.props.refreshRectangleData,
            getCustomTableData: this.props.getCustomTableData,
            refreshTimePickerData: this.props.refreshTimePickerData,
            showMainInterfaceModal: this.props.showMainInterfaceModal,
        });
        //保存该实例的方法
        this.props.observerModalDict({
            initHistroyModal: this.initHistroyModal,
            initCheckboxs: this.initCheckboxs
        })
        this.observerScreen.showModal();
    }
    //设备详情内的模态框改值逻辑
    handleText(e) {
        e.preventDefault();
        const pointInfo = this.props.pointInfo
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (this.props.textData.showMode == 2) {
                    if (values.settingValue) {
                        values.settingValue = moment(values.settingValue).format(format)
                        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(values.settingValue)) {
                            Modal.warning({
                                title: '信息提示',
                                content: '设定值格式必须是标准时间格式hh:mm！',
                            })
                            return
                        }
                    } else {
                        values.settingValue = " "
                    }
                    this.props.observerSetting(values, this.props.textData.idCom);
                } else {
                    //文本写值时，当前为整数，且只修改小数点前的值为0时，下发后form表单无法获取到0，只能用state,而4月份的版本，state为数字格式的0时，表达式判断为false取了form中的旧值(刚巧只写小数点前的0时，form表单获取的值不对)；
                    //2023-6-27日，讲三元表达式修改为string判断，修复上述bug
                    values.settingValue = this.state.textValue != undefined && String(this.state.textValue) ? String(this.state.textValue) : values.settingValue
                    if (values.settingValue === undefined && !this.props.isLoading) {
                        Modal.warning({
                            title: '信息提示',
                            content: '设定值格式错误!',
                        });
                    } else if (!(/(^-?[0-9]+$)|(^-?[0-9]+\.[0-9]+$)/g).test(values.settingValue) && !this.props.isLoading) {
                        Modal.warning({
                            title: '信息提示',
                            content: '设定值格式错误!'
                        });
                    } else {
                        if (this.props.pointInfo &&
                            this.props.pointInfo.hight &&
                            this.props.pointInfo.low &&
                            (Number(values.settingValue) < this.props.pointInfo.low ||
                                Number(values.settingValue) > this.props.pointInfo.hight)) {
                            Modal.warning({
                                title: '信息提示',
                                content: `该设定值超出上下限范围（${this.props.pointInfo.low}~${this.props.pointInfo.hight}），被认为无效，请重新输入`,
                            })
                        } else {
                            this.props.observerSetting(values, this.props.textData.idCom);
                        }
                    }
                }
            }
        });
    }

    handleChange(value) {
        if (this.props.pointInfo) {
            if (this.props.pointInfo.hight || this.props.pointInfo.low) {
                this.props.form.setFieldsValue({
                    settingValue: value
                })
            }
        }
        if (value == '-' || value == '.') return
        this.setState({
            textValue: value
        })
    }

    handleChangeTime = (time, timeString) => {
        this.setState({
            textValue: timeString
        })
    }

    handleSelect(value) {
        this.setState({
            selectValue: value
        })
    }

    getComponent() {
        const { customListInModal, custom_realtime_data, point_realtime_data, tableLoading, custom_table_data } = this.props
        let Components = []

        // console.log("===observerView getComponent开始"+this.props)

        if (customListInModal.length != undefined) {
            // customList是实例
            customListInModal.map(custom => {
                //const {width,height,left,top} = this.getStyle(custom['calH'],custom['calW'],custom['calX'],custom['calY'])
                let paddingLeft = (1920 - custom['pageW']) / 2;
                let paddingTop = (955 - custom['pageH']) / 2;
                custom['style']['left'] = custom['x'] - paddingLeft
                custom['style']['top'] = custom['y'] - paddingTop
            })
        }

        try {
            customListInModal.forEach(row => {
                const widget = getWidgetByType(row.type)
                if (!widget) {
                    throw new Error(`CustomComponet: Widget type '${row.type}' is not available.`)
                }
                let Component = widget.component;
                Components.push(
                    <Component
                        {...row}
                        showModal={this.props.showModal}
                        tableOneClick={this.props.tableOneClick}
                        refreshReportFun={this.props.refreshReportFun}
                        refreshBenchmarkFun={this.props.refreshBenchmarkFun}
                        refreshBenchmark={this.props.refreshBenchmark}
                        custom_realtime_data={custom_realtime_data}
                        /* point_realtime_data={point_realtime_data} */
                        tableLoading={tableLoading}
                        tableLoadingFun={this.props.tableLoadingFun}
                        custom_table_data={custom_table_data}
                    />
                )
            })
        } catch (err) {
            console.error(err)
            Components = []
        }
        // console.log("===observerView getComponent 返回"+Components)
        return Components

    }
    getChangeBtns() {
        let LinkList = this.state.LinkList
        if (LinkList != [] && LinkList[0] != undefined) {
            if (this.props.navigation && this.props.navigation != "" && this.props.navigation != undefined) {
                return (
                    <div style={{ marginTop: -10, marginBottom: 5 }}>
                        <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
                            <span>{isEnglish ? 'Quick Navigation' : '快捷切换导航'}</span>
                            <Button style={{ marginLeft: 10 }} onClick={() => this.nextEquiment("-")}>{isEnglish ? 'Previous' : '上翻'}</Button>
                            <Button style={{ marginLeft: 10 }} onClick={() => this.nextEquiment("+")}>{isEnglish ? 'Next' : '下翻'}</Button>
                        </div>
                        <div style={{ display: 'inline-block', overflowX: 'auto', overflowY: 'hidden', maxWidth: JSON.parse(this.props.navigation).width ? JSON.parse(this.props.navigation).width : 600, whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                            {LinkList.map((item) => {
                                return <Button
                                    id={item.id}
                                    style={{ marginLeft: 10, backgroundColor: item.id == this.state.id ? "rgb(46,162,248)" : "" }}
                                    onClick={() => {
                                        if (this.observerScreen) {
                                            this.observerScreen.close();
                                            this.observerScreen.refreshCustomData(this.props.customList)
                                        }
                                        this.setState({ id: item.id, titleName: item.name })
                                        this.renderScreen(item.link ? item.link : this.props.pageId, this.props.isTemplate, { 1: item.roomName, 2: item.id }, this.props.templateFileName)
                                    }}>{item.name}</Button>
                            })}
                        </div>
                    </div>
                )
            }
            if (this.props.navJsonConfig && this.props.navJsonConfig != "" && this.props.navJsonConfig != undefined) {
                return (
                    <div style={{ marginTop: -10, marginBottom: 5 }}>
                        <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
                            <span>{isEnglish ? 'Quick Navigation' : '快捷切换导航'}</span>
                            <Button style={{ marginLeft: 10 }} onClick={() => this.nextPage("-")}>{isEnglish ? 'Previous' : '上翻'}</Button>
                            <Button style={{ marginLeft: 10 }} onClick={() => this.nextPage("+")}>{isEnglish ? 'Next' : '下翻'}</Button>
                        </div>
                        <div style={{ display: 'inline-block', overflowX: 'auto', overflowY: 'hidden', maxWidth: JSON.parse(this.props.navJsonConfig).width ? JSON.parse(this.props.navJsonConfig).width : 600, whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                            {LinkList.map((item) => {
                                return <Button
                                    id={item.id}
                                    style={{ marginLeft: 10, backgroundColor: item.id == this.state.id ? "rgb(46,162,248)" : "" }}
                                    onClick={() => {
                                        if (this.observerScreen) {
                                            this.observerScreen.close();
                                            this.observerScreen.refreshCustomData(this.props.customList)
                                        }
                                        this.setState({ id: item.id, titleName: item.name })
                                        this.renderScreen(item.id, this.props.isTemplate, {}, this.props.templateFileName)
                                    }}>{item.name}</Button>
                            })}
                        </div>
                    </div>
                )
            }

        }

    }

    nextEquiment(flag) {
        if (this.observerScreen) {
            this.observerScreen.close();
            this.observerScreen.refreshCustomData(this.props.customList)
        }
        let id = this.state.id
        let DQId
        let LinkList = this.state.LinkList
        LinkList.map((item, index) => {
            if (item.id == id) {
                DQId = index
            }
        })
        LinkList.map((item, index) => {
            if (flag == "-") {
                if ((DQId - 1) >= 0) {
                    if (index == (DQId - 1)) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.link ? item.link : this.props.pageId, this.props.isTemplate, { 1: item.roomName, 2: item.id }, this.props.templateFileName)
                    }
                } else {
                    if (index == (LinkList.length - 1)) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.link ? item.link : this.props.pageId, this.props.isTemplate, { 1: item.roomName, 2: item.id }, this.props.templateFileName)
                    }
                }
            } else {
                if ((DQId + 1) <= (LinkList.length - 1)) {
                    if (index == (DQId + 1)) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.link ? item.link : this.props.pageId, this.props.isTemplate, { 1: item.roomName, 2: item.id }, this.props.templateFileName)
                    }
                } else {
                    if (index == 0) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.link ? item.link : this.props.pageId, this.props.isTemplate, { 1: item.roomName, 2: item.id }, this.props.templateFileName)
                    }
                }
            }
        })
    }

    nextPage(flag) {
        if (this.observerScreen) {
            this.observerScreen.close();
            this.observerScreen.refreshCustomData(this.props.customList)
        }
        let id = this.state.id
        let DQId
        let LinkList = this.state.LinkList
        LinkList.map((item, index) => {
            if (item.id == id) {
                DQId = index
            }
        })
        LinkList.map((item, index) => {
            if (flag == "-") {
                if ((DQId - 1) >= 0) {
                    if (index == (DQId - 1)) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.id, this.props.isTemplate, {}, this.props.templateFileName)
                    }
                } else {
                    if (index == (LinkList.length - 1)) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.id, this.props.isTemplate, {}, this.props.templateFileName)
                    }
                }
            } else {
                if ((DQId + 1) <= (LinkList.length - 1)) {
                    if (index == (DQId + 1)) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.id, this.props.isTemplate, {}, this.props.templateFileName)
                    }
                } else {
                    if (index == 0) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.id, this.props.isTemplate, {}, this.props.templateFileName)
                    }
                }
            }
        })
    }

    handleCancel = () => {
        this.setState({
            infoModalVisible: false,
        });
    }

    assetHandleCancel = () => {
        this.setState({
            assetModalVisible: false,
        });
    }

    getEquipmentInfo = () => {
        let dataSource = []
        let idCom = localStorage.getItem('selectEquipment')
        if (idCom == undefined || idCom == '') {
            Modal.info({
                title: isEnglish ? 'Notice' : '提示',
                content: isEnglish ? 'Non-standard equipment popup, unable to display equipment nameplate. If it is a standard equipment, please bind the equipment OnOff point name to the equipment image in the popup in template 4db.' : '非标准设备弹窗，无法展示设备铭牌。如果是标准设备，请在模板4db中给弹框里的设备图片绑定设备OnOff点名。'
            })
            return
        }
        let tableData = JSON.parse(localStorage.getItem('deviceDetails'))
        if (idCom.indexOf('CTFan') != -1) {
            let index = idCom.indexOf('CTFan')
            idCom = idCom.slice(0, index + 2) + idCom.slice(index + 7)
        }

        //如果设备绑的是脚本，需要拼接取出前缀和后缀
        if (idCom.indexOf('<%') != -1) {
            let arr = idCom.split('OnOff')
            let prefix = ""
            let suffix = ""
            if (arr[0].indexOf('<%') != -1) {
                let arrPre = arr[0].split('<%')
                prefix = arrPre[arrPre.length - 1]
            } else {
                prefix = arr[0]
            }

            if (arr[1].indexOf('%>') != -1) {
                suffix = arr[1].split('%>')[0]
            } else {
                suffix = arr[1]
            }
            idCom = prefix + suffix
        } else {
            idCom = idCom.replace('OnOff', '')
        }

        for (let i in tableData) {
            tableData[i].map(item => {
                if (item['idCom'] == idCom) {
                    dataSource.push(item)
                }
            })
        }
        if (dataSource == [] || dataSource[0] == undefined) {
            this.setState({
                assetLoading: true,
                assetModalVisible: true,
                activeKey: '1',
                activeKey2: '1',
                activeKey3: "1"
            })
            http.post('/equipment/getInitAssetByIdentity', {
                identity: idCom
            }).then(res => {
                if (res.status == true) {
                    this.setState({
                        dataAssetSource: res.data,
                        assetLoading: false
                    })
                } else {
                    this.setState({
                        assetLoading: false
                    })
                }
            }).catch(err => {
                this.setState({
                    assetLoading: false
                })
            })
        } else {
            let equipmentColumns = this.getColumns(dataSource)
            this.setState({
                dataSource: dataSource,
                equipmentColumns: equipmentColumns,
                infoModalVisible: true
            })
        }
    }

    //动态改变表头
    getColumns = (items) => {
        let obj = {}
        let arr = []
        let flag
        for (let i = 0; i < items.length; i++) {
            Object.assign(obj, items[i])
        }
        for (let key in obj) {
            arr.push(key)
        }
        let Columns = arr.map((item) => {
            let Index
            for (let i = 0; i < nameList.length; i++) {
                if (nameList[i][item] != undefined) {
                    Index = i
                }
            }
            if (Index != undefined) {
                return { title: nameList[Index][item], key: item, dataIndex: item, width: nameList[Index]["Width"] }
            } else {
                return { title: item, key: item, dataIndex: item, width: 80 }
            }
        })
        for (let i = 0; i < Columns.length; i++) {
            flag = Columns[i]
            if (Columns[i].key == "No" && i != 0) {
                Columns[i] = Columns[0]
                Columns[0] = flag
                i = 0
            }
            if (Columns[i].key == "Name" && i != 1) {
                Columns[i] = Columns[1]
                Columns[1] = flag
                i = 0
            }
            if (Columns[i].key == "Brand" && i != 2) {
                Columns[i] = Columns[2]
                Columns[2] = flag
                i = 0
            }
            if (Columns[i].key == "Model" && i != 3) {
                Columns[i] = Columns[3]
                Columns[3] = flag
                i = 0
            }
        }
        return Columns
    }

    btnControl() {
        let _this = this
        if (_this.props.switchData.preCheckScript == undefined || _this.props.switchData.preCheckScript == '') {
            _this.props.handleOk(_this.props.switchData.idCom, _this.props.switchData.setValue, _this.props.switchData.description)
        } else {
            http.post('/tool/evalStringExpression', {
                "str": _this.props.switchData.preCheckScript,  // 脚本
                "mode": "1"  //  0:表示计算历史某个时刻, 1表示计算实时
            }).then(
                res => {
                    if (res.err == 0 && res.data == 0) {
                        Modal.confirm({
                            title: _this.props.switchData.preCheckScriptDescription,
                            content: isEnglish ? 'Click confirm to continue executing the command' : '点击确认可继续执行指令',
                            onOk() {
                                _this.props.handleOk(_this.props.switchData.idCom, _this.props.switchData.setValue, _this.props.switchData.description)
                            },
                            onCancel() {
                                _this.props.switchHide()
                            },
                        });
                    } else {
                        _this.props.handleOk(_this.props.switchData.idCom, _this.props.switchData.setValue, _this.props.switchData.description)
                    }
                }
            ).catch(
                err => {
                    _this.props.handleOk(_this.props.switchData.idCom, _this.props.switchData.setValue, _this.props.switchData.description)
                }
            )
        }
    }

    redisReload = () => {
        let key = localStorage.getItem('modalId')
        http.get(`/updatePageContentIntoRedis/${key}${language == 'en' ? '?lan=en' : ''}`)
            .then(
                dataPage => {
                    if (dataPage.err) {
                        console.error(dataPage.msg);
                    } else {
                        let { templateFileName, templateConfig, isTemplate, pageId } = this.props
                        //更新该弹框的内容在IndexedDB中--重新请求接口：标志是最后一个参数传true
                        this.renderScreen(pageId, isTemplate, templateConfig, templateFileName, true);
                    }
                }
            ).catch(
                error => {
                    console.error(isEnglish ? 'Page update failed!' : '更新页面失败!');
                }
            )

    }

    getWord = () => {
        let data = this.state.dataAssetSource
        let url = 'https://dom-soft-release.oss-cn-shanghai.aliyuncs.com/documents/'
        let ossDirectory = "documents,"
        data.map((item, index) => {
            if (item['en_name'] == 'identity' && item['param_value']) {
                if (item['param_value'].indexOf('AirCompressor') != -1) {
                    url += 'airCompressor/';
                    ossDirectory = ossDirectory + `airCompressor,`
                } else if (item['param_value'].indexOf('Ch') != -1) {
                    url += 'Ch/';
                    ossDirectory = ossDirectory + "Ch,"
                } else if (item['param_value'].indexOf('CWP') != -1) {
                    url += 'CWP/'
                    ossDirectory = ossDirectory + "CWP,"
                } else if (item['param_value'].indexOf('CT') != -1) {
                    url += 'CT/'
                    ossDirectory = ossDirectory + "CT,"
                } else if (item['param_value'].indexOf('PriChWP') != -1) {
                    url += 'PriChWP/'
                    ossDirectory = ossDirectory + "PriChWP,"
                } else if (item['param_value'].indexOf('SecChWP') != -1) {
                    url += 'SecChWP/'
                    ossDirectory = ossDirectory + "SecChWP,"
                } else if (item['param_value'].indexOf('Dryer') != -1) {
                    url += 'Dryer/'
                    ossDirectory = ossDirectory + "Dryer,"
                }
            }
        })
        data.map((item, index) => {
            if (item['en_name'] == 'brand') {
                url += item['param_value'] + '/'
                ossDirectory = ossDirectory + item['param_value'] + ","
            }
        })
        data.map((item, index) => {
            if (item['en_name'] == 'model') {
                url += item['param_value']
                ossDirectory = ossDirectory + item['param_value']
            }
        })

        let _this = this

        const catalogProp = {
            name: 'file',
            action: `${appConfig.serverUrl}/oss/uploadFile`,
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                ossDirectory: ossDirectory,
                ossFileName: "catalog"
            },

            onChange(info) {
                _this.setState({
                    fileList: [...info.fileList]
                })
                if (info.file.status !== 'uploading') {
                    // console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    if (info.file.response.err == 0) {
                        message.success("上传设备样本成功");
                    } else {
                        message.error("上传设备样本失败");
                    }
                    _this.setState({
                        fileList: []
                    })
                } else if (info.file.status === 'error') {
                    message.error("上传设备样本失败");
                    _this.setState({
                        fileList: []
                    })
                }
            },
        };

        const iomProp = {

            name: 'file',
            action: `${appConfig.serverUrl}/oss/uploadFile`,
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                ossDirectory: ossDirectory,
                ossFileName: "Iom"
            },

            onChange(info) {
                _this.setState({
                    fileList: [...info.fileList]
                })
                if (info.file.status !== 'uploading') {

                }
                if (info.file.status === 'done') {
                    if (info.file.response.err == 0) {
                        message.success("上传设备说明书成功");
                    } else {
                        message.error("上传设备说明书失败");
                    }
                    _this.setState({
                        fileList: []
                    })
                } else if (info.file.status === 'error') {
                    message.error("上传设备说明书失败");
                    _this.setState({
                        fileList: []
                    })
                }
            },
        };
        const serviceManualProp = {
            name: 'file',
            action: `${appConfig.serverUrl}/oss/uploadFile`,
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                ossDirectory: ossDirectory,
                ossFileName: "service_manual"
            },

            onChange(info) {
                _this.setState({
                    fileList: [...info.fileList]
                })
                if (info.file.status !== 'uploading') {
                    // console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    if (info.file.response.err == 0) {
                        message.success("上传维修手册成功");
                    } else {
                        message.error("上传维修手册失败");
                    }
                    _this.setState({
                        fileList: []
                    })
                } else if (info.file.status === 'error') {
                    message.error("上传维修手册失败");
                    _this.setState({
                        fileList: []
                    })
                }
            },
        };
        console.log(url)
        return <div style={{ marginTop: '-15px' }}>
            <Tabs activeKey={this.state.activeKey2} onChange={this.callback2}>
                <TabPane tab={isEnglish ? "Equipment Sample" : "设备样本"} key="1">
                    <div>
                        <Upload  {...catalogProp} fileList={this.state.fileList}>
                            <Button>
                                <Icon type="upload" />{isEnglish ? "Upload PDF file" : "上传pdf文件"}
                            </Button>
                        </Upload>
                        {
                            _this.state.fileList.length == 0 && (
                                <object data={url + '/catalog.pdf'} type="application/pdf" width='750' height='500'></object>
                            )
                        }

                    </div>
                </TabPane>
                <TabPane tab={isEnglish ? "Equipment Manual" : "设备说明书"} key="2">

                    <div>
                        <Upload  {...iomProp} fileList={this.state.fileList}>
                            <Button>
                                <Icon type="upload" />{isEnglish ? "Upload PDF file" : "上传pdf文件"}
                            </Button>
                        </Upload>
                        {
                            _this.state.fileList.length == 0 && (
                                <object data={url + '/Iom.pdf'} type="application/pdf" width='750' height='500'></object>
                            )
                        }
                    </div>
                </TabPane>
                <TabPane tab={isEnglish ? "Maintenance Manual" : "维修手册"} key="3">
                    <div>
                        <Upload  {...serviceManualProp} fileList={this.state.fileList}>
                            <Button>
                                <Icon type="upload" />{isEnglish ? "Upload PDF file" : "上传pdf文件"}
                            </Button>
                        </Upload>
                        {
                            _this.state.fileList.length == 0 && (
                                <object data={url + '/service_manual.pdf'} type="application/pdf" width='750' height='500'></object>
                            )
                        }
                    </div>
                </TabPane>
            </Tabs>
        </div>

    }

    getPic = () => {
        let data = this.state.dataAssetSource
        let url = 'https://dom-soft-release.oss-cn-shanghai.aliyuncs.com/documents/' + localStorage.getItem('projectNameInCloud') + '/'
        let ossDirectory = "documents," + localStorage.getItem('projectNameInCloud') + ","
        data.map((item, index) => {
            if (item['en_name'] == 'identity' && item['param_value']) {
                if (item['param_value'].indexOf('AirCompressor') != -1) {
                    url += 'airCompressor/';
                    ossDirectory = ossDirectory + `airCompressor,`
                } else if (item['param_value'].indexOf('Ch') != -1) {
                    url += 'Ch/';
                    ossDirectory = ossDirectory + "Ch,"
                } else if (item['param_value'].indexOf('CWP') != -1) {
                    url += 'CWP/'
                    ossDirectory = ossDirectory + "CWP,"
                } else if (item['param_value'].indexOf('CT') != -1) {
                    url += 'CT/'
                    ossDirectory = ossDirectory + "CT,"
                } else if (item['param_value'].indexOf('PriChWP') != -1) {
                    url += 'PriChWP/'
                    ossDirectory = ossDirectory + "PriChWP,"
                } else if (item['param_value'].indexOf('SecChWP') != -1) {
                    url += 'SecChWP/'
                    ossDirectory = ossDirectory + "SecChWP,"
                } else if (item['param_value'].indexOf('Dryer') != -1) {
                    url += 'Dryer/'
                    ossDirectory = ossDirectory + "Dryer,"
                }
            }
        })
        data.map((item, index) => {
            if (item['en_name'] == 'brand') {
                url += item['param_value'] + '/'
                ossDirectory = ossDirectory + item['param_value'] + ","
            }
        })
        data.map((item, index) => {
            if (item['en_name'] == 'model') {
                url += item['param_value'] + '/'
                ossDirectory = ossDirectory + item['param_value'] + ","
            }
        })
        data.map((item, index) => {
            if (item['en_name'] == 'identity') {
                url += item['param_value']
                ossDirectory = ossDirectory + item['param_value']
            }
        })

        const equipmentProps = this.getEquipmentProps()

        let _this = this

        const pngProp01 = {
            name: 'file',
            action: `http://47.100.17.99/api/asset/saveImg`,
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                projectIdentity: equipmentProps.projectIdentity,
                roomName: equipmentProps.roomName,
                equipAttr: equipmentProps.equipAttr,
                equipNo: equipmentProps.equipNo,
            },

            onChange(info) {
                _this.setState({
                    pngList01: [...info.fileList]
                })
                if (info.file.status !== 'uploading') {
                    // console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    if (info.file.response.err == 0) {
                        // 上传成功后调用addImg接口，成功消息在addImg中显示
                        const fileName = info.file.response.data;
                        if (fileName) {
                            _this.addImageToEquipment(fileName, '外观');
                        }
                    } else {
                        message.error(isEnglish ? "Image upload failed" : "上传图片失败");
                    }
                    _this.setState({
                        pngList01: []
                    })
                } else if (info.file.status === 'error') {
                    message.error("上传图片失败");
                    _this.setState({
                        pngList01: []
                    })
                }
            },
        };
        const pngProp02 = {
            name: 'file',
            action: `http://47.100.17.99/api/asset/saveImg`,
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                projectIdentity: equipmentProps.projectIdentity,
                roomName: equipmentProps.roomName,
                equipAttr: equipmentProps.equipAttr,
                equipNo: equipmentProps.equipNo,
            },

            onChange(info) {
                _this.setState({
                    pngList02: [...info.fileList]
                })
                if (info.file.status == 'uploading') {
                    // console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    if (info.file.response.err == 0) {
                        // 上传成功后调用addImg接口，成功消息在addImg中显示
                        const fileName = info.file.response.data;
                        if (fileName) {
                            _this.addImageToEquipment(fileName, '铭牌');
                        }
                    } else {
                        message.error(isEnglish ? "Image upload failed" : "上传图片失败");
                    }
                    _this.setState({
                        pngList02: []
                    })
                } else if (info.file.status === 'error') {
                    message.error("上传图片失败");
                    _this.setState({
                        pngList02: []
                    })
                }
            },
        };
        const pngProp03 = {
            name: 'file',
            action: `http://47.100.17.99/api/asset/saveImg`,
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                projectIdentity: equipmentProps.projectIdentity,
                roomName: equipmentProps.roomName,
                equipAttr: equipmentProps.equipAttr,
                equipNo: equipmentProps.equipNo,
            },

            onChange(info) {
                _this.setState({
                    pngList03: [...info.fileList]
                })
                if (info.file.status !== 'uploading') {
                    // console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    if (info.file.response.err == 0) {
                        // 上传成功后调用addImg接口，成功消息在addImg中显示
                        const fileName = info.file.response.data;
                        if (fileName) {
                            _this.addImageToEquipment(fileName, '控制中心');
                        }
                    } else {
                        message.error(isEnglish ? "Image upload failed" : "上传图片失败");
                    }
                    _this.setState({
                        pngList03: []
                    })
                } else if (info.file.status === 'error') {
                    message.error("上传图片失败");
                    _this.setState({
                        pngList03: []
                    })
                }
            },
        };


        return (
            <div style={{ marginTop: '-15px' }}>
                <Tabs activeKey={this.state.activeKey3} onChange={this.callback3}>
                    <TabPane tab={
                        <span>
                            {isEnglish ? "Appearance" : "外观"}
                            {this.state.keyImgValid && !this.state.keyImgValid.appearanceValid && (
                                <span style={{
                                    display: 'inline-block',
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: '#ff4d4f',
                                    marginLeft: '8px',
                                    verticalAlign: 'middle'
                                }}></span>
                            )}
                        </span>
                    } key="1">
                        <div>
                            <Upload  {...pngProp01} fileList={this.state.pngList01}>
                                <Button>
                                    <Icon type="upload" />{isEnglish ? "Upload PNG image/video" : "上传png图片/视频"}
                                </Button>
                            </Upload>
                            {
                                _this.state.pngList01.length == 0 && (
                                    <RcViewer>
                                        <div style={{
                                            textAlign: 'center',
                                            maxHeight: '500px',
                                            overflowY: 'auto',
                                            border: '1px solid #d9d9d9',
                                            borderRadius: '6px',
                                            padding: '10px'
                                        }}>
                                            {(() => {
                                                const images = _this.getImagesByType('外观');
                                                if (images.length > 0) {
                                                    console.log('images', images)
                                                    return images.map((fileName, index) => (
                                                        <div key={index} style={{ position: 'relative', display: 'inline-block', marginBottom: 10, marginLeft: 10, marginRight: 10, verticalAlign: 'top' }}>
                                                            {_this.isVideoFile(fileName) ? (

                                                                <video
                                                                    width={300}
                                                                    height={250}
                                                                    controls
                                                                    style={{ display: 'block' }}
                                                                    preload="metadata"
                                                                    onError={(e) => {
                                                                        console.error('视频加载错误:', e);
                                                                        console.log('视频URL:', _this.buildImageUrl(fileName));
                                                                    }}
                                                                    onLoadStart={() => {
                                                                        console.log('开始加载视频:', _this.buildImageUrl(fileName));
                                                                    }}
                                                                    onCanPlay={() => {
                                                                        console.log('视频可以播放');
                                                                    }}
                                                                >
                                                                    {/* <source src={"https://dom-soft-release.oss-cn-shanghai.aliyuncs.com/documents/corteva/default/Ch/01/corteva_default_ch_01_20250911181617.mp4"} type='video/mp4' /> */}
                                                                    {/* <source src={"https://dom-soft-release.oss-cn-shanghai.aliyuncs.com/documents/corteva/default/Ch/01/corteva_default_ch_01_20250911181617.mp4"} type='video/ogg' /> */}
                                                                    <source src={_this.buildImageUrl(fileName)} type={_this.getVideoMimeType(fileName)} />
                                                                    {isEnglish ? 'Your browser does not support video playback.' : '您的浏览器不支持视频播放。'}

                                                                </video>

                                                            ) : (
                                                                <img
                                                                    width={300}
                                                                    alt={`${isEnglish ? 'Appearance Image' : '外观图片'}${index + 1}`}
                                                                    title={fileName}
                                                                    height={250}
                                                                    src={_this.buildImageUrl(fileName)}
                                                                />
                                                            )}
                                                            <Icon
                                                                type="delete"
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: 10,
                                                                    right: 10,
                                                                    fontSize: 20,
                                                                    color: '#ff4d4f',
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                                    borderRadius: '50%',
                                                                    padding: 5,
                                                                    cursor: 'pointer',
                                                                    zIndex: 10
                                                                }}
                                                                onClick={() => {
                                                                    Modal.confirm({
                                                                        title: isEnglish ? 'Confirm Delete' : '确认删除',
                                                                        content: isEnglish ? 'Are you sure to delete this file?' : '确定要删除这个文件吗？',
                                                                        onOk: () => _this.removeImage(fileName)
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                    ));
                                                } else {
                                                    console.log('no images')
                                                    return <img width={433} alt={isEnglish ? "Please upload image" : "请上传图片"} title='01.png' height={400} src={url + '/01.png'} />;
                                                }
                                            })()}
                                        </div>
                                    </RcViewer>
                                )
                            }
                        </div>
                    </TabPane>
                    <TabPane tab={
                        <span>
                            {isEnglish ? "Nameplate" : "铭牌"}
                            {this.state.keyImgValid && !this.state.keyImgValid.nameplateValid && (
                                <span style={{
                                    display: 'inline-block',
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: '#ff4d4f',
                                    marginLeft: '8px',
                                    verticalAlign: 'middle'
                                }}></span>
                            )}
                        </span>
                    } key="2">
                        <div>
                            <Upload  {...pngProp02} fileList={this.state.pngList02}>
                                <Button>
                                    <Icon type="upload" />{isEnglish ? "Upload PNG image/video" : "上传png图片/视频"}
                                </Button>
                            </Upload>
                            {
                                _this.state.pngList02.length == 0 && (
                                    <RcViewer>
                                        <div style={{
                                            textAlign: 'center',
                                            maxHeight: '500px',
                                            overflowY: 'auto',
                                            border: '1px solid #d9d9d9',
                                            borderRadius: '6px',
                                            padding: '10px'
                                        }}>
                                            {(() => {
                                                const images = _this.getImagesByType('铭牌');
                                                if (images.length > 0) {
                                                    return images.map((fileName, index) => (
                                                        <div key={index} style={{ position: 'relative', display: 'inline-block', marginBottom: 10, marginLeft: 10, marginRight: 10, verticalAlign: 'top' }}>
                                                            {_this.isVideoFile(fileName) ? (
                                                                <video
                                                                    width={300}
                                                                    height={250}
                                                                    controls
                                                                    style={{ display: 'block' }}
                                                                    preload="metadata"
                                                                    onError={(e) => {
                                                                        console.error('视频加载错误:', e);
                                                                        console.log('视频URL:', _this.buildImageUrl(fileName));
                                                                    }}
                                                                    onLoadStart={() => {
                                                                        console.log('开始加载视频:', _this.buildImageUrl(fileName));
                                                                    }}
                                                                    onCanPlay={() => {
                                                                        console.log('视频可以播放');
                                                                    }}
                                                                >
                                                                    <source src={_this.buildImageUrl(fileName)} type={_this.getVideoMimeType(fileName)} />
                                                                    {isEnglish ? 'Your browser does not support video playback.' : '您的浏览器不支持视频播放。'}
                                                                </video>
                                                            ) : (
                                                                <img
                                                                    width={300}
                                                                    alt={isEnglish ? `Nameplate Image ${index + 1}` : `铭牌图片${index + 1}`}
                                                                    title={fileName}
                                                                    height={250}
                                                                    src={_this.buildImageUrl(fileName)}
                                                                />
                                                            )}
                                                            <Icon
                                                                type="delete"
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: 10,
                                                                    right: 10,
                                                                    fontSize: 20,
                                                                    color: '#ff4d4f',
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                                    borderRadius: '50%',
                                                                    padding: 5,
                                                                    cursor: 'pointer',
                                                                    zIndex: 10
                                                                }}
                                                                onClick={() => {
                                                                    Modal.confirm({
                                                                        title: isEnglish ? 'Confirm Delete' : '确认删除',
                                                                        content: isEnglish ? 'Are you sure to delete this file?' : '确定要删除这个文件吗？',
                                                                        onOk: () => _this.removeImage(fileName)
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                    ));
                                                } else {
                                                    return <img width={433} alt={isEnglish ? "Please upload image" : "请上传图片"} title='02.png' height={400} src={url + '/02.png'} />;
                                                }
                                            })()}
                                        </div>
                                    </RcViewer>
                                )
                            }
                        </div>
                    </TabPane>
                    <TabPane tab={
                        <span>
                            {isEnglish ? "Control Center" : "控制中心"}
                            {this.state.keyImgValid && !this.state.keyImgValid.controlCenterValid && (
                                <span style={{
                                    display: 'inline-block',
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: '#ff4d4f',
                                    marginLeft: '8px',
                                    verticalAlign: 'middle'
                                }}></span>
                            )}
                        </span>
                    } key="3">
                        <div>
                            <Upload  {...pngProp03} fileList={this.state.pngList03}>
                                <Button>
                                    <Icon type="upload" />{isEnglish ? "Upload PNG image/video" : "上传png图片/视频"}
                                </Button>
                            </Upload>
                            {
                                _this.state.pngList03.length == 0 && (
                                    <RcViewer>
                                        <div style={{
                                            textAlign: 'center',
                                            maxHeight: '500px',
                                            overflowY: 'auto',
                                            border: '1px solid #d9d9d9',
                                            borderRadius: '6px',
                                            padding: '10px'
                                        }}>
                                            {(() => {
                                                const images = _this.getImagesByType('控制中心');
                                                if (images.length > 0) {
                                                    return images.map((fileName, index) => (
                                                        <div key={index} style={{ position: 'relative', display: 'inline-block', marginBottom: 10, marginLeft: 10, marginRight: 10, verticalAlign: 'top' }}>
                                                            {_this.isVideoFile(fileName) ? (
                                                                <video
                                                                    width={300}
                                                                    height={250}
                                                                    controls
                                                                    style={{ display: 'block' }}
                                                                    preload="metadata"
                                                                    onError={(e) => {
                                                                        console.error('视频加载错误:', e);
                                                                        console.log('视频URL:', _this.buildImageUrl(fileName));
                                                                    }}
                                                                    onLoadStart={() => {
                                                                        console.log('开始加载视频:', _this.buildImageUrl(fileName));
                                                                    }}
                                                                    onCanPlay={() => {
                                                                        console.log('视频可以播放');
                                                                    }}
                                                                >
                                                                    <source src={_this.buildImageUrl(fileName)} type={_this.getVideoMimeType(fileName)} />
                                                                    {isEnglish ? 'Your browser does not support video playback.' : '您的浏览器不支持视频播放。'}
                                                                </video>
                                                            ) : (
                                                                <img
                                                                    width={300}
                                                                    alt={isEnglish ? `Control Center Image ${index + 1}` : `控制中心图片${index + 1}`}
                                                                    title={fileName}
                                                                    height={250}
                                                                    src={_this.buildImageUrl(fileName)}
                                                                />
                                                            )}
                                                            <Icon
                                                                type="delete"
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: 10,
                                                                    right: 10,
                                                                    fontSize: 20,
                                                                    color: '#ff4d4f',
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                                    borderRadius: '50%',
                                                                    padding: 5,
                                                                    cursor: 'pointer',
                                                                    zIndex: 10
                                                                }}
                                                                onClick={() => {
                                                                    Modal.confirm({
                                                                        title: isEnglish ? 'Confirm Delete' : '确认删除',
                                                                        content: isEnglish ? 'Are you sure to delete this file?' : '确定要删除这个文件吗？',
                                                                        onOk: () => _this.removeImage(fileName)
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                    ));
                                                } else {
                                                    return <img width={433} alt={isEnglish ? "Please upload image" : "请上传图片"} title='03.png' height={400} src={url + '/03.png'} />;
                                                }
                                            })()}
                                        </div>
                                    </RcViewer>
                                )
                            }
                        </div>
                    </TabPane>
                </Tabs>
            </div>

        )


    }

    // 添加图片到设备
    addImageToEquipment = (fileName, type) => {
        const equipmentProps = this.getEquipmentProps();

        http.post('/equipment/addImg', {
            fileName: fileName,
            type: type,
            roomName: equipmentProps.roomName,
            equipAttr: equipmentProps.equipAttr,
            equipNo: equipmentProps.equipNo
        }).then(res => {
            console.log('addImg', res)
            // 检查响应是否有效
            if (!res) {
                console.log(isEnglish ? 'Image addition failed: No response from interface' : '图片添加失败: 接口无响应')
                message.error(isEnglish ? `${type} image upload failed, please check if the interface is upgraded` : `${type}图片上传失败，请检查接口是否升级`);
                return;
            }

            if (res.err === 0) {
                console.log(isEnglish ? `${type} image added successfully:` : `${type}图片添加成功:`, res.data);
                message.success(isEnglish ? `${type} image upload successful` : `${type}图片上传成功`);
                // 添加成功后重新查询图片列表和检查关键图片
                this.getEquipmentImages();
                this.checkKeyImgValid();
            } else {
                console.log(isEnglish ? 'Image addition failed:' : '图片添加失败:', res.msg || (isEnglish ? 'Unknown error' : '未知错误'))
                message.error(isEnglish ? `${type} image upload failed: ${res.msg || 'Please check if the interface is upgraded'}` : `${type}图片上传失败: ${res.msg || '请检查接口是否升级'}`);
            }
        }).catch(err => {
            console.log('err', err)
            message.error(isEnglish ? `${type} image upload failed, please check if the interface is upgraded` : `${type}图片上传失败，请检查接口是否升级`);
        });
    }

    // 查询设备图片
    getEquipmentImages = () => {
        const equipmentProps = this.getEquipmentProps();

        http.post('/equipment/getImg', {
            roomName: equipmentProps.roomName,
            equipAttr: equipmentProps.equipAttr,
            equipNo: equipmentProps.equipNo
        }).then(res => {
            if (res.err === 0) {
                console.log(isEnglish ? 'Query images successful:' : '查询图片成功:', res.data);
                this.setState({
                    equipmentImages: res.data
                });
            } else {
                console.error(isEnglish ? 'Query images failed:' : '查询图片失败:', res.msg);
            }
        }).catch(err => {
            console.error(isEnglish ? 'Query images error:' : '查询图片错误:', err);
        });
    }

    // 检查关键图片信息
    checkKeyImgValid = () => {
        const equipmentProps = this.getEquipmentProps();

        http.post('/equipment/checkKeyImgValid', {
            roomName: equipmentProps.roomName,
            equipAttr: equipmentProps.equipAttr,
            equipNo: equipmentProps.equipNo
        }).then(res => {
            if (res.err === 0) {
                console.log(isEnglish ? 'Check key images result:' : '检查关键图片结果:', res.data);
                this.setState({
                    keyImgValid: res.data
                });
            } else {
                console.error(isEnglish ? 'Check key images failed:' : '检查关键图片失败:', res.msg);
            }
        }).catch(err => {
            console.error(isEnglish ? 'Check key images error:' : '检查关键图片错误:', err);
        });
    }

    // 等待idCom更新完成
    waitForIdComUpdate = () => {
        let checkCount = 0;
        const maxChecks = 20; // 最多检查20次，每次100ms，总共2秒

        this.idComCheckInterval = setInterval(() => {
            checkCount++;
            const currentIdCom = localStorage.getItem('selectEquipment');
            console.log(isEnglish ? `Check idCom for the ${checkCount}th time:` : `第${checkCount}次检查idCom:`, currentIdCom);

            if (currentIdCom && currentIdCom !== '') {
                clearInterval(this.idComCheckInterval);
                this.idComCheckInterval = null;
                // 查询设备图片
                this.getEquipmentImages();
                // 检查关键图片信息
                this.checkKeyImgValid();
            } else if (checkCount >= maxChecks) {
                clearInterval(this.idComCheckInterval);
                this.idComCheckInterval = null;
                // 即使没有idCom也尝试加载
                this.getEquipmentImages();
                this.checkKeyImgValid();
            }
        }, 100); // 每100ms检查一次
    }

    // 检查并加载图片，等待selectEquipment有值
    checkAndLoadImages = () => {
        // 先检查是否已经有值
        const initialIdCom = localStorage.getItem('selectEquipment');
        if (initialIdCom && initialIdCom !== '') {
            console.log('selectEquipment已有值:', initialIdCom);
            this.getEquipmentImages();
            this.checkKeyImgValid();
            return;
        }

        // 如果没有值，开始轮询
        this.checkInterval = setInterval(() => {
            const idCom = localStorage.getItem('selectEquipment');
            if (idCom && idCom !== '') {
                console.log('检测到selectEquipment有值:', idCom);
                clearInterval(this.checkInterval);
                this.checkInterval = null;
                // 查询设备图片
                this.getEquipmentImages();
                // 检查关键图片信息
                this.checkKeyImgValid();
            }
        }, 500); // 每500ms检查一次

        // 设置最大等待时间，避免无限等待
        this.timeoutId = setTimeout(() => {
            if (this.checkInterval) {
                clearInterval(this.checkInterval);
                this.checkInterval = null;
            }
            // 即使没有selectEquipment也尝试加载
            this.getEquipmentImages();
            this.checkKeyImgValid();
        }, 10000); // 10秒后停止等待
    }

    // 获取特定类型的图片列表
    getImagesByType = (type) => {
        const { equipmentImages } = this.state;
        const equipmentProps = this.getEquipmentProps();

        if (!equipmentImages || !equipmentProps) {
            return [];
        }

        const { roomName, equipAttr, equipNo } = equipmentProps;
        const roomData = equipmentImages[roomName];
        if (!roomData) return [];

        const equipData = roomData[equipAttr];
        if (!equipData) return [];

        const equipNoData = equipData[equipNo];
        if (!equipNoData) return [];

        return equipNoData[type] || [];
    }

    // 构建图片/视频URL
    buildImageUrl = (fileName) => {
        const equipmentProps = this.getEquipmentProps();
        const projectIdentity = equipmentProps.projectIdentity;
        const roomName = equipmentProps.roomName;
        const equipAttr = equipmentProps.equipAttr;
        const equipNo = equipmentProps.equipNo;
        const url = `https://dom-soft-release.oss-cn-shanghai.aliyuncs.com/documents/${projectIdentity}/${roomName}/${equipAttr}/${equipNo}/${fileName}`;
        console.log('构建的URL:', url);
        console.log('文件类型:', this.isVideoFile(fileName) ? '视频' : '图片');
        if (this.isVideoFile(fileName)) {
            console.log('视频MIME类型:', this.getVideoMimeType(fileName));
        }
        return url;
    }

    // 判断文件是否为视频
    isVideoFile = (fileName) => {
        const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v', '.3gp'];
        return videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
    }

    // 获取视频的MIME类型
    getVideoMimeType = (fileName) => {
        const ext = fileName.toLowerCase().split('.').pop();
        const mimeTypes = {
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'ogg': 'video/ogg',
            'avi': 'video/x-msvideo',
            'mov': 'video/quicktime',
            'wmv': 'video/x-ms-wmv',
            'flv': 'video/x-flv',
            'mkv': 'video/x-matroska',
            'm4v': 'video/mp4',
            '3gp': 'video/3gpp'
        };
        return mimeTypes[ext] || 'video/mp4';
    }

    // 删除图片
    removeImage = (fileName) => {
        const equipmentProps = this.getEquipmentProps();

        // 先调用 /asset/removeImg 删除OSS中的图片
        fetch('http://47.100.17.99/api/asset/removeImg', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectIdentity: equipmentProps.projectIdentity,
                roomName: equipmentProps.roomName,
                equipAttr: equipmentProps.equipAttr,
                equipNo: equipmentProps.equipNo,
                fileName: fileName
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(res => {
            if (res.err === 0) {
                console.log('OSS图片删除成功');
                // 再调用 /equipment/removeImg 删除数据库记录
                return http.post('/equipment/removeImg', {
                    fileName: fileName
                });
            } else {
                throw new Error(res.msg || (isEnglish ? 'OSS image deletion failed' : 'OSS图片删除失败'));
            }
        }).then(res => {
            // 检查响应是否有效
            if (!res) {
                console.log(isEnglish ? 'Image deletion failed: No response from interface' : '图片删除失败: 接口无响应')
                message.error(isEnglish ? 'Image deletion failed, please check if the interface is upgraded' : '图片删除失败，请检查接口是否升级');
                return;
            }

            if (res.err === 0) {
                message.success(isEnglish ? 'Image deletion successful' : '图片删除成功');
                // 删除成功后重新查询图片列表和检查关键图片
                this.getEquipmentImages();
                this.checkKeyImgValid();
            } else {
                console.log(isEnglish ? 'Image deletion failed:' : '图片删除失败:', res.msg || (isEnglish ? 'Unknown error' : '未知错误'))
                message.error(isEnglish ? `Image deletion failed: ${res.msg || 'Please check if the interface is upgraded'}` : `图片删除失败: ${res.msg || '请检查接口是否升级'}`);
            }
        }).catch(err => {
            console.error(isEnglish ? 'Delete image error:' : '删除图片错误:', err);
            message.error(isEnglish ? 'Image deletion failed, please check if the interface is upgraded' : '图片删除失败，请检查接口是否升级');
        });
    }

    getEquipmentProps = () => {
        const idCom = localStorage.getItem('selectEquipment')
        console.log('idCom', idCom)

        if (!idCom || idCom === '') {
            return {
                projectIdentity: localStorage.getItem('projectNameInCloud') || 'default',
                roomName: 'default',
                equipAttr: 'default',
                equipNo: 'default'
            }
        }

        let projectIdentity = localStorage.getItem('projectNameInCloud') || 'default'

        // 获取 roomName - 第一个下划线之前的字符串
        let roomName = 'default';
        const firstUnderscoreIndex = idCom.indexOf('_');
        if (firstUnderscoreIndex !== -1) {
            roomName = idCom.substring(0, firstUnderscoreIndex);
        }

        // 获取 equipAttr - 从 dataAssetSource 中查询匹配的字段
        let equipAttr = 'default';
        if (idCom.indexOf('AirCompressor') != -1) {
            equipAttr = 'AirCompressor';
        } else if (idCom.indexOf('PriChWP') != -1) {
            equipAttr = 'PriChWP';
        } else if (idCom.indexOf('SecChWP') != -1) {
            equipAttr = 'SecChWP';
        } else if (idCom.indexOf('Ch') != -1) {
            equipAttr = 'Ch';
        } else if (idCom.indexOf('CWP') != -1) {
            equipAttr = 'CWP';
        } else if (idCom.indexOf('CT') != -1) {
            equipAttr = 'CT';
        } else if (idCom.indexOf('Dryer') != -1) {
            equipAttr = 'Dryer';
        }


        // 获取 equipNo - OnOff 字符串后面的字符串
        let equipNo = 'default';
        const onOffIndex = idCom.indexOf('OnOff');
        if (onOffIndex !== -1) {
            equipNo = idCom.substring(onOffIndex + 5); // 跳过 "OnOff" 4个字符
        }

        return {
            projectIdentity,
            roomName,
            equipAttr,
            equipNo
        }
    }

    onChangeSlider = (value) => {
        if (this.props.pointInfo) {
            if (this.props.pointInfo.low && value == this.props.pointInfo.low) {
                if (this.state.textValue < this.props.pointInfo.low) {
                    return
                }
            } else if (this.props.pointInfo.hight && value == this.props.pointInfo.hight && this.state.textValue > this.props.pointInfo.hight) {
                return
            }
        }
        this.props.form.setFieldsValue({
            settingValue: value
        })
        this.setState({
            textValue: value
        })
    }

    callback = (key) => {
        this.setState({
            activeKey: key
        })
    }
    callback2 = (key) => {
        this.setState({
            activeKey2: key
        })
    }
    callback3 = (key) => {
        this.setState({
            activeKey3: key
        })
    }

    getRectanglePanel() {
        const { floatRectanglesPanelList, float_rectangles_panel_data } = this.props
        let panels = []
        try {
            floatRectanglesPanelList.forEach(row => {
                const { width, height, left, top } = this.getStyle(row['calH'], row['calW'], row['calX'], row['calY'])
                cardWrap = cardWrapList[row.rectStyle - 1]
                if (float_rectangles_panel_data != undefined && float_rectangles_panel_data.length > 0) {
                    float_rectangles_panel_data.forEach(item => {
                        if (row.pointList.length > 0) {
                            row.pointList.map(obj => {
                                //找出对应点值
                                if (item.name === obj.name && item.value != undefined) {
                                    //根据配置保留小数位数
                                    if (obj.decimal != undefined) {
                                        obj['value'] = Number(item.value).toFixed(obj.decimal)
                                    } else {
                                        obj['value'] = item.value
                                    }
                                }
                            })
                        }
                    })
                    panels.push(
                        this.getPanel(row, width, height, left, top)
                    )
                } else {
                    //当面板没有绑点的时候，也支持显示标题和边框
                    panels.push(
                        this.getPanel(row, width, height, left, top)
                    )
                }
            })

        } catch (err) {
            console.error(err)
        }

        return panels
    }

    getPanel(row, width, height, left, top) {
        return (
            <div className={cardWrap} >
                {
                    row.pointList.length > 0 ?
                        <Card title={row.title} headStyle={{
                            color: row.titleColor ? row.titleColor : '',
                            borderTopLeftRadius: row.roundOrNot == 1 ? (row.roundXPox ? row.roundXPox : '') : '',
                            borderTopRightRadius: row.roundOrNot == 1 ? (row.roundXPox ? row.roundXPox : '') : '',
                            fontSize: row.titleSize ? row.titleSize : ''
                        }}
                            bodyStyle={{
                                borderBottomLeftRadius: row.roundOrNot == 1 ? (row.roundYPox ? row.roundYPox : '') : '',
                                borderBottomRightRadius: row.roundOrNot == 1 ? (row.roundYPox ? row.roundYPox : '') : '',
                            }}
                            style={{
                                backgroundColor: row.fillColor + ",0)",
                                zIndex: 2,
                                position: 'absolute',
                                top: top,
                                left: left,
                                width: width,
                                height: height,
                                borderBottomLeftRadius: row.roundOrNot == 1 ? (row.roundYPox ? row.roundYPox : '') : '',
                                borderBottomRightRadius: row.roundOrNot == 1 ? (row.roundYPox ? row.roundYPox : '') : '',
                                borderTopLeftRadius: row.roundOrNot == 1 ? (row.roundXPox ? row.roundXPox : '') : '',
                                borderTopRightRadius: row.roundOrNot == 1 ? (row.roundXPox ? row.roundXPox : '') : '',
                            }} >
                            {
                                row.pointList.map(item => {
                                    return (
                                        <div style={{ fontSize: row.bodySize, lineHeight: "30px" }}>
                                            <div style={{ width: '70%', float: 'left', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <img src={appConfig.imageUrl + `/${item.img}.png`} alt="" style={{ marginRight: '10px', width: row.bodySize + 5 + 'px' }} />
                                                <span style={{ color: row.descColor ? row.descColor : '' }}>{item.desc}</span>
                                            </div>
                                            <div style={{ width: '30%', float: 'right', color: row.bodyColor ? row.bodyColor : '' }}>
                                                <div style={{ float: 'left', cursor: "pointer" }} onContextMenu={(e) => this.onContextMenu(e, item.value, item.desc, item.name, item.type)}>{item.value}</div>
                                                <div style={{ float: 'right' }}>{item.unit}</div>
                                                <div style={{ clear: 'both' }}></div>
                                            </div>
                                            {/* <span style={{position: 'absolute',  left:row.bodySize +40+'px',color:row.descColor,fontSize:row.descSize}} >{item.desc}</span>
                                        <span style={{position: 'absolute',right:'73px',color:row.bodyColor,fontSize:row.bodySize,cursor:"pointer"}} onContextMenu={(e)=>this.onContextMenu(e,item.value,item.desc,item.name)} >{item.value}</span>
                                        <span style={{position: 'absolute',right:'20px',color:row.bodyColor,fontSize:row.bodySize}} >{item.unit}</span> */}
                                        </div>

                                    )

                                })
                            }
                        </Card>

                        :
                        <div style={{ pointerEvents: 'none' }}>
                            <Card
                                title={row.title}
                                style={{ backgroundColor: row.fillColor + ",0)", zIndex: 2, position: 'absolute', top: top, left: left, width: width, height: height }}
                                headStyle={{
                                    color: row.titleColor ? row.titleColor : '',
                                    borderTopLeftRadius: row.roundOrNot == 1 ? (row.roundXPox ? row.roundXPox : '') : '',
                                    borderTopRightRadius: row.roundOrNot == 1 ? (row.roundXPox ? row.roundXPox : '') : '',
                                    fontSize: row.titleSize ? row.titleSize : ''
                                }}
                            >
                                {
                                    row.pointList.map(item => {
                                        return (
                                            <p>
                                                <img src={appConfig.imageUrl + `/${item.img}.png`} alt="" style={{ height: row.bodySize + "px", width: row.bodySize, verticalAlign: "baseline" }} />
                                                <span style={{ position: 'absolute', left: row.bodySize + 40 + 'px', color: row.descColor, fontSize: row.descSize }} >{item.desc}</span>
                                                <span style={{ position: 'absolute', right: '73px', color: row.bodyColor, fontSize: row.bodySize, cursor: "pointer" }} onContextMenu={(e) => this.onContextMenu(e, item.value, item.desc, item.name, item.type)} >{item.value}</span>
                                                <span style={{ position: 'absolute', right: '20px', color: row.bodyColor, fontSize: row.bodySize }} >{item.unit}</span>
                                            </p>
                                        )

                                    })
                                }
                            </Card>
                        </div>

                }
            </div>


        )
    }

    //右击文本事件
    onContextMenu(e, value, desc, pointName, type) {
        e.preventDefault()
        // 设置属性是否在弹窗里面
        let isInfo = {
            "isInModal": false
        }
        e.offsetX = e.clientX - 5,
            e.offsetY = e.clientY - 90
        //重新定义函数，继承原函数所有的属性和函数        
        let model = new ModelText()
        model.options = {
            getTendencyModal: this.props.getTendencyModal,
            showCommonAlarm: this.props.showCommonAlarm,
            showMainInterfaceModal: this.props.showMainInterfaceModal,
            getToolPoint: this.props.getToolPoint
        }
        model.description = desc
        model.idCom = pointName
        model.value = value
        model.sourceType = type
        let clientWidth = document.body.clientWidth,
            clientHeight = document.body.clientHeight - 32 - 56 - 48;
        let widthScale = 0, heightScale = 0;
        widthScale = clientWidth / 1920
        heightScale = clientHeight / 955
        model.showModal(e, isInfo, widthScale, heightScale)
    }

    loginCheck = (idCom, setValue, description) => {
        http.post('/login', {
            name: JSON.parse(localStorage.getItem('userInfo')).name,
            pwd: pwd
        }).then(
            res => {
                if (res.err == 0) {
                    localStorage.setItem('token', res.token)
                    appConfig.token = res.token
                    //如果用户密码验证成功，再弹出设定值弹框
                    this.props.textSetting(idCom, setValue, description)
                } else {
                    Modal.error({
                        title: isEnglish ? 'Error' : '错误提示',
                        content: isEnglish ? 'User password verification failed!' : '用户密码验证失败！'
                    })
                }
                pwd = ''
            }
        ).catch(
            err => {
                pwd = ''
                Modal.error({
                    title: isEnglish ? 'Error' : '错误提示',
                    content: isEnglish ? 'User password verification failed!' : '用户密码验证失败！'
                });
            }
        )
    }

    changePwd = (e) => {
        pwd = e.target.value
    }

    userCheck = (idCom, setValue, description) => {
        Modal.confirm({
            title: isEnglish ? 'User Verification' : '用户验证',
            content: (
                <div>
                    <span style={{ display: 'inline-block', width: 80 }}>{isEnglish ? 'Username' : '用户名'}：</span>
                    <Input
                        style={{ marginTop: '10px', width: 180, display: 'inline-block', }}
                        disabled={true}
                        value={window.localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''}
                    />
                    <div>
                        <span style={{ display: 'inline-block', width: 80 }}>{isEnglish ? 'Password' : '密码'}：</span>
                        <InputPwd
                            style={{ marginTop: '10px', width: 180 }}
                            onChange={this.changePwd}
                        />
                    </div>
                </div>
            ),
            onOk: () => { this.loginCheck(idCom, setValue, description) },
            onCancel: () => { },
            okText: isEnglish ? 'Comfirm' : "确认",
            width: 400
        })
    }

    radioSubmit = (radioData) => {
        if (radioData.idCom.indexOf('MaintainOnOff') != -1) {
            this.userCheck(radioData.idCom, radioData.setValue, radioData.description)
        } else {
            this.props.textSetting(radioData.idCom, radioData.setValue, radioData.description)
        }
    }

    /**
     * 
     * 
     * @returns 
     * @memberof ObserverModalForm
     */
    render() {
        let {
            visible,
            hideModal,
            title,
            pointInfo,
            textData,
            checkboxData,
            switchData,
        } = this.props
        visible = typeof visible === 'undefined' ? true : visible;
        const { getFieldDecorator } = this.props.form;
        const formItemLayoutText = {
            labelCol: {
                span: 8
            },
            wrapperCol: {
                span: 15
            },
        };
        if (visible == true) {
            localStorage.setItem("ModalOnOff", 1)
        }
        if (this.state.titleName != '' && this.state.titleName != undefined) {
            title = this.state.titleName
        }
        let assetColumns = isEnglish ? [
            { title: 'Name', dataIndex: 'en_name', key: 'en_name', width: 120 },
            { title: 'Value', dataIndex: 'param_value', key: 'param_value', width: 120 }
        ] : [
            { title: '属性中文称', dataIndex: 'cn_name', key: 'cn_name', width: 80 },
            { title: '属性英文称', dataIndex: 'en_name', key: 'en_name', width: 80 },
            { title: '属性值', dataIndex: 'param_value', key: 'param_value', width: 80 }
        ]
        return (
            <Modal
                title={title || (isEnglish ? 'Equipment Details' : '设备详情')}
                visible={visible}
                onCancel={() => {
                    hideModal()
                    this.observerScreen.cancelGetSystemEquipmentPage()
                    localStorage.removeItem('modalId')
                }}
                footer={null}
                width="auto"
                maskClosable={false}
                zIndex={999}
                wrapClassName={str}
            >
                {this.getChangeBtns()}
                <Spin tip={isEnglish ? "Loading page..." : "Loading..."} spinning={this.state.loading} wrapperClassName="absolute-spin">
                    <div
                        id="observerModalContainer"
                        className={s['container']}>
                        <div
                            ref={ref => { this.container = ref }}
                            className={s['observer-container']}>
                        </div>
                        {
                            this.props.navJsonConfig || this.props.navigation ?
                                <div style={{ position: 'absolute', top: '-87px', right: '30px' }}>
                                    <div style={{ display: 'inline-block', marginRight: '15px' }} onClick={() => { this.redisReload() }} title='redis缓存更新'>
                                        <Icon className={s['topIcon']} type="reload" style={{ fontSize: '18', cursor: "pointer" }} />
                                    </div>
                                    <div style={{ display: 'inline-block', position: 'relative' }} onClick={() => { this.getEquipmentInfo() }} title='设备铭牌'>
                                        <Icon className={s['topIcon']} type="profile" style={{ fontSize: '18', cursor: "pointer" }} />
                                        {this.state.keyImgValid && (!this.state.keyImgValid.appearanceValid || !this.state.keyImgValid.nameplateValid || !this.state.keyImgValid.controlCenterValid) ? (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '-8px',
                                                    right: '-8px',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '8px solid transparent',
                                                    borderRight: '8px solid transparent',
                                                    borderBottom: '12px solid #faad14',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        position: 'absolute',
                                                        top: '2px',
                                                        color: 'white',
                                                        fontSize: '10px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    !
                                                </span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                :
                                <div style={{ position: 'absolute', top: '-60px', right: '30px' }}>
                                    <div style={{ display: 'inline-block', marginRight: '15px' }} onClick={() => { this.redisReload() }} title='redis缓存更新'>
                                        <Icon className={s['topIcon']} type="reload" style={{ fontSize: '18', cursor: "pointer" }} />
                                    </div>
                                    <div style={{ display: 'inline-block', position: 'relative' }} onClick={() => { this.getEquipmentInfo() }} title='设备铭牌'>
                                        <Icon className={s['topIcon']} type="profile" style={{ fontSize: '18', cursor: "pointer" }} />
                                        {this.state.keyImgValid && (!this.state.keyImgValid.appearanceValid || !this.state.keyImgValid.nameplateValid || !this.state.keyImgValid.controlCenterValid) ? (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '-8px',
                                                    right: '-8px',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '8px solid transparent',
                                                    borderRight: '8px solid transparent',
                                                    borderBottom: '12px solid #faad14',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        position: 'absolute',
                                                        top: '2px',
                                                        color: 'white',
                                                        fontSize: '10px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    !
                                                </span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                        }
                        {!this.state.loading && this.getComponent()}
                        {!this.state.loading && this.getRectanglePanel()}
                    </div>
                </Spin>

                {/*设备指令模态框*/}
                {
                    this.props.isLoading ?
                        <Modal
                            wrapClassName={instructionStr}
                            title={isEnglish ? 'Command Setting Progress' : '指令设置进度提示'}
                            visible={this.props.switchVisible}
                            onOk={() => this.props.handleOk(switchData.idCom, switchData.setValue, switchData.description)}
                            onCancel={this.props.switchHide}
                            footer={
                                [
                                    <Button id="switchChangeBtn" autoFocus onClick={() => this.props.handleOk(switchData.idCom, switchData.setValue, switchData.description)} >{isEnglish ? 'Confirm' : '确认'}</Button>
                                ]
                            }
                            maskClosable={false}
                            destroyOnClose
                        >
                            <Spin tip={this.props.modalConditionDict.status ? (switchData.description != '' ? (isEnglish ? `Processing ${switchData.description}` : `正在${switchData.description}`) : (isEnglish ? `Modifying point ${switchData.idCom} value to ${switchData.setValue}` : `正在将点位 ${switchData.idCom} 的值修改为 ${switchData.setValue}`)) : this.props.modalConditionDict.description}>
                                <Alert
                                    message={isEnglish ? "Notice" : "提示"}
                                    description={isEnglish ? "Data is being updated" : "数据正在更新"}
                                    type="info"
                                />
                            </Spin>
                        </Modal>
                        :
                        <Modal
                            wrapClassName={instructionStr}
                            title={isEnglish ? 'Confirm Command' : '确认指令'}
                            visible={this.props.switchVisible}
                            onOk={() => this.props.handleOk(switchData.idCom, switchData.setValue, switchData.description)}
                            onCancel={this.props.switchHide}
                            footer={
                                [
                                    <Button onClick={this.props.switchHide} >{isEnglish ? 'Cancel' : '取消'}</Button>,
                                    <Button id="switchChangeBtn" onClick={() => this.btnControl()} >{isEnglish ? 'Confirm' : '确认'}</Button>
                                ]
                            }
                            maskClosable={false}
                            destroyOnClose
                        >
                            <div>
                                {
                                    switchData.description != '' ?
                                        <span>{isEnglish ? `Are you sure to ${switchData.description}?` : `确定要 ${switchData.description}吗？`}</span>
                                        :
                                        <span>{isEnglish ? `Are you sure to modify point ${switchData.idCom} value to ${switchData.setValue}?` : `确定要将点位 ${switchData.idCom} 的值修改为 ${switchData.setValue} 吗？`}</span>
                                }
                            </div>
                        </Modal>
                }
                {/*checkbox模态框*/}
                {
                    this.props.isLoading ?
                        <Modal
                            wrapClassName={instructionStr}
                            title={isEnglish ? 'Command Setting Progress' : '指令设置进度提示'}
                            visible={this.props.checkboxVisible}
                            onOk={() => this.props.checkboxSetting(checkboxData.idCom, checkboxData.setValue, checkboxData.text, checkboxData.unsetValue, checkboxData.currentValue, checkboxData.desc)}
                            onCancel={this.props.checkboxHide}
                            footer={
                                [
                                    <Button id="checkboxChangeBtn" onClick={() => this.props.checkboxSetting(checkboxData.idCom, checkboxData.setValue, checkboxData.text, checkboxData.unsetValue, checkboxData.currentValue, checkboxData.desc)} >{isEnglish ? 'Confirm' : '确认'}</Button>
                                ]
                            }
                            maskClosable={false}
                            destroyOnClose
                        >
                            <Spin tip={this.props.modalConditionDict.status ? (isEnglish ? `Processing ${checkboxData.checkboxState ? 'uncheck' : 'check'} ${checkboxData.desc}` : `正在${checkboxData.checkboxState ? '取消勾选' : '勾选'} ${checkboxData.desc} `) : this.props.modalConditionDict.description}>
                                <Alert
                                    message={isEnglish ? "Notice" : "提示"}
                                    description={isEnglish ? "Data is being updated" : "数据正在更新"}
                                    type="info"
                                />
                            </Spin>
                        </Modal>
                        :
                        <Modal
                            wrapClassName={instructionStr}
                            title={isEnglish ? 'Confirm Command' : '确认指令'}
                            visible={this.props.checkboxVisible}
                            onOk={() => this.props.checkboxSetting(checkboxData.idCom, checkboxData.setValue, checkboxData.text, checkboxData.unsetValue, checkboxData.currentValue, checkboxData.desc)}
                            onCancel={this.props.checkboxHide}
                            footer={
                                [
                                    <Button onClick={this.props.checkboxHide} >{isEnglish ? 'Cancel' : '取消'}</Button>,
                                    <Button id="checkboxChangeBtn" onClick={() => this.props.checkboxSetting(checkboxData.idCom, checkboxData.setValue, checkboxData.text, checkboxData.unsetValue, checkboxData.currentValue, checkboxData.desc)} >{isEnglish ? 'Confirm' : '确认'}</Button>
                                ]
                            }
                            maskClosable={false}
                            destroyOnClose
                        >
                            <div>
                                {isEnglish ? `Are you sure to ${checkboxData.checkboxState ? 'uncheck' : 'check'} ${checkboxData.desc}?` : `是否确定${checkboxData.checkboxState ? '取消勾选' : '勾选'} ${checkboxData.desc} ？`}
                            </div>
                        </Modal>
                }

                {/*修改设定值*/}
                {
                    this.props.isLoading ?
                        <Modal
                            wrapClassName={instructionStr}
                            title={isEnglish ? 'Command Setting Progress' : '指令设置进度提示'}
                            visible={this.props.textVisible}
                            onOk={this.handleText}
                            onCancel={this.props.textHide}
                            confirmLoading={this.props.isLoading}
                            destroyOnClose
                            footer={
                                [
                                    <Button id="textChangeBtn" onClick={this.handleText} >{isEnglish ? 'Confirm' : '确认'}</Button>
                                ]
                            }
                            maskClosable={false}
                        >
                            <Spin tip={isEnglish ? "Modifying setting value" : "正在修改设定值"} >
                                <Alert
                                    message={isEnglish ? "Notice" : "提示"}
                                    description={isEnglish ? "Data is being updated" : "数据正在更新"}
                                    type="info"
                                />
                            </Spin>
                        </Modal>
                        :
                        <Modal
                            wrapClassName={instructionStr}
                            title={isEnglish ? 'Confirm Command' : '确认指令'}
                            visible={this.props.textVisible}
                            onOk={this.handleText}
                            onCancel={this.props.textHide}
                            confirmLoading={this.props.isLoading}
                            destroyOnClose
                            footer={
                                [
                                    <Button onClick={this.props.textHide} >{isEnglish ? 'Cancel' : '取消'}</Button>,
                                    <Button id="textChangeBtn" onClick={this.handleText} >{isEnglish ? 'Confirm' : '确认'}</Button>
                                ]
                            }
                            maskClosable={false}
                        >
                            <Form onSubmit={this.handleText}>
                                <FormItem
                                    {...formItemLayoutText}
                                    label={isEnglish ? "Current Value:" : "当前值："}
                                >
                                    {getFieldDecorator('currentValue', {
                                        initialValue: textData.showMode != 2 ? parseFloat(textData.currentValue).toFixed(2) : textData.currentValue,
                                    })(
                                        <Input style={{ width: 160 }} disabled={true} />
                                    )}
                                </FormItem>
                                {
                                    textData.showMode == 2 ?
                                        <FormItem
                                            {...formItemLayoutText}
                                            label={isEnglish ? "Set New Value" : "设置新值"}
                                        >
                                            {getFieldDecorator('settingValue', {
                                                initialValue: textData.currentValue == " " ? undefined : moment(textData.currentValue, format),
                                            })(
                                                <TimePicker format={format} onChange={this.handleChangeTime} />
                                            )}
                                        </FormItem>
                                        :
                                        this.state.isLimit ?
                                            <FormItem
                                                {...formItemLayoutText}
                                                label={isEnglish ? "Set New Value" : "设置新值"}
                                            >
                                                {getFieldDecorator('settingValue', {
                                                    initialValue: textData.currentValue == '--' ? undefined : textData.currentValue,
                                                })(
                                                    <InputNumber
                                                        onPressEnter={() => {
                                                            this.props.form.setFieldsValue({ settingValue: this.state.textValue })
                                                            this.handleText
                                                        }}
                                                        //自动聚焦
                                                        autoFocus
                                                        //自动全选
                                                        parser={(value) => value.replace(/[^\d.-]/g, '')}
                                                        ref={(input) => { input.inputNumberRef.input.select() }}
                                                        style={{ width: 160 }}
                                                        // min={pointInfo.low}
                                                        // max={pointInfo.hight}
                                                        onChange={this.handleChange}
                                                        precision={2}
                                                    />
                                                )}
                                            </FormItem>
                                            :
                                            <FormItem
                                                {...formItemLayoutText}
                                                label={isEnglish ? "Set New Value" : "设置新值"}
                                            >
                                                {getFieldDecorator('settingValue', {
                                                    initialValue: textData.currentValue == '--' ? undefined : textData.currentValue,
                                                })(
                                                    <InputNumber
                                                        //自动聚焦
                                                        autoFocus
                                                        //自动全选
                                                        ref={(input) => { input.inputNumberRef.input.select() }}
                                                        style={{ width: 160 }}
                                                        onChange={this.handleChange}
                                                        precision={2}
                                                    />
                                                )}
                                            </FormItem>
                                }
                                {
                                    textData.showMode != 2 ?
                                        this.state.isLimit ?
                                            pointInfo && pointInfo.hight !== undefined && pointInfo.low !== undefined && pointInfo.hight !== '' && pointInfo.low !== '' ?
                                                <FormItem
                                                    {...formItemLayoutText}
                                                    label={isEnglish ? "Slider Assignment" : "滑动赋值"}
                                                >
                                                    <Slider
                                                        marks={{
                                                            [pointInfo.low]: { label: pointInfo.low },
                                                            [pointInfo.hight]: { label: pointInfo.hight }
                                                        }}
                                                        max={
                                                            pointInfo.hight
                                                        }
                                                        min={
                                                            pointInfo.low
                                                        }
                                                        step={(pointInfo.hight - pointInfo.low) > 10 ? 1 : 0.1}
                                                        onChange={this.onChangeSlider}
                                                        defaultValue={Number(this.props.form.getFieldValue('settingValue'))}
                                                    />
                                                </FormItem>
                                                :
                                                pointInfo && pointInfo.hight !== undefined && pointInfo.hight !== '' ?
                                                    <FormItem
                                                        {...formItemLayoutText}
                                                        label={isEnglish ? "Slider Assignment" : "滑动赋值"}
                                                    >
                                                        <Slider
                                                            marks={{
                                                                [Math.floor(Number(textData.currentValue) * 0.9)]: { label: Math.floor(Number(textData.currentValue) * 0.9) },
                                                                [pointInfo.hight]: { label: pointInfo.hight }
                                                            }}
                                                            max={
                                                                pointInfo.hight
                                                            }
                                                            min={
                                                                Math.floor(Number(textData.currentValue) * 0.9)
                                                            }
                                                            step={(pointInfo.hight - Math.floor(Number(textData.currentValue) * 0.9)) > 10 ? 1 : 0.1}
                                                            onChange={this.onChangeSlider}
                                                            defaultValue={Number(this.props.form.getFieldValue('settingValue'))}
                                                        />
                                                    </FormItem>
                                                    :
                                                    pointInfo && pointInfo.low !== undefined && pointInfo.low !== '' ?
                                                        <FormItem
                                                            {...formItemLayoutText}
                                                            label={isEnglish ? "Slider Assignment" : "滑动赋值"}
                                                        >
                                                            <Slider
                                                                marks={{
                                                                    [pointInfo.low]: { label: pointInfo.low },
                                                                    [Math.ceil(Number(textData.currentValue) * 1.1 == 0 ? 1 : Number(textData.currentValue) * 1.1)]: { label: Math.ceil(Number(textData.currentValue) * 1.1 == 0 ? 1 : Number(textData.currentValue) * 1.1) }
                                                                }}
                                                                max={
                                                                    Math.ceil(Number(textData.currentValue) * 1.1 == 0 ? 1 : Number(textData.currentValue) * 1.1)
                                                                }
                                                                min={
                                                                    pointInfo.low
                                                                }
                                                                step={(Math.ceil(Number(textData.currentValue) * 1.1) - pointInfo.low) > 10 ? 1 : 0.1}
                                                                onChange={this.onChangeSlider}
                                                                defaultValue={Number(this.props.form.getFieldValue('settingValue'))}
                                                            />
                                                        </FormItem>
                                                        :
                                                        ''
                                            :
                                            <FormItem
                                                {...formItemLayoutText}
                                                label={isEnglish ? "Slider Assignment" : "滑动赋值"}
                                            >
                                                {
                                                    textData.currentValue >= 0 ?
                                                        <Slider
                                                            marks={
                                                                textData.idCom.indexOf('VSDFreqSetting') != -1 && textData.currentValue == 0 ?
                                                                    {
                                                                        [50]: { label: 50 },
                                                                        [20]: { label: 20 }
                                                                    }
                                                                    :
                                                                    {
                                                                        [Math.floor(Number(textData.currentValue) * 0.9)]: { label: Math.floor(Number(textData.currentValue) * 0.9) },
                                                                        [Math.ceil(Number(textData.currentValue) * 1.1 == 0 ? 1 : Number(textData.currentValue) * 1.1)]: { label: Math.ceil(Number(textData.currentValue) * 1.1 == 0 ? 1 : Number(textData.currentValue) * 1.1) }
                                                                    }}
                                                            max={
                                                                textData.idCom.indexOf('VSDFreqSetting') != -1 && textData.currentValue == 0 ?
                                                                    50
                                                                    :
                                                                    Math.ceil(Number(textData.currentValue) * 1.1 == 0 ? 1 : Number(textData.currentValue) * 1.1)
                                                            }
                                                            min={
                                                                textData.idCom.indexOf('VSDFreqSetting') != -1 && textData.currentValue == 0 ?
                                                                    20
                                                                    :
                                                                    Math.floor(Number(textData.currentValue) * 0.9)
                                                            }
                                                            step={0.1}
                                                            onChange={this.onChangeSlider}
                                                            defaultValue={Number(this.props.form.getFieldValue('settingValue'))}
                                                        />
                                                        :
                                                        <Slider
                                                            marks={{
                                                                [Math.floor(Number(textData.currentValue) * 1.1)]: { label: Math.floor(Number(textData.currentValue) * 1.1) },
                                                                [Math.ceil(Number(textData.currentValue) * 0.9)]: { label: Math.ceil(Number(textData.currentValue) * 0.9) }
                                                            }}
                                                            max={
                                                                Math.ceil(Number(textData.currentValue) * 0.9)
                                                            }
                                                            min={
                                                                Math.floor(Number(textData.currentValue) * 1.1)
                                                            }
                                                            step={0.1}
                                                            onChange={this.onChangeSlider}
                                                            defaultValue={Number(this.props.form.getFieldValue('settingValue'))}
                                                        />
                                                }

                                            </FormItem>
                                        :
                                        ''
                                }
                            </Form>
                        </Modal>
                }


                {/*切换设备状态*/}
                {
                    this.props.isLoading ?
                        <Modal
                            wrapClassName={instructionStr}
                            title={isEnglish ? 'Command Setting Progress' : '指令设置进度提示'}
                            visible={this.props.radioVisible}
                            onOk={() => this.props.textSetting(this.props.radioData.idCom, this.props.radioData.setValue, this.props.radioData.description)}
                            onCancel={this.props.radioHide}
                            footer={
                                [
                                    <Button id="radioChangeBtn" onClick={() => this.props.textSetting(this.props.radioData.idCom, this.props.radioData.setValue, this.props.radioData.description)} >{isEnglish ? 'Confirm' : '确认'}</Button>
                                ]
                            }
                            maskClosable={false}
                            destroyOnClose
                        >
                            <Spin tip={this.props.modalConditionDict.status ? (isEnglish ? `Processing ${this.props.radioData.description}` : `正在${this.props.radioData.description}`) : this.props.modalConditionDict.description}>
                                <Alert
                                    message={isEnglish ? "Notice" : "提示"}
                                    description={isEnglish ? "Data is being updated" : "数据正在更新"}
                                    type="info"
                                />
                            </Spin>
                        </Modal>
                        :
                        <Modal
                            wrapClassName={instructionStr}
                            title={isEnglish ? 'Confirm Command' : '确认指令1'}
                            visible={this.props.radioVisible}
                            onOk={() =>
                                this.radioSubmit(this.props.radioData)
                            }
                            onCancel={this.props.radioHide}
                            footer={
                                [
                                    <Button onClick={this.props.radioHide} >{isEnglish ? 'Cancel' : '取消'}</Button>,
                                    <Button id="radioChangeBtn" onClick={() => this.radioSubmit(this.props.radioData)} >{isEnglish ? 'Confirm' : '确认'}</Button>
                                ]
                            }
                            maskClosable={false}
                            destroyOnClose
                        >
                            <div>
                                {
                                    this.props.radioData.description != '' && this.props.radioData.description != undefined ?
                                        (isEnglish ? `Are you sure to ${this.props.radioData.description}?` : `确定要 ${this.props.radioData.description} 吗？`)
                                        :
                                        (isEnglish ? `Are you sure to switch to "${this.props.radioData.text}"?` : `确定要切换至 "${this.props.radioData.text}" 吗？`)
                                }
                            </div>
                        </Modal>
                }
                {
                    this.props.isLoading ?
                        <Modal
                            wrapClassName={instructionStr}
                            title={isEnglish ? 'Command Setting Progress' : '指令设置进度提示'}
                            visible={this.props.selectVisible}
                            onOk={() => this.props.textSetting(this.props.selectData.idCom, this.state.selectValue)}
                            onCancel={this.props.selectHide}
                            footer={
                                [
                                    <Button id="selectChangeBtn" onClick={() => this.props.textSetting(this.props.selectData.idCom, this.state.selectValue)} >{isEnglish ? 'Confirm' : '确认'}</Button>
                                ]
                            }
                            maskClosable={false}
                            destroyOnClose
                        >

                            <Spin tip={isEnglish ? "Setting fault alarm information" : "正在设置故障报警信息"}>
                                <Alert
                                    message={isEnglish ? "Notice" : "提示"}
                                    description={isEnglish ? "Data is being updated" : "数据正在更新"}
                                    type="info"
                                />
                            </Spin>
                        </Modal>
                        :
                        <Modal
                            wrapClassName={instructionStr}
                            title={isEnglish ? 'Confirm Command' : '确认指令'}
                            visible={this.props.selectVisible}
                            onOk={() => this.props.textSetting(this.props.selectData.idCom, this.state.selectValue)}
                            onCancel={this.props.selectHide}
                            footer={
                                [
                                    <Button onClick={this.props.selectHide} >{isEnglish ? 'Cancel' : '取消'}</Button>,
                                    <Button id="selectChangeBtn" onClick={() => this.props.textSetting(this.props.selectData.idCom, this.state.selectValue)} >{isEnglish ? 'Confirm' : '确认'}</Button>
                                ]
                            }
                            maskClosable={false}
                            destroyOnClose
                        >
                            <Select value={this.state.selectValue ? this.state.selectValue : this.props.selectData.currentValue} style={{ width: 120 }} onChange={this.handleSelect}>
                                <Option value="0">{isEnglish ? "Normal" : "正常"}</Option>
                                <Option value="1">{isEnglish ? "Fault" : "故障"}</Option>
                            </Select>
                        </Modal>
                }

                <Modal
                    title={isEnglish ? "Equipment Nameplate" : "设备铭牌"}
                    visible={this.state.infoModalVisible}
                    onCancel={this.handleCancel}
                    footer={null}
                    style={{ top: 200 }}
                    width={1400}
                >
                    <Table dataSource={this.state.dataSource} columns={this.state.equipmentColumns} pagination={false} />
                </Modal>
                <Modal
                    title={isEnglish ? "Equipment Nameplate" : "设备铭牌"}
                    visible={this.state.assetModalVisible}
                    onCancel={this.assetHandleCancel}
                    footer={null}
                    style={{ top: 200 }}
                    width={800}
                    maskClosable={false}
                >
                    <div style={{ marginTop: '-25px' }}>
                        <Tabs activeKey={this.state.activeKey} onChange={this.callback}>
                            <TabPane tab={isEnglish ? "Parameters" : "参数"} key="1">
                                <Table
                                    dataSource={this.state.dataAssetSource}
                                    loading={this.state.assetLoading}
                                    columns={assetColumns}
                                    pagination={false}
                                    scroll={{ y: 500 }}
                                />
                            </TabPane>
                            <TabPane tab={isEnglish ? "Technical Manual" : "技术手册"} key="2">
                                <div>
                                    {this.getWord()}
                                </div>
                            </TabPane>
                            <TabPane tab={
                                <span>
                                    {isEnglish ? "Diagram" : "图示"}
                                    {this.state.keyImgValid && (!this.state.keyImgValid.appearanceValid || !this.state.keyImgValid.nameplateValid || !this.state.keyImgValid.controlCenterValid) && (
                                        <span style={{
                                            display: 'inline-block',
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: '#ff4d4f',
                                            marginLeft: '8px',
                                            verticalAlign: 'middle'
                                        }}></span>
                                    )}
                                </span>
                            } key="3">
                                <div>
                                    {this.getPic()}
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                </Modal>
                {
                    this.props.alarmVisible ?
                        String(this.props.alarmData.type) === "0" ?
                            //高低限报警
                            <EditHighLowAlarmModal
                                {...this.props.alarmData}
                                hideModal={this.props.alarmHide}
                            />
                            :
                            String(this.props.alarmData.type) === "1" ?
                                //布尔报警
                                <EditBoolAlarmModal
                                    {...this.props.alarmData}
                                    hideModal={this.props.alarmHide}
                                />
                                :
                                String(this.props.alarmData.type) === "3" ?
                                    //规则报警
                                    <EditCodeAlarmModal
                                        {...this.props.alarmData}
                                        hideModal={this.props.alarmHide}
                                    />
                                    :
                                    <MainInterfaceModal
                                        visible={this.props.alarmVisible}
                                        hideModal={this.props.alarmHide}
                                        pointName={this.props.alarmData.pointName}
                                        addType={this.props.alarmData.addType}
                                    />
                        :
                        <MainInterfaceModal
                            visible={this.props.alarmVisible}
                            hideModal={this.props.alarmHide}
                            pointName={this.props.alarmData.pointName}
                            addType={this.props.alarmData.addType}
                        />
                }

            </Modal>
        )
    }
}

const ObserverModal = Form.create({})(ObserverModalForm);

export default ObserverModal
