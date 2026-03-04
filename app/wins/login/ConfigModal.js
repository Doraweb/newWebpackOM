/**
 * 首页配置框
 */
import React from 'react';
import { Form, Modal, Input, Button, message, Select, Icon } from 'antd';
import s from './ConfigModal.css';
import appConfig from '../../common/appConfig';
import { updateServerUrl } from '../../common/appConfig';
import http from '../../common/http';


const FormItem = Form.Item;
const Option = Select.Option
const language = appConfig.language
const formItemLayout = {
  labelCol: {
    span: 10
  },
  wrapperCol: {
    span: 12
  },
}

let serverName = ''

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const remote = require('@electron/remote');
const exePath = remote.process.execPath.slice(0, -7).replace(/\\/g, '\/')
let dbPath
if (remote.process.execPath.indexOf("OM.exe") != -1) {
  dbPath = exePath + '/db.json'
} else {
  dbPath = 'db.json'
}

const adapter = new FileSync(dbPath)
const db = low(adapter)
db.defaults({ ipList: [], nameList: [], ip: 'localhost:5000', name: '' })
  .write()
//初始化localstorage里的ip
window.localStorage.setItem('ipList', JSON.stringify({
  names: db.getState().nameList,
  ips: db.getState().ipList
}));

window.localStorage.setItem('serverName', db.getState().name)



class SaveNameModalForm extends React.Component {
  constructor(props) {
    super(props)

    this.handleSave = this.handleSave.bind(this)
  }

  handleSave = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.getName(values)
      }
    });
  }

  render() {
    const { form } = this.props
    const { getFieldDecorator } = form
    return (
      <Modal
        wrapClassName="login-modal-wrap2"
        title="保存别名"
        maskClosable={false}
        visible={this.props.saveVisible}
        onCancel={this.props.handleHide}
        footer={[
          <Button key="submit" type="primary" onClick={this.handleSave}>
            确定
          </Button>
        ]}
      >
        <FormItem label="">
          {getFieldDecorator('name', {
            initialValue: ""
          })(<Input />)}
        </FormItem>
      </Modal>
    )
  }

}

const SaveNameModalFormWrap = Form.create()(SaveNameModalForm)


class ConfigModalForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      saveVisible: false,
      name: "",
      currentName: ''
    };
    this.enter = this.enter.bind(this)
    this.showModal = this.showModal.bind(this)
    this.handleHide = this.handleHide.bind(this)
    this.getName = this.getName.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
    this.deleteName = this.deleteName.bind(this)
  }

  componentDidMount() {
    if (JSON.parse(window.localStorage.getItem('ipList')) && JSON.parse(window.localStorage.getItem('ipList')).names && JSON.parse(window.localStorage.getItem('ipList')).names.lenth != 0) {
      let list = JSON.parse(window.localStorage.getItem('ipList'))
      let names = list.names
      let serverUrl = localStorage.getItem('serverUrl')
      list.ips.map((ip, index) => {
        if (ip === serverUrl) {
          this.setState({
            currentName: names[index]
          })
          serverName = names[index]
        }
      })
      this.props.form.setFieldsValue({ serverUrl: serverUrl })
    }
  }

  componentWillReceiveProps(nextProps) {
    const adapterNext = new FileSync(dbPath)
    const dbNext = low(adapterNext)
    if (this.props.visible != nextProps.visible) {
      this.setState({
        currentName: ''
      })
      let serverUrl = localStorage.getItem('serverUrl');
      let list = [];
      if (JSON.parse(window.localStorage.getItem('ipList')) && JSON.parse(window.localStorage.getItem('ipList')).names && JSON.parse(window.localStorage.getItem('ipList')).ips.length != 0) {
        list = JSON.parse(window.localStorage.getItem('ipList'))
        let names = list.names
        list.ips.map((ip, index) => {
          if (ip === nextProps.initialServerUrl) {
            let currentName = names[index]
            //updateServerUrl(currentIP)
            this.setState({
              currentName: currentName
            })
            serverName = currentName
          }
        })
        // if (nextProps.visible === false) {
        //   dbNext.set('nameList',JSON.parse(window.localStorage.getItem('ipList')).names).write()
        //   dbNext.set('ipList',JSON.parse(window.localStorage.getItem('ipList')).ips).write()
        // }
      }
      if (nextProps.visible === true) {
        window.localStorage.setItem('ipList', JSON.stringify({
          names: dbNext.getState().nameList,
          ips: dbNext.getState().ipList
        }));
        this.props.form.setFieldsValue({ serverUrl: nextProps.initialServerUrl })
      }
    }

  }


  enter() {
    this.props.handleOk()
  }

  showModal() {
    this.setState({
      saveVisible: true
    });
  }

  handleHide() {
    this.setState({
      saveVisible: false
    });
  }

  //将别名保存到localStorage中
  getName(name) {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const adapterNext = new FileSync(dbPath)
        const dbNext = low(adapterNext)
        //首次存储
        if (!localStorage.getItem('ipList')) {
          window.localStorage.setItem('ipList', JSON.stringify({
            names: [name.name],
            ips: [values.serverUrl]
          }));
          this.handleHide()
          this.setState({
            currentName: name.name
          })
          serverName = name.name
          dbNext.set('nameList', JSON.parse(window.localStorage.getItem('ipList')).names).write()
          dbNext.set('ipList', JSON.parse(window.localStorage.getItem('ipList')).ips).write()
        } else {
          //非首次存储
          let flag = 0
          let ipList = JSON.parse(localStorage.getItem('ipList'));
          //先遍历一下，若重名则无法保存
          ipList.names.map((item) => {
            if (item === name.name) {
              flag = 1
              Modal.error({
                title: '保存别名',
                content: '别名已存在,保存失败',
              });
            } else {

            }
          })
          if (flag == 0) {
            //保存新的别名
            ipList.names.push(name.name);
            ipList.ips.push(values.serverUrl);
            window.localStorage.setItem('ipList', JSON.stringify({
              names: ipList.names,
              ips: ipList.ips
            }));
            this.handleHide()
            this.setState({
              currentName: name.name
            })
            serverName = name.name
            dbNext.set('nameList', JSON.parse(window.localStorage.getItem('ipList')).names).write()
            dbNext.set('ipList', JSON.parse(window.localStorage.getItem('ipList')).ips).write()
          }

        }
      } else {
        Modal.error({
          title: '保存别名',
          content: '保存失败',
        });
      }
    });
  }

  getOptions = () => {
    let list = []
    if (JSON.parse(window.localStorage.getItem('ipList'))) {
      list = JSON.parse(window.localStorage.getItem('ipList'))
      return list.names.map((name, index) => {
        return (
          <Option value={name} key={index} >{name}</Option>
        )
      })
    }
  }

  handleSelect(value, option) {
    let list = [], currentKey = 0, currentIP = '';
    list = JSON.parse(window.localStorage.getItem('ipList'))
    if (list != null && list.ips != null && list.ips.length != 0) {
      let ips = list.ips
      list.names.map((name, index) => {
        if (name === value) {
          currentKey = index
          currentIP = ips[index]
          this.props.form.setFieldsValue({ serverUrl: currentIP })
        }
      })
    } else {
      updateServerUrl(currentIP)

    }

    this.setState({
      currentName: value
    })
    serverName = value
  }

  deleteName() {
    const adapterNext = new FileSync(dbPath)
    const dbNext = low(adapterNext)
    let curName = this.state.currentName
    let deleteKey = 0;
    let ipList = JSON.parse(localStorage.getItem('ipList'));
    ipList.names.forEach((item, index) => {
      if (item === curName) {
        ipList.names.splice(index, 1)
        deleteKey = index
      }
    })

    ipList.ips.forEach((row, j) => {
      if (j === deleteKey) {
        ipList.ips.splice(j, 1)
      }
    })

    window.localStorage.setItem('ipList', JSON.stringify({
      names: ipList.names,
      ips: ipList.ips
    }));
    dbNext.set('nameList', JSON.parse(window.localStorage.getItem('ipList')).names).write()
    dbNext.set('ipList', JSON.parse(window.localStorage.getItem('ipList')).ips).write()
    //先把别名置为空
    this.setState({
      currentName: ''
    })
    //如果列表里还有当前URL的别名，则显示
    let names = ipList.names
    let serverUrl = localStorage.getItem('serverUrl')
    ipList.ips.map((ip, index) => {
      if (ip === serverUrl) {
        this.setState({
          currentName: names[index]
        })
        serverName = names[index]
      }
    })
    //服务器地址还是显示当前URL
    this.props.form.setFieldsValue({ serverUrl: serverUrl })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Form>
          <FormItem
            label={language == 'en' ? 'List of aliases' : '别名列表'}
          >
            <div>
              <Select style={{ width: 150 }} onSelect={this.handleSelect} value={this.state.currentName}  >
                {this.getOptions()}
              </Select>
              <Button type="danger" icon="delete" onClick={this.deleteName} />
            </div>
          </FormItem>
          <FormItem
            label={language == 'en' ? 'Server address' : '服务器地址'}
            hasFeedback
          >
            {getFieldDecorator('serverUrl', {
              rules: [{
                required: true,
                message: '服务器地址不能为空！'
              }]
            })(
              <Input style={{ marginTop: '22px', marginBottom: '5px',width:language == 'en' ?'175px':'200px' }} onPressEnter={this.enter} />

            )}
          </FormItem>
          <FormItem>
            <Button key="submit" type="default" onClick={this.showModal} className={s['button-savebiemin']}>
            {language == 'en' ? 'Save alias' : '保存别名'}
            </Button>
          </FormItem>
        </Form>
        <SaveNameModalFormWrap
          saveVisible={this.state.saveVisible}
          handleHide={this.handleHide}
          getName={this.getName}
        />
      </div>
    );
  }
}

const ConfigModalFormWrap = Form.create({
  mapPropsToFields: function (props) {
    let initialServerUrl = props.initialServerUrl
    return {
      serverUrl: Form.createFormField({
        value: initialServerUrl
      })

    }
  }
})(ConfigModalForm);

class ConfigModal extends React.Component {
  constructor(props) {
    super(props);
    this.handleOk = this.handleOk.bind(this);
    this.saveFormRef = this.saveFormRef.bind(this);
  }

  handleOk() {
    const _this = this;
    let list = JSON.parse(window.localStorage.getItem('ipList'))
    if (list != null && list.names != null && list.names.length != 0) {
      let names = list.names
      serverName = ''
      this.form.validateFields((err, values) => {
        if (!err) {
          list.ips.map((ip, index) => {
            if (ip === values['serverUrl']) {
              serverName = names[index]
            }
          })
          if (values['serverUrl'].indexOf("：") != -1) {
            values['serverUrl'] = values['serverUrl'].replace("：", ":")
          }
          if (values['serverUrl'].slice(-5, -4) != ":") {
            values['serverUrl'] = values['serverUrl'] + ":5000"
          }
          updateServerUrl(values['serverUrl']);
          localStorage.setItem('serverName', serverName)
          const adapterNext = new FileSync(dbPath)
          const dbNext = low(adapterNext)
          dbNext.set('name', serverName).write();
          _this.props.handleHide();
          message.success('保存成功', 2.5);
          // 更改成功后切换项目背景图
          //渲染背景图
          http.get('/getPngImageList')
            .then(
              res => {
                document.getElementById('container').style.backgroundImage = `url(http:\/\/${localStorage.getItem('serverUrl')}/static/images/${res.data[Math.floor(Math.random() * res.data.length)]}?v=${Math.random() * 10}`;
              })
            .catch(
              err => {
                console.log("接口请求失败");
              });
          this.props.ChangeSite(Math.random() * 9999);
        }
      });
    } else {
      this.form.validateFields((err, values) => {
        if (!err) {
          if (values['serverUrl'].indexOf("：") != -1) {
            values['serverUrl'] = values['serverUrl'].replace("：", ":")
          }
          if (values['serverUrl'].slice(-5, -4) != ":") {
            values['serverUrl'] = values['serverUrl'] + ":5000"
          }
          updateServerUrl(values['serverUrl']);
          localStorage.setItem('serverName', serverName)
          const adapterNext = new FileSync(dbPath)
          const dbNext = low(adapterNext)
          dbNext.set('name', serverName).write();
          _this.props.handleHide();
          message.success('保存成功', 2.5);
          // 更改成功后切换项目背景图
          //渲染背景图
          http.get('/getPngImageList')
            .then(
              res => {
                document.getElementById('container').style.backgroundImage = `url(http:\/\/${localStorage.getItem('serverUrl')}/static/images/${res.data[Math.floor(Math.random() * res.data.length)]}?v=${Math.random() * 10}`;
              })
            .catch(
              err => {
                console.log("接口请求失败");
              });
          this.props.ChangeSite(Math.random() * 9999);
        }
      });
    }

  }

  saveFormRef(form) {
    this.form = form;
  }
  render() {
    const { initialServerUrl, ChangeSite } = this.props;
    return (
      <Modal
        wrapClassName="login-modal-wrap"
        title= {language == 'en' ? 'Configuration' : '配置'}
        width={440}
        maskClosable={false}
        visible={this.props.visible}
        onCancel={this.props.handleHide}
        footer={[
          <span className={s['version']} > {language == 'en' ? 'Version' : '版本'}：{appConfig.project.version}</span>,
          <Button key="cancel" className={s['button-cancel']} onClick={this.props.handleHide}>
             {language == 'en' ? 'Cancel' : '取消'}
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleOk}>
            {language == 'en' ? 'Save' : '保存'}
          </Button>
        ]}
      >
        <ConfigModalFormWrap visible={this.props.visible} ref={this.saveFormRef} handleOk={this.handleOk} initialServerUrl={initialServerUrl} />

      </Modal>
    );
  }
}

export default ConfigModal
