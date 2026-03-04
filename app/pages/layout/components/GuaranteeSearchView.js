import React from 'react';
import { Form, Modal, Input, Row,Button,Col,Select} from 'antd';
import ReactEcharts from '../../../lib/echarts-for-react'; 
import moment from 'moment';
import http from '../../../common/http';
import '../../../lib/echarts-themes/dark';
import { downloadUrl } from '../../../common/utils';
import Editor from './Editor'
import { stringify } from 'postcss';
import GuaranteeText from './GuaranteeText'
const { Option } = Select;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 10 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 }
  }
};
const FormItem = Form.Item;
class GuaranteeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        key:''
    }
    this.hide = this.hide.bind(this)
    this.exportPdf = this.exportPdf.bind(this)
    this.exportWord = this.exportWord.bind(this)
  }
  componentDidMount(){  
  }
  hide(){
      this.props.ViewMessage(false)
      this.setState({
        key:Math.random()
    })
  }
  exportPdf(){
    const {GuaranteeFixid} = this.props
    http.post('/fix/downloadFixContentInPdf',{
          "fixId": GuaranteeFixid   // INT
      }).then(
        data=>{
            if(data.err==0){
                downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/${data.data}`)
            }else{
                Modal.error({
                  content:'下载失败'
                })
            }
        }
    ).catch(
        msg=>{
            Modal.error({
              content:'下载失败'
            })
        }
    ) 
  }
  exportWord(){
    const {GuaranteeFixid} = this.props
    http.post('/fix/downloadFixContentInDocx',{
          "fixId": GuaranteeFixid   // INT
      }).then(
        data=>{
            if(data.err==0){
                downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/${data.data}`)
            }else{
                Modal.error({
                  content:'下载失败'
                })
            }
        }
      ).catch(
        msg=>{
            Modal.error({
              content:'下载失败'
            })
        }
    ) 
  }
  render() {
      const {ViewDisplay,ViewMessage,SeachGuaranteeSourceData,GuaranteeFixid} = this.props
      const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title="备注信息"
        width={600}
        visible={ViewDisplay}
        onCancel={this.hide}
        maskClosable={false}
        footer={null}
        key={this.state.key}
      >
         <div style={{height:'450px'}}>
            <div style={{borderBottom:'1px solid #313d4f',marginBottom:'10px',paddingBottom:'10px',marginTop:'-5px'}}>
                <Button type='primary' onClick={this.exportPdf} >下载为PDF</Button>
                <Button type='primary' style={{marginLeft:'10px'}} onClick={this.exportWord} >下载为Word</Button>
                {/* <Button type='primary' style={{marginLeft:'10px',marginBottom:'10px'}}>进入编辑</Button> */}
            </div>
            <div id='pdf' style={{height:"400px",overflowY:"scroll"}}>
                <div style = {{marginTop:'5px'}}>
                    <div style = {{fontSize:'16px'}}><div style={{display:'inline'}}>标题：</div>&nbsp;<div style={{display:'inline'}}>{SeachGuaranteeSourceData.title}</div></div>
                    <div style = {{marginTop:'15px',fontSize:'16px'}}><div style={{display:'inline'}}>报告人：</div>&nbsp;<div style={{display:'inline'}}>{SeachGuaranteeSourceData.reportUser}</div></div>
                    <div style = {{marginTop:'15px',fontSize:'16px'}}><div style={{display:'inline'}}>最近修改时间：</div>&nbsp;<div style={{display:'inline'}}>{SeachGuaranteeSourceData.reportTime}</div></div>
                    <GuaranteeText
                      SeachGuaranteeSourceData={SeachGuaranteeSourceData}
                    />
                 </div>   
            </div>
         </div>
       </Modal>
       )
       }
}
const GuaranteeSearchView = Form.create()(GuaranteeModal);
export default GuaranteeSearchView ;
