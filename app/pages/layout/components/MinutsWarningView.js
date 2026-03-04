import React, { Component } from 'react'
import s from './RealtimeWarningModalView.css'
// echars 皮肤注册
import http from '../../../common/http';
import appConfig from '../../../common/appConfig';
import { DatePicker,Row,Col, Form ,Button ,Select ,message,Spin,Input,Layout,Table,Modal} from 'antd';
import moment from 'moment'
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const language = appConfig.language
let str, level01Style, level02Style, level03Style;
if(localStorage.getItem('serverOmd')=="best"){
    str = 'warning-config-best'
}else{
    str = ''
}
if(localStorage.getItem('serverOmd')=="persagy"){
  str = 'persagy-warningManage-table'
  level01Style = {
    background: 'rgba(247,256,192,1)',
    borderRadius: '9px',
    fontSize: '12px',
    fontFamily: 'PingFangSC-Regular,PingFang SC',
    fontWeight: '400',
    color: '#eee',
    padding:'4px'
  }
  level02Style = {
    background: 'rgba(250,241,209,1)',
    borderRadius: '9px',
    fontSize: '12px',
    fontFamily: 'PingFangSC-Regular,PingFang SC',
    fontWeight: '400',
    color: 'rgba(170,120,3,1)',
    padding: '4px'
  }
  level03Style = {
    background:'rgba(253,226,226,1)',
    borderRadius:'9px',
    fontSize:'12px',
    fontFamily:'PingFangSC-Regular,PingFang SC',
    fontWeight:'400',
    color:'rgba(172,47,40,1)',
    padding: '4px'
  }
}else{
  str = ''
}

const FormItem  = Form.Item
const TimeFormat = 'YYYY-MM-DD HH:mm:ss'
const onChosedStyle = { //选择后样式
    backgroundColor:'#4862B0',
    color :"#fff"
  };
  const onChosedWarningStyle = { //选择后样式
    backgroundColor:'#4862B0',
    color :"red"
  }
  
  const unChosedStyle ={  //未选择样式
    backgroundColor : '#1B2431',
    color :"#fff"
  }
  const unChosedWarningStyle ={  //未选择样式
    backgroundColor : '#1B2431',
    color :"red"
  }
  const warningStyle = {color :"red"}
  
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14 },
    },
  };
  const formItemLayoutWithOutLabel = {
    wrapperCol: {
      xs: { span: 24, offset: 0 },
      sm: { span: 14, offset: 6 },
    },
  };
class MinutsWarningView extends React.Component {
 
    constructor(props){
        super(props)
        this.state={
            startTime:moment().subtract(5,'minute').format(TimeFormat),
            endTime:moment().format(TimeFormat),
            tableData:[]
        }

        this.container = null;
        this.searchPoint = this.searchPoint.bind(this);
        //this.loadTable = this.loadTable.bind(this)
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.handleCancel = this.handleCancel.bind(this)
    }

    static get defaultProps() {
      return {
        points: [],
        data:[]
      }
    }
     
    componentWillReceiveProps(nextProps) {
        // let visible = nextProps.modal.type;
        // if(visible==2019){
            this.searchPoint("");
        // }
    }
    

    componentDidMount(){
        let startTime =  moment().startOf('days')
        let endTime =   moment()
        this.setState({
            startTime:startTime,
            endTime:endTime
        })
        this.searchPoint(""); 
    }

    // loadTable(){
    //     const {startTime,endTime} = this.state
    //     const _this = this
    //     this.setState({
    //         loading : true
    //     })
    //     http.post('/warning/getHistory',{
    //        timeFrom : startTime, //变量
    //         timeTo : moment(endTime).format(TimeFormat)
    //     }).then( 
    //         data=>{
    //             _this.setState({
    //                 tableData : data.map( (item,i)=>{
    //                     item['no'] = i + 1
    //                     if(item['level'] == 1){
    //                         item['level'] = '一般'
    //                     }
    //                     if(item['level'] == 2){
    //                         item['level'] = '严重'
    //                     }
    //                     if(item['level'] == 3){
    //                         item['level'] = '非常严重'
    //                     }
    //                     return item
    //                 }),
    //                 loading : false
    //             })
    //         }
    //      )
    // }
    searchPoint(value){
        let startTime = moment().subtract(5,'minute').format(TimeFormat);
        let endTime = moment().format(TimeFormat);
        const _this = this
        this.setState({
            loading : true
        })
        console.log(language)
        http.post('/warning/getRealtime',{
            second:300,
            lan:language
        }).then( 
            data=>{
                _this.setState({
                    tableData : data.filter( (item,i)=>{
                        item['no'] = i + 1
                        if(item['level'] == 1){
                            item['level'] = '一般'
                        }
                        if(item['level'] == 2){
                            item['level'] = '严重'
                        }
                        if(item['level'] == 3){
                            item['level'] = '非常严重'
                        }
                        return new RegExp(value,"i").test(item.strBindPointName) || new RegExp(value,"i").test(item.info)
                    }),
                    loading:false
                })
            }
        )
    }
    


    handleCancel() {
        const {onCancel} = this.props
        onCancel();
      }

    // 容器实例
    saveContainerRef(container) {
        this.container = container;
    }


    
    render() {
        const {endTime,startTime,endOpen} = this.state
        const {width,height} = this.props
        const {  visible , chosedKey} = this.props
        const { getFieldDecorator } = this.props.form
        const {realtimeWarningData} = this.state
        return (
          <div style={{width:"865px",marginTop:'20px'}} className={str}>
          {/* // <Modal
          //   title="实时报警"
          //   visible={visible}
          //   onCancel={ ()=>{this.handleCancel()} }
          //   footer={null}
          //   maskClosable={false}
          //   width={800}
          //   wrapClassName={str}
          // > */}
        {/* <div className={s['realtime-wrap']}>  */}
          
          {/* <div className={s['realtime-details-wrap']}> */}
            <div className={s['realtime-details-warning']}>
                <Table
                    columns={[{
                        title: '开始时间',
                        dataIndex: 'time',
                        key:'time',
                        width: 150,
                        sorter: (a, b) => Date.parse(a.time.replace('-','/').replace('-','/')) - Date.parse(b.time.replace('-','/').replace('-','/'))
                        }, {
                        title: '结束时间',
                        dataIndex: 'endtime',
                        key:'endtime',
                        width: 150,
                        sorter: (c, d) => Date.parse(c.endtime.replace('-','/').replace('-','/')) - Date.parse(d.endtime.replace('-','/').replace('-','/'))
                        }, {
                        title: '信息',
                        dataIndex: 'info',
                        width: 200,
                        },{
                        title: '等级',
                        dataIndex: 'level',
                        width: 100,
                        render:(text) => {
                            if(text === '一般') {
                              return (
                                <span style={level01Style} >{text}</span>
                              )
                            } else if (text === '严重') {
                              return (
                                <span style={level02Style} >{text}</span>
                              )
                            } else {
                              return (
                                <span style={level03Style} >{text}</span>
                              )
                            }
                        }
                        },{
                            title: '相关点名',
                            dataIndex: 'strBindPointName',
                            width: 200,
                        }]}     
                    pagination={false}
                    dataSource={this.state.tableData}
                    size="small"
                    rowKey='no'
                    bordered
                    scroll={{ y: 350 }}
                    loading={this.state.loading}
                />

                {/* <Form
                  >
                    <FormItem
                      label='开始'
                      {...formItemLayout}
                    >
                      {getFieldDecorator('startTime',{
                        initialValue : this.state.tableData.length?this.state.tableData[chosedKey]['time'] : ''
                      })(<Input/>)}
                    </FormItem>
                    <FormItem
                      label='结束'
                      {...formItemLayout}
                    >
                      {getFieldDecorator('endTime',{
                        initialValue : this.state.tableData.length?this.state.tableData[chosedKey]['endtime'] : ''
                      })(<Input/>)}
                    </FormItem>
                    <FormItem
                      label='级别'
                      {...formItemLayout}
                    >
                      {getFieldDecorator('level',{
                        initialValue : this.state.tableData.length?this.state.tableData[chosedKey]['level']: ''
                      })(<Input/>)}
                    </FormItem>

                    <FormItem
                      label='描述'
                      {...formItemLayout}
                    >
                      {getFieldDecorator('info',{
                        initialValue : this.state.tableData.length?this.state.tableData[chosedKey]['info'] : ' '
                      })(<Input type='textarea' rows={4}/>)}
                    </FormItem>
                  </Form> */}
            </div>
          {/* </div> */}
        {/* </div> */}
      {/* </Modal> */}
      </div>
           
                
                
            
        )
    }
}


const MinutsWarningComponent = Form.create()(MinutsWarningView)

/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */


export default  MinutsWarningComponent


