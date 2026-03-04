import React from 'react';
import { Form, Modal, Input,Spin,Row,Button,Col,Select,message,Table,DatePicker, Layout} from 'antd';
import ReactEcharts from '../../../lib/echarts-for-react'; 
import moment from 'moment';
import http from '../../../common/http';
import '../../../lib/echarts-themes/dark';
import { downloadUrl } from '../../../common/utils';
import { stringify } from 'postcss';
import s from './SeachEditor.css'
import S from './RepairManageModelView.css'
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
}
const { Header, Footer, Sider, Content } = Layout;
const FormItem = Form.Item;
class RepairManageModelView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        key:'',
        dataSource:[],
        timeFrom:moment().startOf('year').format("YYYY-MM-DD HH:mm:ss"),
        timeTo:moment().format("YYYY-MM-DD HH:mm:ss"),
        columns:[
          {
            title:this.initTitle('报修标题'),
            dataIndex: 'title',
            key: 'title',
            render:(text,record)=>{
              return(
                  <div style={{cursor:'pointer',textAlign:'center'}} onClick={(e)=>{this.SeletData(record['fixId'])}}>{text}</div>
              )
            }
          }
        ],
        content:'暂无数据',
        level:0
    }
    this.export = this.export.bind(this);
    this.search = this.search.bind(this);
    this.getChangeTime = this.getChangeTime.bind(this);
    this.ViewDetail = this.ViewDetail.bind(this);
    this.searchList = this.searchList.bind(this);
    this.SeletData = this.SeletData.bind(this);
    this.resolved = this.resolved.bind(this);
    this.Unsolved = this.Unsolved.bind(this);
    // this.hide = this.hide.bind(this)
  }
  componentDidMount(){
    const {timeFrom,timeTo,RepairManageData} = this.state
    this.props.RepairDataAction(timeFrom,timeTo)
    if(RepairManageData!==undefined){
      this.setState({
        content:RepairManageData[0]
      })
    } 
  }
  componentWillReceiveProps(){ 
  }
  //数据筛选
  SeletData(id){
    const {CurrentData} = this.props
    this.props.RepairManageData.map(item=>{
      if(item.fixId==id){
        CurrentData(item)
      }
    })
  }
  //标题样式
  initTitle(colName){
    return <span style={{display:'table',margin:'0 auto'}}>{colName}</span>
  }
  //报表导出 
  export(){
    const {level} = this.state
    http.post('/fix/downloadFixContentInExcel',{
        "result":level
    })
    .then(
        data=>{
            if(data.err==0){
                downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/${data.data}`)
            }else{
              Modal.error({
                content:'数据请求异常'
              })
            }
        }
    ).catch(
        msg=>{
          Modal.error({
            content:'数据请求异常'
          })
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
    let _this = this
    const {getRepairData} = _this.props
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
  //已解决
  resolved(){
    const {CurrentData,getRepairData} = this.props
    let Arr = []
    this.props.RepairManageData.map(item=>{
      if(item.result=='已解决'){
        Arr.push(item)
      }
    })
    CurrentData(Arr[0])
    this.setState({
      level:1,
      dataSource:Arr
    })
  }
  //未解决
  Unsolved(){
    const {CurrentData,getRepairData} = this.props
    let Arr = []
    this.props.RepairManageData.map(item=>{
      if(item.result=='未解决'){
        Arr.push(item)
      }
    })
    CurrentData(Arr[0])
    this.setState({
      level:0,
      dataSource:Arr
    })
  }
  render() {
      const {visible,RepairVisiable,RepairManageData,RepairDataAction,viewExperience,
        ViewMessage,getRepairData,RepairCurrentData,CurrentData} = this.props
    return (
            <div className={S['container']}>
                <Layout>
                  <Sider>
                    <Table
                      className={S['Scoll']}
                      style={{height:'800px'}}  
                      columns={this.state.columns}
                      pagination={false}
                      dataSource = {this.state.dataSource.length>0?this.state.dataSource:RepairManageData}
                    />
                  </Sider>
                  <Layout style={{overflow:"hidden"}}> 
                    <Header>
                      <Search  
                        style={{ width: 200 }}
                        placeholder='请填写内容'
                        onSearch={this.searchList}
                        />
                      <RangePicker style={{marginLeft:'10px'}} size="default" showTime
                      defaultValue={[moment(moment().startOf('year').format('YYYY-MM-DD 00:00:00')), moment()]}
                      onChange={this.getChangeTime} format={'YYYY-MM-DD HH:mm'}/>
                      <Button type='primary'  style={{marginLeft:'15px'}} onClick={this.search}>查询</Button>
                      <Button type='primary' style={{marginLeft:'15px'}} onClick={this.resolved}>已解决</Button> 
                      <Button type='default' style={{marginLeft:'15px'}} onClick={this.Unsolved}>未解决</Button>
                      <Button type='primary' style={{marginLeft:'15px'}} onClick={this.export}>报表输出</Button>  
                    </Header>
                    <Content  style={{padding:'10px 0 0 10px',height:'800px',overflowY:"scroll"}}>
                      {RepairCurrentData!==undefined?
                          <div style={{margin:'5px 0'}}>
                            <div>
                              <h2 style={{display:'inline'}}>标题:</h2>&nbsp;&nbsp;<h3 style={{display:'inline'}}>{RepairCurrentData.title}</h3>&nbsp;&nbsp;                          
                            </div>
                            <div>
                              <h2 style={{display:'inline'}}>作者:</h2>&nbsp;&nbsp;<h3 style={{display:'inline'}}>{RepairCurrentData.reportUser}</h3>&nbsp;&nbsp;
                            </div>
                            <div>
                              <h2 style={{display:'inline'}}>创建时间:</h2>&nbsp;&nbsp;<h3 style={{display:'inline'}}>{RepairCurrentData.reportTime}</h3>&nbsp;&nbsp;
                            </div>
                            <RepairEditor
                              key={Math.random()}
                              content={RepairCurrentData.content}
                            />
                          </div>
                      :'暂无数据'}
                    </Content>
                  </Layout>
                </Layout>
            </div>
          // :
          // <div className={s['repairHeight']} style={{top:'45px',background:'#bfbfbf4a',width:'100%',left:'0',position:'absolute',left:"0",zIndex:'9999',textAlign:'center'}}>
          //   <Spin tip="Loading..." wrapperClassName="absolute-spin" style={{position:'absolute',top:'50%',left:"50%",marginTop:"-21px",marginLeft:'-40px'}}  spinning={true}></Spin>
          // </div>
        // }
      //  </Modal>
       )
    } 
}
const repairManageModelView = Form.create()(RepairManageModelView);
export default repairManageModelView ;
