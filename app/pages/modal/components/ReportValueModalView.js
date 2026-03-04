/**
 * 报表页面设定值模态框
 */
import React from 'react' ;
import { Modal, Form, InputNumber, Spin, Alert ,Input,Button} from 'antd'
import s from './OptimizeValueModalView.css'
import cx from 'classnames';

import http from '../../../common/http';

const FormItem = Form.Item;


const formItemLayout = {
    labelCol: {
      span: 8
    },
    wrapperCol: {
      span: 15
    },
  };

class SettingValueModal extends React.Component {
  constructor(props) {
    super(props);

  

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  //点击确定，提交
  handleSubmit(e) {
    const {pointTime,form,pointName} = this.props
    
    let defaultValue = form.getFieldsValue()
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.handleOk(values,pointTime,pointName);
      }
    });
  }
 
  getSpinOrForm = () => {
    if(this.props.isLoading){
        return (
          <Spin tip={this.props.modalConditionDict.status? '正在修改设定值' : this.props.modalConditionDict.description}>
              <Alert
                  message="提示"
                  description="数据正在更新"
                  type="info"
              />
          </Spin>
        )
    }else{
        return this.getForm()
    }
  }

  getForm = () => {
    const { getFieldDecorator } = this.props.form;
    return (
        <Form>
            <FormItem
            {...formItemLayout}
            label="当前值："
            >
            {getFieldDecorator('currentValue', {
                initialValue: this.props.pointValue ,
            })(
                <Input style={{width:160,backgroundColor:"transparent"}} disabled={true} />
            )}
            </FormItem>
            <FormItem
            {...formItemLayout}
            label="设置新值"
            >
            {getFieldDecorator('settingValue', {
                initialValue: this.props.pointValue ,
            })(
                <Input style={{width:160}} />
            )}
            </FormItem>
        </Form>
    )
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let { visible } = this.props;
    
    visible = typeof visible === 'undefined' ? true : visible;
      
    return (
      <Modal
        title={this.props.isLoading ? '指令设置进度提示':'确认指令' }
        width={500}
        visible={visible}
        onCancel={this.props.hideModal}
        maskClosable={false}
        footer={
          this.props.isLoading ? 
          [<Button onClick={this.handleSubmit} >确认</Button>] 
          :
          [<Button onClick={this.props.hideModal} >取消</Button>,
            <Button onClick={this.handleSubmit} >确认</Button>]
        }
      >
      {this.getSpinOrForm()}
      </Modal>
    );
  }
}
const ReportValueModal = Form.create()(SettingValueModal);

export default ReportValueModal


