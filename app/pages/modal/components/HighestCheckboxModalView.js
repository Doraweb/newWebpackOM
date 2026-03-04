/**
 * 主界面checkbox改值确认对话框
 */

import React from 'react';
import { Modal ,Spin, Alert, InputNumber, Select, Form, Input, Button, Col, Row, Checkbox, Icon, message } from 'antd'
import s from './ObserverModalView.css'
import cx from 'classnames';
import http from '../../../common/http';




class HighestCheckboxModalView extends React.Component{
  
    render(){
        let {
        visible,
        hideModal
        } = this.props

        console.info(this.props)
        const { getFieldDecorator } = this.props.form;
        visible = typeof visible === 'undefined' ? true : visible;
        return (
            <Modal
                title='优化选项'
                visible={visible}
                onCancel={hideModal}
                maskClosable={false}
                onOk={()=>{
                    this.props.checkboxMainSetting(this.props.idCom,this.props.setValue,this.props.text)
                }}
                >
                {
                    this.props.isLoading ? 
                        <Spin tip={this.props.modalConditionDict.status?`正在${this.props.checkboxState ? '关闭' :'开启'} "${this.props.text}" `:this.props.modalConditionDict.description}>
                        <Alert
                            message="提示"
                            description="数据正在更新"
                            type="info"
                        />  
                        </Spin>
                    : 
                    <div>
                        {`确定要${this.props.checkboxState ? '关闭' :'开启'} "${this.props.text}" 吗？` }
                    </div>    
                }
            </Modal> 
        )
    }
}



const HighestCheckboxModal = Form.create()(HighestCheckboxModalView);

export default HighestCheckboxModal