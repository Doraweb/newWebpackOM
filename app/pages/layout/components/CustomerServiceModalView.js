import React , { useEffect }from 'react';
import { Modal, Row, Col, Button, Icon } from 'antd';
import { MessageOutlined, CustomerServiceOutlined, CloseOutlined } from '@ant-design/icons';
import { color } from 'echarts';
import appConfig from '../../../common/appConfig';

const language = appConfig.language;




class CustomerServiceModal extends React.Component {
  styleTag = null;

  componentDidMount() {
    this.applyHeaderStyle('#ff7eb3', '#ff758c');
  }

  componentWillUnmount() {
    if (this.styleTag) {
      document.head.removeChild(this.styleTag)
    }
  }

  applyHeaderStyle = (gradientStart, gradientEnd) => {
    this.styleTag = document.createElement('style');
    this.styleTag.innerHTML = `
     .custom-modal .ant-modal-header {
        background: linear-gradient(135deg, ${gradientStart}, ${gradientEnd}) !important;
      }
    `;
    document.head.appendChild(this.styleTag);
  }


  render() {
    return (
    <Modal



       title={<div style={{ 
    textAlign: 'center',
    color: '#fff',
    fontWeight: 600,
    fontSize: '20px',
    letterSpacing: '1px'
  }}>{language == 'en' ? 'DOM Control Online Customer Service' : 'dom自控线上客服'}</div>}
  // wrapClassName='custom-modal'
  footer={null}
  styles={{
      header: {
        background: 'linear-gradient(135deg, #007bff, #0056b3)',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 123, 255, 0.2)'
      },
      body: {
        background: 'linear-gradient(145deg,rgb(8, 33, 53),rgb(9, 42, 77))',
        padding: '32px',
      }
    }}
    bodyStyle={{
      background: 'linear-gradient(145deg,rgb(19, 43, 63),rgb(27, 50, 75))',
    }}
  visible={this.props.visible}
  onCancel={this.props.onCancel}
    >
      {/* 引导文案 */}
      <div style={styles.guideText}>
        {language == 'en' ? 'You can choose any of the following methods to initiate communication based on your needs' : '您可以选择根据您的需求如下任一方式发起沟通'}
      </div>

      <Row 
        gutter={[8, 8]} 
        justify="space-around"
        style={styles.row}
      >
        {/* 第一列 - 客服微信 */}
        {/* <Col span={8}>
          <div style={styles.column}>
            <h3 style={styles.title}>一、客服微信：</h3>
            <img
              src="/images/wechat_qrcode.jpg"
              alt="微信二维码"
              style={styles.qrCode}
            />
            <p style={styles.contactText}>
              客服电话：{`\n`}
              <span style={styles.phoneNumber}>400-123-4567</span>
            </p>
          </div>
        </Col> */}

        {/* 第二列 - AI查询 */}
        <Col span={11}>
          <div style={styles.column}>
            <h3 style={styles.title}>{language == 'en' ? '1. Use AI to Query Issues' : '一、利用AI查询问题'}</h3>
            <Button
              type="primary"
              style={styles.aiButton}
              onClick={(show) => this.props.showAiChatModal(show)}
              // onClick={this.props.showModal(37)}
            >
              {language == 'en' ? 'Start AI Conversation' : '发起与AI的对话'}
            </Button>
          </div>
        </Col>

        {/* 第三列 - 在线客服 */}
        <Col span={13}>
          <div style={styles.column}>
            <h3 style={styles.title}>{language == 'en' ? '2. Seek Online Customer Service Help:' : '二、在线寻求客服帮助：'}</h3>
            <Button
              type="primary"
              style={{
                ...styles.serviceButton,
                fontSize: language == 'en' ? '14px' : '16px',
                padding: language == 'en' ? '8px 16px' : '0 32px',
                height: language == 'en' ? 'auto' : '56px',
                minHeight: language == 'en' ? '56px' : '56px',
                whiteSpace: language == 'en' ? 'normal' : 'nowrap',
                lineHeight: language == 'en' ? '1.4' : 'normal'
              }}
              onClick={this.props.showAiModal}
            >
              {language == 'en' ? 'Start Online Customer Service Conversation' : '发起与在线客服的对话'}
            </Button>
          </div>
        </Col>
      </Row>
    </Modal>
  );
  }
}

const styles = {
  guideText: {
    fontSize: '16px',
    color: '#34495e', // 更深的蓝色
    textAlign: 'center',
    margin: '0 0 32px 0',
    fontWeight: 500,
    letterSpacing: '0.8px',
    padding: '16px',
    borderRadius: '8px',
    background: 'rgba(131, 138, 151, 0.9)', // 更浅的背景色以衬托更深的文字
    boxShadow: '0 4px 12px rgba(52, 73, 94, 0.1)' // 深蓝色阴影
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    padding: '24px',
    borderRadius: '12px',
    background: '#ecf0f1', // 浅灰色背景
    boxShadow: '0 6px 16px rgba(52, 73, 94, 0.1)', // 深蓝色阴影
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'translateY(-4px)'
    }
  },
  title: {
    fontSize: '17px',
    color: '#2c3e50', // 更深的蓝色
    margin: '0 0 24px 0',
    fontWeight: 600,
    letterSpacing: '0.8px',
    textAlign: 'center',
    position: 'relative',
    paddingBottom: '8px',
    '::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '40px',
      height: '2px',
      background: '#2c3e50' // 更深的蓝色
    }
  },
  aiButton: {
    width: '100%',
    height: '56px',
    marginTop: 'auto',
    fontSize: '16px',
    padding: '0 32px',
    background: 'linear-gradient(45deg, #34495e, #2c3e50)', // 深蓝色渐变
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(52, 73, 94, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(52, 73, 94, 0.4)'
    }
  },
  serviceButton: {
    width: '100%',
    height: '56px',
    marginTop: 'auto',
    fontSize: '16px',
    padding: '0 32px',
    background: 'linear-gradient(45deg, #2c3e50, #34495e)', // 深蓝色渐变
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(44, 62, 80, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(44, 62, 80, 0.4)'
    }
  }
};


export default CustomerServiceModal;
