import React from 'react'
import { Modal, Button, Spin, Alert } from 'antd'
import s from './ReconnectionModalView.css'
import { history } from '../../../index'
import appConfig from '../../../common/appConfig';

const language = appConfig.language
class ReconnectionView extends React.Component {
    constructor(props) {
        super(props)

        this.flag = false
    }

    componentWillReceiveProps(nextProps) {
        // 判断当模态框已经打开，并且将要关闭时才渲染
        if (
            this.props.reconnectModal.visible
            && !nextProps.reconnectModal.visible
            && !this.flag
        ) {

            let pathname = history.getCurrentLocation().pathname;
            var isObserver = !!pathname.match(/^\/observer/);
            // 请求正常，重新绘制页面
            const { closeObserver, renderScreen, pageId } = this.props.parmsDict

            if (isObserver) {
                closeObserver();
                this.props.hide();
                renderScreen(pageId);
                // let name = JSON.parse(localStorage.getItem('registData')).name ;
                // let password = JSON.parse(localStorage.getItem('registData')).pwd;
                // http.post('/login',{
                //     "name":name,
                //     "pwd":pwd
                // }).then(
                //     data=>{

                //     }
                // ).catch(
                //     err=>{

                //     }
                // )
            }
        }
        if (this.props.reconnectModal.visible) {
            this.flag = false
        }

    }

    handleClick = () => {
        this.flag = true
        this.props.resetFailedTime(true)
    }

    render() {
        const { resetFailedTime, reconnectModal } = this.props
        let visible = reconnectModal.visible
        // if (!visible){
        //     return null
        // }
        return (
            <div>
                {
                    visible ?
                        <Modal
                            maskClosable={false}
                            footer={[<Button onClick={this.handleClick} >{language === 'en' ? 'Cancel Reconnection' : '取消重新连接'}</Button>]}
                            visible={visible}
                            closable={false}
                            title={language === 'en' ? 'Prompt Box' : '提示框'}
                        >
                            <div className={s['common']} >
                                <Spin />
                            </div>
                            <div className={s['common']} >
                                {language === 'en' ? 'Server connection failed, trying to reconnect...' : '服务器连接失败，正在尝试重新连接...'}
                            </div>
                        </Modal>
                        :
                        ''
                }
            </div>

        )
    }

}

export default ReconnectionView