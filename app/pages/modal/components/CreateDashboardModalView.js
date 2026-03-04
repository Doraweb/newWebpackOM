/**
 * 创建 Dashboard 页面的模态框
 */

import React from 'react';
import { Modal, Form, Input, InputNumber, Button, Radio, Switch } from 'antd';
import s from './CreateDashboardModalView.css';
import {modalTypes} from '../../../common/enum';

const FormItem = Form.Item
const RadioGroup = Radio.Group;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8},
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
  },
};
let ModalStyle;
if(localStorage.getItem('serverOmd')=="persagy"){
  ModalStyle = 'PersagyDashboardModal';
}


class DashboardModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.onSubmit = this.onSubmit.bind(this)
  }

  onSubmit(e){
    e.preventDefault();
    let oldName = this.props.name;
    this.props.form.validateFields((err, values) => {
      if (!err) {
       if (typeof this.props.addPage === 'function' ) {
          this.props.addPage({ ...values });
       }else {  
          this.props.updatePage(oldName,{...values});
       }
        this.props.hideModal()
      }
    });
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    return(
      <Modal
        title={ typeof this.props.name === 'undefined' ? "Create Dashboard" : "Edit Dashboard"}
        visible={true}
        okText={ typeof this.props.name === 'undefined' ? "创建" : "保存"}
        cancelText="取消"
        onCancel={this.props.hideModal}
        maskClosable={false}
        onOk={this.onSubmit}
        wrapClassName={ModalStyle}
      >
        <Form onSubmit={this.onSubmit}>
          <FormItem
            label="页面名称"
            {...formItemLayout}
          >
            {
              getFieldDecorator("name", {
                rules:[{required: true, message:"请填写页面名称"}]
              })(
                <Input/>
              )
            }
          </FormItem>     
        </Form>
      </Modal>
    )
  }
}

const CreateDashboardModal = Form.create({
  mapPropsToFields: function (props) {
    return {
      name: Form.createFormField({
        value: props.name || ''
      })
    };
  }
})(DashboardModal);

export default CreateDashboardModal;
