/**
 * 日程模态框
 */
import React from 'react';
import { Modal, Table, DatePicker, Radio, TimePicker, Icon, Button, Input, Row, Col, Layout, Form, Checkbox, Tag } from 'antd'
const { RangePicker } = DatePicker
import s from './ScheduleModalView.css'
import moment from 'moment';
import PointModalView from '../containers/PointModalContainer'

import http from '../../../common/http';
import appConfig from '../../../common/appConfig';
import { downloadUrl } from '../../../common/utils'
const language = appConfig.language
const isEnglish = language === 'en';


const { Sider, Content, Header } = Layout;
const FormItem = Form.Item
const TimeFormat = 'HH:mm'
const Search = Input.Search

let str, btnStyle, toggleModalClass, formClass, btnWarpClass, toggleTextColor;
if (localStorage.getItem('serverOmd') == "best") {
  str = 'warning-config-best'
} else if (localStorage.getItem('serverOmd') == "persagy") {
  str = 'PersagyCalendarModal';
  btnStyle = {
    marginLeft: '3px',
    marginTop: '10px'
  }
  toggleModalClass = 'persagy-modal'
  formClass = 'persagy-dashBoardLine-form'
  btnWarpClass = 'persagy-btn-wrap'
  toggleTextColor = {
    top: '-20px',
    position: 'absolute',
    color: 'rgba(31,35,41,1)'
  }
} else {
  str = ''
  btnWarpClass = 'btn-wrap'
  toggleTextColor = {
    top: '-20px',
    position: 'absolute',
    color: '#fff',
    width: '180px'
  }
}

//修改日程
class ScheduleUserModifyModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmDirty: false,
      loading: false,
      checked: 0,                //是否checked
      selectedPoints: [],
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.delSelectedPoints = this.delSelectedPoints.bind(this);
    this.handleSelectPoints = this.handleSelectPoints.bind(this);
    this.Change = this.Change.bind(this)
  }

  UNSAFE_componentWillMount() {
    this.setState({
      selectedPoints: this.props.newData[0].point.split(","),
      checked: this.props.newData[0].isloop
    })
  }
  Change(checkedValue) {
    let checked = ''
    checked = (checkedValue.target.checked) ? 1 : 0    //改变状态
    this.setState({
      checked: checked
    })
  }
  handleSubmit(e) {
    const { editSchedule, handleHide } = this.props
    let id = this.props.newData[0].id
    let value = this.props.form.getFieldValue('schedulename') //获取表单的值
    let point = this.state.selectedPoints  //点的数量
    let num = this.state.checked   //是否被选中
    let values = [id, value, point.join(','), num]
    if (editSchedule(values)) {
      handleHide()
    }
    e.preventDefault();
  }

  // 获取组件
  getComponents() {
    return this.state.selectedPoints.map((point, i) => {
      return (
        <Tag key={point} style={{ backgroundColor: "#1C2530" }} closable onClose={(e) => { this.delSelectedPoints(e, point) }} >{point}</Tag>
      )
    })
  }
  delSelectedPoints(e, delpoint) {
    let newPoints = this.state.selectedPoints.filter(point => {
      return point !== delpoint
    })
    // console.info( newPoints )
    this.setState({
      selectedPoints: newPoints
    })
  }
  //处理选择点
  handleSelectPoints(points) {
    let selectedPoints = this.state.selectedPoints
    if (points && points.length) {
      this.setState({
        selectedPoints: [...selectedPoints, ...points]
      });
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        span: 3
      },
      wrapperCol: {
        span: 14
      },
    };
    const { scheduleData, CheckId } = this.props
    let newData = scheduleData.data.filter((item) => {
      if (item.id == CheckId[0]) return item
    })
    let schedulename = ''
    if (newData.length > 0) {
      schedulename = newData[0].name
    }
    let _this = this
    return (
      <Modal
        className={toggleModalClass}
        wrapClassName="user-add-modal-wrap"
        title={isEnglish ? "Edit Schedule" : "修改日程"}
        width={400}
        visible={true}
        confirmLoading={this.state.loading}
        onCancel={this.props.handleHide}
        onOk={this.handleSubmit}
        maskClosable={false}
        okText={isEnglish ? "Modify" : "修改"}
      >
        <Form className={formClass}>
          <FormItem
            {...formItemLayout}
            label={isEnglish ? "Title" : "日程标题"}
            hasFeedback
          >
            {getFieldDecorator('schedulename', {
              initialValue: schedulename,
              rules: [{
                required: true, message: isEnglish ? "Schedule title cannot be empty!" : "日程标题不能为空！",
              }],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem
            wrapperCol={{
              xs: { span: 8 },
              sm: { span: 4 },
            }}
          >
            <div className={s[`${btnWarpClass}`]} >
              <span style={{ color: "red", left: "1px", width: "20px", fontSize: "16px", top: "-20px", position: 'absolute' }} >*</span><span style={toggleTextColor}>
                {isEnglish ? "List of bound point names" : "绑定点名的列表清单"}
              </span>
              {this.getComponents()}
              {

                <Button
                  onClick={
                    () => this.props.showPointModal(true, {
                      onOk: this.handleSelectPoints
                    })
                  }
                >+</Button>
              }
            </div>
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            <Checkbox defaultChecked={this.props.newData[0].isloop > 0 ? true : false} onChange={(checkedValue) => { this.Change(checkedValue) }}>  {isEnglish ? "Repeat weekly" : "每周重复"}</Checkbox>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
const WrappedScheduleUserModifyModal = Form.create()(ScheduleUserModifyModal);


//新增日程
class ScheduleAddModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmDirty: false,
      loading: false,
      checked: 0,                //是否checked
      selectedPoints: this.props.selectedData,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.delSelectedPoints = this.delSelectedPoints.bind(this);
    this.handleSelectPoints = this.handleSelectPoints.bind(this);
    this.checkChange = this.checkChange.bind(this)
  }
  checkChange(e) {
    if (e.target.checked) {
      this.setState({
        checked: 1
      })
    } else {
      this.setState({
        checked: 0
      })
    }
  }
  handleSubmit(e) {
    const { addSchedule, handleHide } = this.props
    let value = this.props.form.getFieldValue('schedulename') //获取表单的值
    let point = this.state.selectedPoints  //点的数量
    let num = this.state.checked   //是否被选中
    let values = [value, 'tom', point.join(','), num]
    if (addSchedule(values)) {
      handleHide()
    }
    e.preventDefault();
    // this.props.form.validateFieldsAdScroll((err, values) => {
    //   if (!err) {
    //     this.setState({loading: true});
    //     http.post('/user/add', values).then(
    //       result => {
    //         this.setState({loading: false});
    //         if (result.status === 'OK') {
    //           message.success('新增成功！', 2.5);
    //           let userid = result.data.userid;
    //           this.props.handleAddUser({userid, ...values});
    //         } else {
    //           message.error(result.msg || '新增失败！', 2.5);
    //         }
    //       }
    //     ).catch(
    //       err => {
    //         this.setState({loading: false});
    //       }
    //     )
    //   }
    // });
  }

  // 获取组件
  getComponents() {
    return this.state.selectedPoints.map((point, i) => {
      return (
        <Tag key={point} style={{ backgroundColor: "#1C2530" }} closable onClose={(e) => { this.delSelectedPoints(e, point) }} >{point}</Tag>
      )
    })
  }
  delSelectedPoints(e, delpoint) {
    let newPoints = this.state.selectedPoints.filter(point => {
      return point !== delpoint
    })
    console.info(newPoints)
    this.setState({
      selectedPoints: newPoints
    })
  }
  //处理选择点
  handleSelectPoints(points) {
    let selectedPoints = this.state.selectedPoints
    if (points && points.length) {
      this.setState({
        selectedPoints: [...selectedPoints, ...points]
      });
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        span: 3
      },
      wrapperCol: {
        span: 14
      },
    };

    return (
      <Modal
        className={toggleModalClass}
        wrapClassName="user-add-modal-wrap"
        title={isEnglish ? "Add Schedule" : "新增日程"}
        width={400}
        visible={true}
        confirmLoading={this.state.loading}
        onCancel={this.props.handleHide}
        onOk={this.handleSubmit}
        maskClosable={false}
        okText={isEnglish ? "Add" : "新增"}
        cancelText={isEnglish ? "Cancel" : "取消"}
      >
        <Form className={formClass}>
          <FormItem
            {...formItemLayout}
            label={isEnglish ? "Title" : "日程标题"}
            hasFeedback
          >
            {getFieldDecorator('schedulename', {
              rules: [{
                required: true, message: isEnglish ? "Schedule title cannot be empty!" : "日程标题不能为空！",
              }],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem
            wrapperCol={{
              xs: { span: 8 },
              sm: { span: 4 },
            }}
          >
            <div className={s[`${btnWarpClass}`]} >
              <span style={{ color: "red", left: "1px", width: "20px", fontSize: "12px", top: "-20px", position: 'absolute' }} >*</span>
              <span style={toggleTextColor}>
                {isEnglish ? "List of bound point names" : "绑定点名的列表清单"}
              </span>
              {this.getComponents()}
              <Button
                onClick={() => this.props.showPointModal(true, {
                  onOk: this.handleSelectPoints
                })}
              >+</Button>
            </div>
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            <Checkbox onChange={this.checkChange}>
              {isEnglish ? "Repeat weekly" : "每周重复"}
            </Checkbox>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
const WrappedScheduleAddModal = Form.create()(ScheduleAddModal);

class ValueList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIds: 0,
      value: this.props.value || [],
      modal: this.props.modal,
      selectedData: [],
      disabled: true,    //禁止或者启用
      number: 0
    };
    this.valueTableColumns = [{
      key: 'name',
      dataIndex: 'name'
    }, {
      key: 'icon',
      dataIndex: 'icon',
      render: (text, record, index) => {
        return (
          <div>
            <Icon type={record.enable > 0 ? 'pause-circle' : 'play-circle'} onClick={() => this.handleChangeDate(record.id, record.name)} style={{ cursor: 'pointer', fontSize: 16, color: `${record.enable > 0 ? '#08c' : 'red'}` }} />
          </div>
        )
      }
    }
    ]
    this.handleSelectRow = this.handleSelectRow.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleAddUser = this.handleAddUser.bind(this);
    this.handleModifyUser = this.handleModifyUser.bind(this);
    this.showUserAddModal = this.showUserAddModal.bind(this);
    this.showUserModifyModal = this.showUserModifyModal.bind(this)
  }
  static get defaultProps() {
    return {
      modal: {
        type: null,
        props: {}
      }
    }
  }
  // componentWillReceiveProps(nextProps) {
  //   this.setState({
  //     selectedIds: [],
  //     value: nextProps.value || [],
  //   });
  // }
  handleSelectRow(selectedRowKeys, selectedRows) {
    const { obtainSchedule, fetchID } = this.props
    this.props.AddIdSchedule(selectedRowKeys)
    obtainSchedule(selectedRowKeys[0])
    fetchID(selectedRowKeys[0])
  }
  showUserAddModal() {
    this.showModal('UserAddModal');
  }
  showUserModifyModal(selectedRowKeys) {
    // let user = this.state.value.find(row => row.userid === userid)
    this.showModal('UserModifyModal', selectedRowKeys[0])
  }
  showModal(type, props) {
    this.setState({
      modal: {
        type,
        props
      }
    });
  }
  hideModal() {
    this.setState({
      modal: ValueList.defaultProps.modal
    });
  }
  //添加
  handleAddUser(values) {
    const value = [1, 2, 3, 4, 5]
    addSchedule(value)
    this.setState({
      value: [...this.state.value, values]
    });
    this.hideModal();
  }
  handleModifyUser(userid, values) {
    let value = this.state.value.slice();
    value.some(row => {
      if (row['userid'] === userid) {
        Object.assign(row, values);
        return true;
      }
    });
    this.setState({
      value
    });
    this.hideModal();
  }
  //删除
  handleDeleteUsers(selectedRowKeys) {
    const { delSchedule, scheduleData, obtainSchedule } = this.props
    let digital = scheduleData.data.filter((item) => {
      if (item.id == selectedRowKeys[0]) return item  //匹配选中表单的值
    })
    Modal.confirm({
      title: isEnglish ? 'Confirm Deletion' : '确认删除',
      content: isEnglish
        ? `Confirm deletion of the ${digital[0].name} schedule?`
        : `确认删除${digital[0].name}日程？`,
      okText: isEnglish ? 'Delete' : '删除',
      cancelText: isEnglish ? 'Cancel' : '取消',
      onOk: () => {
        delSchedule(selectedRowKeys[0])
      }
    });
  }
  //静止,启用
  handleChangeDate(id, name) {
    const { useSchedule, scheduleData } = this.props
    let digital = scheduleData.data.filter((item) => {
      if (item.id == id) return item  //匹配选中表单的值
    })
    let _this = this
    let number = null;
    Modal.confirm({
      content: isEnglish
        ? `Confirm to ${digital[0].enable > 0 ? 'disable' : 'enable'} the ${name} schedule`
        : '确认' + (digital[0].enable > 0 ? `禁用${name}` : `启用${name}`) + '日程',
      okText: isEnglish ? 'Confirm' : '确认',
      cancelText: isEnglish ? 'Cancel' : '取消',
      onOk: () => {
        if (digital[0].enable > 0) {
          number = 0
        } else {
          number = 1
        }
        useSchedule(id, number)
      }
    });

  }
  render() {
    const { AddIdSchedule, addSchedule, editSchedule, scheduleData, scheduleLoading, delSchedule,
      useSchedule, obtainSchedule, fetchID, CheckId } = this.props
    let newData
    if (scheduleData.data != null) {
      newData = scheduleData.data.filter((item) => {
        if (item.id == CheckId[0]) return item
      })
    } else {
      newData = []
    }

    return (
      <Layout className={s['value-list-layout']} style={{ overflowX: 'hidden' }}>
        <Header className={s['value-list-header']} style={{ position: 'fixed', zIndex: '50', width: '198px' }}>
          <Button
            size="small"
            className={s['button-right']}
            onClick={this.showUserAddModal}
            style={btnStyle}
          >
            {isEnglish ? 'Add' : '新增'}
          </Button>
          <Button
            size="small"
            className={s['button-right']}
            onClick={() => { this.handleDeleteUsers(CheckId) }}
            style={btnStyle}
          >
            {isEnglish ? 'Delete' : '删除'}
          </Button>
          <Button
            size="small"
            onClick={() => { this.showUserModifyModal(CheckId) }}
            style={btnStyle}
          >
            {isEnglish ? 'Edit' : '修改'}
          </Button>

        </Header>
        <Content className={s['table-wrap']} style={{ marginTop: '48px', height: '462px' }} >
          <Table
            loading={scheduleLoading}
            bordered={false}
            showHeader={false}
            pagination={false}
            rowKey="id"
            rowSelection={{
              type: 'radio',
              selectedRowKeys: CheckId,
              onChange: this.handleSelectRow,
            }}
            columns={this.valueTableColumns}
            dataSource={scheduleData.data}
          />
        </Content>
        {
          this.state.modal.type === 'UserAddModal' ? (
            <WrappedScheduleAddModal
              addSchedule={addSchedule}
              zIndex={10000}
              handleHide={this.hideModal}
              handleAddUser={this.handleAddUser}
              data={this.state.modal.props}
              showPointModal={this.props.showPointModal}
              selectedData={this.props.selectedData}
            />
          ) : null
        }
        {
          this.state.modal.type === 'UserModifyModal' ? (
            <WrappedScheduleUserModifyModal
              editSchedule={editSchedule}
              zIndex={10000}
              handleHide={this.hideModal}
              CheckId={CheckId}
              selectedRowKeys={this.state.selectedIds}
              handleAddUser={this.handleAddUser}
              data={this.state.modal.props}
              scheduleData={scheduleData}
              newData={newData}
              showPointModal={this.props.showPointModal}
              selectedData={this.props.selectedData}
            />
          ) : null
        }
        <PointModalView />
      </Layout>
    );
  }
}
class ScheduleView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedDate: {},
      tableData: [],
      loading: false,
      tableLoading: false,
      userList: [],
      timeList: [],
      columns: [
        {
          title: isEnglish ? 'Date' : '日期', // 日期列国际化
          dataIndex: 'weekday',
          key: 'weekday',
          render: (text) => {
            return <div style={{ width: 90 }}>{text}</div>
          }
        },
        {
          title: isEnglish ? 'Enable' : '启用', // 启用列国际化（开关功能）
          dataIndex: 'enable',
          key: 'enable',
          render: (text, record, index) => {
            let id = record.workid
            return (
              <div style={{ textAlign: 'center' }}>
                <Checkbox
                  defaultChecked={(record.enable > 0) ? true : false}
                  onChange={(checkedValue) => { this.Change(id, checkedValue) }}
                ></Checkbox>
              </div>
            )
          }
        },
        {
          title: isEnglish ? 'Start Time' : '开启时间', // 开启时间列国际化
          dataIndex: 'timeFrom',
          key: 'timeFrom',
          render: (text, record, index) => {
            let id = record.workid
            return (
              <TimePicker
                defaultValue={moment(record.timeFrom, 'HH:mm')}
                style={{ width: 90 }}
                onChange={(value) => { this.StartTime(value, id) }}
                format={TimeFormat}
                size="large"
              />
            )
          }
        },
        {
          title: isEnglish ? 'End Time' : '关停时间', // 关停时间列国际化
          dataIndex: 'timeTo',
          key: 'timeTo',
          render: (text, record, index) => {
            let id = record.workid
            return (
              <TimePicker
                defaultValue={moment(record.timeTo, 'HH:mm')}
                style={{ width: 90 }}
                onChange={value => { this.EndTime(value, id) }}
                format={TimeFormat}
                size="large"
              />
            )
          }
        },
        {
          title: isEnglish ? 'Enable' : '启用', // 重复启用列保持翻译统一
          dataIndex: 'enable1',
          key: 'enable1',
          render: (text, record, index) => {
            let id = record.workid
            return (
              <div style={{ textAlign: 'center' }}>
                <Checkbox
                  defaultChecked={(record.enable1 > 0) ? true : false}
                  onChange={(checkedValue) => { this.Change1(id, checkedValue) }}
                ></Checkbox>
              </div>
            )
          }
        },
        {
          title: isEnglish ? 'Start Time' : '开启时间', // 重复开启时间列保持翻译统一
          dataIndex: 'timeFrom1',
          key: 'timeFrom1',
          render: (text, record, index) => {
            let id = record.workid
            return (
              <TimePicker
                defaultValue={moment(record.timeFrom1, 'HH:mm')}
                style={{ width: 90 }}
                onChange={(value) => { this.StartTime1(value, id) }}
                format={TimeFormat}
                size="large"
              />
            )
          }
        },
        {
          title: isEnglish ? 'End Time' : '关停时间', // 重复关停时间列保持翻译统一
          dataIndex: 'timeTo1',
          key: 'timeTo1',
          render: (text, record, index) => {
            let id = record.workid
            return (
              <TimePicker
                defaultValue={moment(record.timeTo1, 'HH:mm')}
                style={{ width: 90 }}
                onChange={value => { this.EndTime1(value, id) }}
                format={TimeFormat}
                size="large"
              />
            )
          }
        },
        {
          title: isEnglish ? 'Enable' : '启用',
          dataIndex: 'enable2',
          key: 'enable2',
          render: (text, record, index) => {
            let id = record.workid
            return (
              <div style={{ textAlign: 'center' }}>
                <Checkbox
                  defaultChecked={(record.enable2 > 0) ? true : false}
                  onChange={(checkedValue) => { this.Change2(id, checkedValue) }}
                ></Checkbox>
              </div>
            )
          }
        },
        {
          title: isEnglish ? 'Start Time' : '开启时间',
          dataIndex: 'timeFrom2',
          key: 'timeFrom2',
          render: (text, record, index) => {
            let id = record.workid
            return (
              <TimePicker
                defaultValue={moment(record.timeFrom2, 'HH:mm')}
                style={{ width: 90 }}
                onChange={(value) => { this.StartTime2(value, id) }}
                format={TimeFormat}
                size="large"
              />
            )
          }
        },
        {
          title: isEnglish ? 'End Time' : '关停时间',
          dataIndex: 'timeTo2',
          key: 'timeTo2',
          render: (text, record, index) => {
            let id = record.workid
            return (
              <TimePicker
                defaultValue={moment(record.timeTo2, 'HH:mm')}
                style={{ width: 90 }}
                onChange={value => { this.EndTime2(value, id) }}
                format={TimeFormat}
                size="large"
              />
            )
          }
        },
        {
          title: isEnglish ? 'Enable' : '启用',
          dataIndex: 'enable3',
          key: 'enable3',
          render: (text, record, index) => {
            let id = record.workid
            return (
              <div style={{ textAlign: 'center' }}>
                <Checkbox
                  defaultChecked={(record.enable3 > 0) ? true : false}
                  onChange={(checkedValue) => { this.Change3(id, checkedValue) }}
                ></Checkbox>
              </div>
            )
          }
        },
        {
          title: isEnglish ? 'Start Time' : '开启时间',
          dataIndex: 'timeFrom3',
          key: 'timeFrom3',
          render: (text, record, index) => {
            let id = record.workid
            return (
              <TimePicker
                defaultValue={moment(record.timeFrom3, 'HH:mm')}
                style={{ width: 90 }}
                onChange={(value) => { this.StartTime3(value, id) }}
                format={TimeFormat}
                size="large"
              />
            )
          }
        },
        {
          title: isEnglish ? 'End Time' : '关停时间',
          dataIndex: 'timeTo3',
          key: 'timeTo3',
          render: (text, record, index) => {
            let id = record.workid
            return (
              <TimePicker
                defaultValue={moment(record.timeTo3, 'HH:mm')}
                style={{ width: 90 }}
                onChange={value => { this.EndTime3(value, id) }}
                format={TimeFormat}
                size="large"
              />
            )
          }
        },
        {
          title: isEnglish ? 'Enable' : '启用',
          dataIndex: 'enable4',
          key: 'enable4',
          render: (text, record, index) => {
            let id = record.workid
            return (
              <div style={{ textAlign: 'center' }}>
                <Checkbox
                  defaultChecked={(record.enable4 > 0) ? true : false}
                  onChange={(checkedValue) => { this.Change4(id, checkedValue) }}
                ></Checkbox>
              </div>
            )
          }
        },
        {
          title: isEnglish ? 'Start Time' : '开启时间',
          dataIndex: 'timeFrom4',
          key: 'timeFrom4',
          render: (text, record, index) => {
            let id = record.workid
            return (
              <TimePicker
                defaultValue={moment(record.timeFrom4, 'HH:mm')}
                style={{ width: 90 }}
                onChange={(value) => { this.StartTime4(value, id) }}
                format={TimeFormat}
                size="large"
              />
            )
          }
        },
        {
          title: isEnglish ? 'End Time' : '关停时间',
          dataIndex: 'timeTo4',
          key: 'timeTo4',
          render: (text, record, index) => {
            let id = record.workid
            return (
              <TimePicker
                defaultValue={moment(record.timeTo4, 'HH:mm')}
                style={{ width: 90 }}
                onChange={value => { this.EndTime4(value, id) }}
                format={TimeFormat}
                size="large"
              />
            )
          }
        }
      ],
      dataSource: [],
      subData: {},      //数据    
    }
    this.dateOffset = 0;
    this.loadTable = this.loadTable.bind(this)
    this.handleDateChose = this.handleDateChose.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleChangeDate = this.handleChangeDate.bind(this)
    this.renderColumns = this.renderColumns.bind(this)
    this.Change = this.Change.bind(this)
    this.StartTime = this.StartTime.bind(this)
    this.EndTime = this.EndTime.bind(this)
    this.Change1 = this.Change1.bind(this)
    this.StartTime1 = this.StartTime1.bind(this)
    this.EndTime1 = this.EndTime1.bind(this)
    this.Change2 = this.Change2.bind(this)
    this.StartTime2 = this.StartTime2.bind(this)
    this.EndTime2 = this.EndTime2.bind(this)
    this.Change3 = this.Change3.bind(this)
    this.StartTime3 = this.StartTime3.bind(this)
    this.EndTime3 = this.EndTime3.bind(this)
    this.Change4 = this.Change4.bind(this)
    this.StartTime4 = this.StartTime4.bind(this)
    this.EndTime4 = this.EndTime4.bind(this)
    this.confirm = this.confirm.bind(this)
  }
  componentDidMount() {
    const { searchSchedule, nodeData } = this.props
    searchSchedule()
    // this.loadTable()
  }
  loadTable() {
    const { selectedDate } = this.state
    const _this = this
    this.setState({
      loading: true
    })
    _this.setState({
    })
  }
  // 渲染列
  renderColumns(text, record, column) {
    return (
      <div className="tb"
        onClick={(e) => { this.handleCellClick(record, column) }}
      >{text}</div>
    )
  }
  handleDateChose(dates, dateStrings) {
    this.setState({
      selectedDate: {
        timeFrom: dateStrings[0],
        timeTo: dateStrings[1]
      }
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
      s_time = moment(this.state.selectedDate.timeFrom).add(this.dateOffset, 'days').format(TimeFormat);
      end_time = moment(this.state.selectedDate.timeTo).add(this.dateOffset, 'days').endOf('day').format(TimeFormat);
    }
    this.setState({
      selectedDate: {
        timeFrom: s_time,
        timeTo: end_time
      }
    }, this.loadTable);
  }
  searchPoint(value) {
    const { selectedDate } = this.state
    const _this = this
    this.setState({
      loading: true
    })
    http.post('/warning/getHistory', {
      timeFrom: selectedDate.timeFrom, //变量
      timeTo: moment(selectedDate.timeTo).format(TimeFormat),
      lan: language == 'en' ? 'en' : '',
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
  getContent() {
    let contentDivs = []
    for (var i = 0; i < 2; i++) {
      contentDivs.push(
        <div className={s['table-td']}>
          <TimePicker defaultValue={moment('12:08', 'HH:mm')} />
        </div>
      )
    }
    return contentDivs
  }
  handleCellClick = (line, column, e) => {
    //const {config,showModal,pointvalue,idCom} = this.props
    console.info(line, column, e)
    // e.currentTarget.style.backgroundColor = "#013977" 
    // document.getElementsByClassName("tb").onkeydown = function(event) {
    //  var  e = even;
    //  if (e && e.keyCode == 13) {
    //    console.log("按了 Enter")
    //  }
    // }
    // config.readonly true or false?
    // if(config.readonly) return false
    // let curvalue = pointvalue[record.key][Number(column)];
    // showModal( modalTypes.TABLE_CELL_MODAL , {
    //     currentValue : curvalue,
    //     idCom : idCom,
    //     firstKey : record.key,
    //     secondKey : column
    // })
  }
  Change(id, checkedValue) { //我能获取到  enabeld   id
    const { nodeData } = this.props
    let subData = nodeData
    let newJson = subData[id - 1]
    newJson.enable = (checkedValue.target.checked) ? 1 : 0    //改变状态
    this.setState({
      subData: subData
    })
  }
  StartTime(time, id) {
    const { nodeData } = this.props
    let subData = nodeData
    let newJson = subData[id - 1]
    newJson.timeFrom = time.format(TimeFormat)
    this.setState({
      subData: subData
    })
  }
  EndTime(time, id) {
    const { nodeData } = this.props
    let subData = nodeData
    let newJson = subData[id - 1]
    newJson.timeTo = time.format(TimeFormat)
    this.setState({
      subData: subData
    })
  }
  Change1(id, checkedValue) { //我能获取到  enabeld   id
    const { nodeData } = this.props
    let subData = nodeData
    let newJson = subData[id - 1]
    newJson.enable1 = (checkedValue.target.checked) ? 1 : 0    //改变状态
    this.setState({
      subData: subData
    })
  }
  StartTime1(time, id) {
    const { nodeData } = this.props
    let subData = nodeData
    let newJson = subData[id - 1]
    newJson.timeFrom1 = time.format(TimeFormat)
    this.setState({
      subData: subData
    })
  }
  EndTime1(time, id) {
    const { nodeData } = this.props
    let subData = nodeData
    let newJson = subData[id - 1]
    newJson.timeTo1 = time.format(TimeFormat)
    this.setState({
      subData: subData
    })
  }
  Change2(id, checkedValue) { //我能获取到  enabeld   id
    const { nodeData } = this.props
    let subData = nodeData
    let newJson = subData[id - 1]
    newJson.enable2 = (checkedValue.target.checked) ? 1 : 0    //改变状态
    this.setState({
      subData: subData
    })
  }
  StartTime2(time, id) {
    const { nodeData } = this.props
    let subData = nodeData
    let newJson = subData[id - 1]
    newJson.timeFrom2 = time.format(TimeFormat)
    this.setState({
      subData: subData
    })
  }
  EndTime2(time, id) {
    const { nodeData } = this.props
    let subData = nodeData
    let newJson = subData[id - 1]
    newJson.timeTo2 = time.format(TimeFormat)
    this.setState({
      subData: subData
    })
  }
  Change3(id, checkedValue) { //我能获取到  enabeld   id
    const { nodeData } = this.props
    let subData = nodeData
    let newJson = subData[id - 1]
    newJson.enable3 = (checkedValue.target.checked) ? 1 : 0    //改变状态
    this.setState({
      subData: subData
    })
  }
  StartTime3(time, id) {
    const { nodeData } = this.props
    let subData = nodeData
    let newJson = subData[id - 1]
    newJson.timeFrom3 = time.format(TimeFormat)
    this.setState({
      subData: subData
    })
  }
  EndTime3(time, id) {
    const { nodeData } = this.props
    let subData = nodeData
    let newJson = subData[id - 1]
    newJson.timeTo3 = time.format(TimeFormat)
    this.setState({
      subData: subData
    })
  }
  Change4(id, checkedValue) { //我能获取到  enabeld   id
    const { nodeData } = this.props
    let subData = nodeData
    let newJson = subData[id - 1]
    newJson.enable4 = (checkedValue.target.checked) ? 1 : 0    //改变状态
    this.setState({
      subData: subData
    })
  }
  StartTime4(time, id) {
    const { nodeData } = this.props
    let subData = nodeData
    let newJson = subData[id - 1]
    newJson.timeFrom4 = time.format(TimeFormat)
    this.setState({
      subData: subData
    })
  }
  EndTime4(time, id) {
    const { nodeData } = this.props
    let subData = nodeData
    let newJson = subData[id - 1]
    newJson.timeTo4 = time.format(TimeFormat)
    this.setState({
      subData: subData
    })
  }
  confirm() {  //确认
    const { scheduleId, ModifySchedule } = this.props
    let jsonObj = this.state.subData
    let json = jsonObj.map(rowObj => {
      let row = {}
      delete rowObj.key
      delete rowObj.workid
      row = Object.assign({}, row, rowObj)

      // 根据语言环境，将星期文本（中文/英文）映射为对应数字（1-7）
      switch (row['weekday']) {
        // 中文星期判断（原逻辑保留）
        case isEnglish ? 'Sunday' : '星期日':
          row['weekday'] = 1;
          break;
        case isEnglish ? 'Monday' : '星期一':
          row['weekday'] = 2;
          break;
        case isEnglish ? 'Tuesday' : '星期二':
          row['weekday'] = 3;
          break;
        case isEnglish ? 'Wednesday' : '星期三':
          row['weekday'] = 4;
          break;
        case isEnglish ? 'Thursday' : '星期四':
          row['weekday'] = 5;
          break;
        case isEnglish ? 'Friday' : '星期五':
          row['weekday'] = 6;
          break;
        case isEnglish ? 'Saturday' : '星期六':
          row['weekday'] = 7;
          break;
      }

      return row
    })
    ModifySchedule(scheduleId, json)
  }
  render() {
    const { visible, onCancel, selectedData, showPointModal, scheduleLoading, addSchedule, editSchedule, hideModal,
      scheduleData, delSchedule, useSchedule, obtainSchedule, loadDate, nodeData, fetchID, scheduleId,
      ModifySchedule, AddIdSchedule, CheckId } = this.props
    const { selectedDate } = this.state
    return (
      <div>
        {
          visible ?
            <Modal
              visible={visible}
              onCancel={onCancel}
              footer={null}
              maskClosable={false}
              width={1800}
              title={isEnglish ? 'Schedule' : '日程'}
              wrapClassName={str}
            >
              <div className={s['schedule-wrap']}>
                <Layout>
                  <Sider>
                    {/* <div className={s['schedule-list']}> */}
                    <ValueList
                      value={this.state.userList}
                      loading={this.state.tableLoading}
                      selectedData={selectedData}
                      showPointModal={showPointModal}
                      scheduleLoading={scheduleLoading}
                      addSchedule={addSchedule}
                      editSchedule={editSchedule}
                      delSchedule={delSchedule}
                      scheduleData={scheduleData}
                      useSchedule={useSchedule}
                      obtainSchedule={obtainSchedule}
                      fetchID={fetchID}
                      AddIdSchedule={AddIdSchedule}
                      CheckId={CheckId}
                    />
                    {/* </div> */}
                  </Sider>
                  <Content>
                    <Table

                      pagination={false}
                      bordered
                      loading={loadDate}
                      columns={this.state.columns}
                      dataSource={nodeData}
                    />
                    <div className={s['sechoule-button']}>
                      <Button className={s['button-common']} type='default' onClick={hideModal}>
                        {isEnglish ? 'Cancel' : '取消'}
                      </Button>
                      <Button className={s['button-common']} type='primary' onClick={this.confirm}>
                        {isEnglish ? 'Confirm' : '确认'}
                      </Button>
                    </div>
                  </Content>
                </Layout>
              </div>
            </Modal>
            :
            ""
        }

      </div>

    )
  }
}

export default ScheduleView