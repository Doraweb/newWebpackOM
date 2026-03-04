/**
 * 操作记录模态框
 */
import React from 'react';
import { Modal, Button, DatePicker, Table, message } from 'antd';
import moment from 'moment';
import s from './OperationRecordModalView.css';

import http from '../../../common/http';
import { downloadUrl } from '../../../common/utils';
import appConfig from '../../../common/appConfig'
const language = appConfig.language

let str, toggleModalClass, toggleTableClass, btnStyle;
if (localStorage.getItem('serverOmd') == "best") {
  str = 'warning-config-best'
} else {
  str = ''
}
if (localStorage.getItem('serverOmd') == "persagy") {
  toggleModalClass = 'persagy-operationRecord-modal persagy-operationRecord-calendar-picker';
  toggleTableClass = 'persagy-operationRecord-table';
  btnStyle = {
    background: "rgba(255,255,255,1)",
    border: '1px solid rgba(195,198,203,1)',
    color: "rgba(38,38,38,1)",
    borderRadius: '4px',
    fontSize: "12px",
    fontFamily: 'MicrosoftYaHei'
  }
}

const columns = [{
  title: language == 'en' ? 'Time' : '时间',
  dataIndex: 'time',
  width: 200,
}, {
  title: language == 'en' ? 'Action source' : '操作来源',
  dataIndex: 'user',
  width: 150,
}, {
  title: language == 'en' ? 'Details' : '执行的操作',
  dataIndex: 'operation',
}];

class OperationRecordModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      filterData: [],
      selectedDate: this.props.date,
      loading: false
    };
    this.onDateChange = this.onDateChange.bind(this);
    this.loadTable = this.loadTable.bind(this);
    this.toDate = this.toDate.bind(this);
    this.toNextDay = this.toDate.bind(this, 1);
    this.toLastDay = this.toDate.bind(this, -1);
    this.downloadHistoryFile = this.downloadHistoryFile.bind(this);
    this.getOperationBtn = this.getOperationBtn.bind(this);
    this.filterOperationRecord = this.filterOperationRecord.bind(this);
  }
  static get defaultProps() {
    return {
      date: moment().startOf('day')
    }
  }

  getOperationBtn() {
    if (localStorage.getItem("operationBtnInfo")) {
      let operationBtnInfo = JSON.parse(localStorage.getItem("operationBtnInfo"))
      let operationBtn = []
      operationBtn = operationBtnInfo.map(item => {
        return <Button className={s['operationBtn']} onClick={() => this.filterOperationRecord(item)}>{item}</Button>
      })
      operationBtn.push(<Button className={s['operationBtn']} onClick={() => this.filterOperationRecord("当日记录")}>{language == 'en' ? 'Daily Record' : '当日记录'}</Button>)
      return operationBtn
    }
  }

  componentWillReceiveProps(nextProps) {
    let nextDate = nextProps.date;
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        selectedDate: moment(nextDate).startOf('day')
      }, this.loadTable);
    }

    if (this.props.visible && !nextProps.visible) {
      this.setState({
        data: [],
        filterData: []
      });
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.visible !== this.props.visible) {
      return true
    } else {
      if (nextState == this.state) {
        return false
      } else {
        return true
      }
    }
  }

  filterOperationRecord(text) {
    let data = this.state.data
    let newData = []
    if (text == "当日记录") {
      this.setState({
        filterData: data
      })
    } else {
      data.map(item => {
        if (item.operation.indexOf('[' + text + ']') != -1) {
          newData.push(item)
        }
      })
      this.setState({
        filterData: newData
      })
    }
  }

  toDate(offset) {
    this.setState({
      selectedDate: moment(this.state.selectedDate).add(offset, 'days')
    }, this.loadTable);
  }

  onDateChange(date, dateString) {
    // console.log(dateString+"--");
    this.setState({
      selectedDate: moment(date)
    }, this.loadTable);
  }
  loadTable() {
    let date = this.state.selectedDate.format('YYYY-MM-DD');

    this.setState({
      loading: true
    });
    http.post('/get_operation_log', {
      "dateFrom": date,
      "dateTo": date,
      "userId": Number(JSON.parse(window.localStorage.getItem('userData')).id),
      "lan": language
    }).then(
      data => {
        let operateData = data.data.map((row, i) => {
          if (row[2][0] == '[') {
            let btnTitle = row[2].slice(1, row[2].indexOf(']'))
            if (localStorage.getItem("operationBtnInfo").indexOf(btnTitle) == -1) {
              let btnList = []
              btnList = btnList.concat(JSON.parse(localStorage.getItem("operationBtnInfo")))
              btnList.push(btnTitle)
              localStorage.setItem('operationBtnInfo', JSON.stringify(btnList))
            }
          }
          return {
            no: i + 1,
            time: row[0],
            user: row[1],
            operation: row[2]
          }
        })
        this.setState({
          loading: false,
          data: operateData,
          filterData: operateData
        });
      }
    ).catch(
      e => {
        if (this.state.loading) {
          this.setState({
            loading: false
          });
        }
        message(language == 'en' ? 'Failed to obtain operation records. Please try again later!' : '获取操作记录失败，请稍后重试！', 2.5);
      }
    );
  }

  downloadHistoryFile() {
    let date = this.state.selectedDate.format('YYYY-MM-DD');
    let userId = Number(JSON.parse(window.localStorage.getItem('userData')).id)

    http.get(`/operationRecord/downloadHistoryFile/${date}/${date}/zh-cn/${userId}`)
      .then(data => {
        if (data.err === 0) {
          downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${data.data}`);
        } else {
          message(language == 'en' ? 'Failed to download!' : '获生成下载文件失败', 2.5)
        }
      });
  }

  render() {
    return (
      <div>
        {
          this.props.visible ?
            <Modal
              className={toggleModalClass}
              title={language == 'en' ? 'Operation Log' : "操作记录"}
              visible={this.props.visible}
              onCancel={this.props.onCancel}
              maskClosable={false}
              footer={null}
              width={800}
              wrapClassName={str}
            >
              <div className={s['date-btns-wrap']}>
                <Button icon="left" onClick={this.toLastDay} />
                <DatePicker
                  style={{
                    margin: '16px',
                    width: '250px'
                  }}
                  value={this.state.selectedDate}
                  onChange={this.onDateChange}
                  allowClear={false} />
                <Button icon="right" onClick={this.toNextDay} />
                <Button
                  onClick={this.downloadHistoryFile}
                  icon="export"
                  className={s['downloadBtn']}
                  style={btnStyle}
                >
                  {language == 'en' ? 'Export' : '导出'}
                </Button>
              </div>
              <div className={s['table-wrap']}>
                {this.getOperationBtn()}
                <Table
                  className={toggleTableClass}
                  rowKey="no"
                  columns={columns}
                  dataSource={this.state.filterData}
                  pagination={false}
                  scroll={{ y: 350 }}
                  size="small"
                  bordered
                  loading={this.state.loading}
                />
              </div>
            </Modal>
            :
            ''
        }
      </div>

    );
  }
}

export default OperationRecordModal
