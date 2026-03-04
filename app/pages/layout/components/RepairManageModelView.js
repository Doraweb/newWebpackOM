import React from 'react';
import { Form, Modal, Input, Row,Button,Col,Select,message,Table,DatePicker} from 'antd';
import ReactEcharts from '../../../lib/echarts-for-react'; 
import moment from 'moment';
import http from '../../../common/http';
import '../../../lib/echarts-themes/dark';
import { downloadUrl } from '../../../common/utils';
import { stringify } from 'postcss';
import s from './SeachEditor.css'
import RepairEditor from './repairEditor'
const { Option } = Select;
const { Search,TextArea} = Input;
const { RangePicker } = DatePicker
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
class RepairManageModalView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        key:'',
        timeFrom:moment().startOf('year').format("YYYY-MM-DD HH:mm:ss"),
        timeTo:moment().format("YYYY-MM-DD HH:mm:ss")
    }
    this.export = this.export.bind(this);
    this.search = this.search.bind(this);
    this.getChangeTime = this.getChangeTime.bind(this)
    this.ViewDetail = this.ViewDetail.bind(this)
    this.searchList = this.searchList.bind(this)
  }
  componentDidMount(){
  }
  componentWillReceiveProps(){
  }
  export(){
    http.get('/fix/downloadFixContentInExcel').then(
        data=>{
            if(data.err==0){
                downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/${data.data}`)
            }else{
                Modal.error('下载失败')
            }
        }
    ).catch(
        msg=>{
            Modal.error('下载失败')
        }
    )   
  }
  search(){
     const {timeFrom,timeTo} = this.state
    this.props.RepairDataAction(timeFrom,timeTo)
  }
  //查看详情
  ViewDetail(e){
    this.props.viewExperience(e.target.name)
  }
  searchList(values){
    const {getRepairData} = this.props
     http.post('/fix/keywordSearch',{
       "keyword":values
     }).then(
        data=>{
          if(data.err==0){
            getRepairData(data.data)
          }else{
            getRepairData([])
          }
        }
     ).catch(
        err=>{
           Modal.error({
             content:'数据请求异常'
           })
        }
     )
  }
  getChangeTime(timeArr){
      let timeFrom = moment(timeArr[0]).format("YYYY-MM-DD HH:mm:ss")
      let timeTo = moment(timeArr[1]).format("YYYY-MM-DD HH:mm:ss")
      this.setState({
        timeFrom : timeFrom,
        timeTo : timeTo
      })
  }
  render() {
      const {visible,onCancel,RepairManageData,RepairDataAction,viewExperience,ViewMessage,getRepairData} = this.props
    return (
      <Modal
        title='报修管理页面'
        visible={visible}
        onCancel={onCancel}
        width={'50%'}
        footer={null}
        maskClosable={false}
        key={Math.random}
      >
        <Search  
            style={{ width: 200 }}
            placeholder='请填写内容'
            onSearch={this.searchList}
        />
        <RangePicker style={{marginLeft:'10px'}} size="default" showTime
        defaultValue={[moment(moment().startOf('year').format('YYYY-MM-DD 00:00:00')), moment()]}
        onChange={this.getChangeTime} format={'YYYY-MM-DD HH:mm'}/>
        <Button type='primary'  style={{marginLeft:'15px'}} onClick={this.search}>查询</Button>
        <Button type='primary' style={{marginLeft:'15px'}} onClick={this.export}>报表输出</Button>
        <div className={s['hideScroll']}   id="repairManagement" style={{height:"700px",overflowY:"scroll"}}>
           {
            RepairManageData.length>0?
            RepairManageData.map((row,index)=>{
              return(
                <div>
                    <div style={{margin:'5px 0'}}>
                      <h2 style={{display:'inline'}}>标题:</h2>&nbsp;&nbsp;<h3 style={{display:'inline'}}>{row['title']}</h3>&nbsp;&nbsp;
                      <h2 style={{display:'inline'}}>作者:</h2>&nbsp;&nbsp;<h3 style={{display:'inline'}}>{row['reportUser']}</h3>&nbsp;&nbsp;
                      <h2 style={{display:'inline'}}>创建时间:</h2>&nbsp;&nbsp;<h3 style={{display:'inline'}}>{row['reportTime']}</h3>&nbsp;&nbsp;
                    </div>
                    <RepairEditor
                      content={row['content']}
                    />
                    <Button type='primary' name ={row['fixId']}  style={{marginTop:'10px'}} onClick={this.ViewDetail}>查看详情</Button> 
                </div>
              )
            }):[]
           }
        </div>
       </Modal>
       )
    } 
}
const RepairManageView = Form.create()(RepairManageModalView);
export default RepairManageView ;
