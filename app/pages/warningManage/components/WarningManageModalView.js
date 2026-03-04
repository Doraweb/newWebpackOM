// 报警管理页面 

import React from 'react';
import {Modal} from 'antd'

import AlarmManageLayer from '../../alarm';
import appConfig from '../../../common/appConfig';

const language = appConfig.language
class WarningManageModalView extends React.Component{
    
    constructor(props) {
        super(props)
        this.state={
            value : "minutsWarning"
        }
    }
   
    handleChange = (e) => {
        this.setState({value:e.target.value})
    }

    render(){
        const {visible,onCancel} = this.props
        return (
            <Modal
                visible={visible}
                onCancel={onCancel}
                footer={null}
                width={900}
                maskClosable={false}
                title={language == 'en'?'Alarm Management':'报警管理'}
            >
                <div>
                    <AlarmManageLayer/>
                </div>
            </Modal>
        )
    }
}

export default WarningManageModalView