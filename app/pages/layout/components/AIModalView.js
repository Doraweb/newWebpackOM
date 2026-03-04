import React from 'react';
import { Modal, Button } from 'antd';
import appConfig from '../../../common/appConfig';
// import { useModalContext } from '../components/AIModalContext';

const language = appConfig.language;

const AIModalView = ({visible , hideModal}) => {
    return (
        <Modal
            title={language == 'en' ? 'Online Customer Service' : '在线客服'}
            visible={visible}
            onCancel={hideModal}
            footer={[
                <Button key="back" onClick={hideModal}>
                    {language == 'en' ? 'Close' : '关闭'}
                </Button>
            ]}
        >
            <p>{language == 'en' ? 'Online customer service feature is not yet available, please stay tuned!' : '在线客服功能暂未开通，敬请期待！'}</p>
        </Modal>
    )
}

export default AIModalView;