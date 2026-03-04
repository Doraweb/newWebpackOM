/**
 * 注册框
 */
import React from 'react';
import { Form, Modal, Input, Button, message } from 'antd';
import s from './ConfigModal.css';
import appConfig from '../../common/appConfig';
import http from '../../common/http';
import {addOperation} from '../../common/utils'
import { closeLoginWindow, afterLoginSuccess } from '../../core/cmdRenderer';
import { updateServerUrl } from '../../common/appConfig';

const FormItem = Form.Item;
const remote = require('@electron/remote');

const formItemLayout = {
  labelCol: {
    xs: { span: 5 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 19 },
    sm: { span: 19 },
  },
};

let argv = remote.process.argv;
const initialServerUrl = localStorage.getItem('serverUrl');
class RegistModalForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.register = this.register.bind(this)
    this.hide = this.hide.bind(this)
    this.copy = this.copy.bind(this)
    this.close = this.close.bind(this) 
    this.closeWindow = this.closeWindow.bind(this)
  }
  register(){
    let _this = this
    let pysiteVersion = JSON.parse(window.localStorage.getItem('pysiteVersion'))
    this.props.form.validateFields(['serialNumber'],(err,value)=>{
        if(!err){
          if(pysiteVersion>=903){
            return http.post('/license/saveResponseNo',{
              licVer: 1,
              "key":_this.props.form.getFieldValue('serialNumber')
            }).then(
                data=>{
                    if(data.err==0){
                        //初始化刷新到首页的标记
                        localStorage.setItem('creatAppWindow',1);
                        localStorage.setItem('maxBtn',1);
                        http.post('/login',{
                            name:_this.props.name,
                            pwd:_this.props.password
                        }).then(
                              data=>{
                                window.localStorage.setItem('leftday',JSON.stringify({
                                    leftday:data.license.leftdays
                                  }))
                                  addOperation('/operationRecord/addLogin',{
                                    "userName": _this.props.name,
                                    "type":1,
                                    "address":'',
                                    "lang":"zh-cn"
                                  },'记录用户登录操作失败')
                                afterLoginSuccess()
                            }
                        )
                    }else{
                        Modal.error({
                            content:"请填写正确的注册码"
                        })
                    }
                }
            ).catch(
                err=>{
                    Modal.error({
                        content:"请填写正确的注册码"
                    })
                }
            )
          }else{
            Modal.error({
              title:"dompysite版本低于0.9.3",
              content:"请先升级dompysite版本，再进行软件授权"
            })
          }
        }
    })
  }
  copy(){
    let machineText = this.props.form.getFieldValue('machineName')
    let machine = document.getElementById('machine')
    machine.value = machineText
    machine.select();
    document.execCommand("Copy")
}
  //关闭窗口
  hide(){
    this.props.form.resetFields()
      if(window.localStorage.getItem('leftday')===null||this.props.leftday==0){
        window.localStorage.setItem('userInfo', JSON.stringify({
            name:this.props.name,
            pwd:this.props.pwd,
            role:this.props.role
          }));     
        addOperation('/operationRecord/addLogin',{
            "userName": this.props.name,
            "type":1,
            "address":'',
            "lang":"zh-cn"
        },'记录用户登录操作失败')
        afterLoginSuccess()
      }else{
        this.props.handleHide()
      }
  }
  close(){
    this.props.handleHide()
    this.props.form.resetFields()
  }
  closeWindow(){
    closeLoginWindow();
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
        <Modal
        wrapClassName="login-modal-wrap3"
        title="注册"
        width={220}
        maskClosable={false}
        visible={this.props.visible}
        onOk={this.register}
        onCancel={this.close}
        cancelText={window.localStorage.getItem('leftday')===null||this.props.leftday?'试用5分钟':'取消'}
        footer ={null}
      >
        <Form style={{marginBottom:15}}>
            <FormItem
                label="机器码"
                {...formItemLayout}
            >
                {getFieldDecorator('machineName', {
                    initialValue:this.props.machinecode
                })(
                <Input disabled style={{width:'165px'}}/>
                )}
                <Button type='primary' style={{display:'inline'}} onClick={this.copy}>复制</Button>
                <input id='machine' style={{opacity:'0',position:'absolute',zIndex:'-2'}} ></input>
            </FormItem>
            <div style={{marginLeft:15,marginBottom:5}}>(请将机器码发送给软件授权商寻求注册支持)</div>
            <FormItem
                label="认证序列号"
            >
                {getFieldDecorator('serialNumber',{
                rules: [{
                    required: true,
                    message: '认证序列号不能为空'
                }]
                })(
                <Input/>
                )}
            </FormItem>
            <div style={{textAlign:'center',position:'absolute',right:4,bottom:13}}>
              {
                argv[2]&&argv[4]&&argv[2]!=="babel-register"&&argv[4]!=="babel-polyfill"?
                <Button style={{marginRight:'10px',borderRadius:8,padding:'0px 8px 0px 8px'}} size='large' onClick={this.closeWindow} >退出软件</Button>
                :
                <span></span>
              }
                <Button style={{marginRight:'10px',borderRadius:8,padding:'0px 8px 0px 8px'}} size='large' onClick={this.hide} >{window.localStorage.getItem('leftday')===null||this.props.leftday===0?'试用5分钟':'取消'}</Button>
                <Button style={{marginRight:'10px',borderRadius:8,padding:'0px 8px 0px 8px'}} size='large' type='primary' onClick={this.register}>确定</Button>      
          </div>
                
        </Form>
      </Modal>   
    );
  }
}
const RegistModal  = Form.create()(RegistModalForm);
export default RegistModal
