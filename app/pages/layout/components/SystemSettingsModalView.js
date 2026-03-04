/**
 * 系统配置模态框
 */
import React from 'react';
import { Modal, Select } from 'antd';
import appConfig from '../../../common/appConfig'
import { maximizeAppWindow, reloadAppWindow } from '../../../core/cmdRenderer';

const Option = Select.Option
const language = appConfig.language



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


class SystemSettingsModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dbLanguage: db.has("language").value() ? db.getState().language : "zhCN",
        };
        this.changeLanguage = this.changeLanguage.bind(this)
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

    changeLanguage(value) {
        const dbLanguage = this.state.dbLanguage
        Modal.confirm({
            title: dbLanguage && dbLanguage == 'en' ? 'Do you want to switch languages?' : '提示',
            content: dbLanguage && dbLanguage == 'en' ? null : '确定要切换语言吗？',
            onOk: () => {
                db.set('language', value).write();
                this.setState({
                    dbLanguage: value
                })
                localStorage.setItem('language', value)
                this.props.hideModal()
                localStorage.setItem('forceHomePageAfterRestart', 'true')
                //重启electron进程
                reloadAppWindow()
            },
            onCancel() { }
        });
    }

    render() {

        const dbLanguage = this.state.dbLanguage
        return (
            <Modal
                visible={this.props.visible}
                title={<span style={{ fontSize: '16px', fontWeight: 500 }}>{dbLanguage && dbLanguage == 'en' ? 'Settings' : '系统设置'}</span>}
                onCancel={this.props.hideModal}
                footer={null}
                width={360}
                destroyOnClose
            >
                <div style={{
                    marginBottom: '10px',
                    marginLeft: '-10px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start'
                    }}>

                        <span style={{
                            fontSize: '14px',
                            width: dbLanguage === 'en' ? '150px' : '100px',
                            textAlign: 'right',
                            marginRight: '16px'
                        }}>
                            {dbLanguage && dbLanguage == 'en' ? 'Preferred languages:' : '语言选择：'}
                        </span>
                        <Select
                            onSelect={this.changeLanguage}
                            style={{ width: '140px' }}
                            defaultValue={dbLanguage}
                            placeholder="请选择语言"
                            showArrow
                        >
                            <Option value='en'>English</Option>
                            <Option value='zh'>中文（简体）</Option>
                        </Select>
                    </div>
                </div>
            </Modal>
        )
    }
}

export default SystemSettingsModal
