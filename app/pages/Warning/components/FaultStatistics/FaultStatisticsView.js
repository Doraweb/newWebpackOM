import React from 'react';
import {Table, Button, Input ,message,DatePicker,Modal} from 'antd';
import s from './FaultStatisticsView.css'
import http from '../../../../common/http'
import moment from 'moment';
import PieChart from '../Pie'
import { choseMenuItemTo } from '../../modules/DebugModule'
import { store } from '../../../../index';
const { MonthPicker} = DatePicker;
/*
故障统计
*/
const TimeFormat = 'YYYY-MM'
const TimeFormat_2 = 'YYYY-MM-01 00:00:00'
const TimeFormat_3 = 'YYYY-MM-DD HH:mm:00'

class FaultStatisticsView extends React.Component{
    constructor(props){
        super(props)
        this.state={
            data:[],
            faultType:[],
            tableType:"",
            loading:false,
            time:moment().format(TimeFormat),
            startTime:"",
            endTime:"",
            PieData:[],
        }

        this.searchTypeTable = this.searchTypeTable.bind(this)
        this.changeTime = this.changeTime.bind(this)
        this.faultTypeSelection = this.faultTypeSelection.bind(this)
    }

    componentDidMount(){
        let userInfo = localStorage.getItem('userInfo')
        let userName = userInfo.slice(9,userInfo.indexOf('"',10))
        let faultType = []
        let startTime = moment().format(TimeFormat_2)
        let endTime = moment().format(TimeFormat_3)
        this.setState({
            startTime : startTime,
            endTime : endTime
        })
        http.post('/project/getConfig',{
            key:"fdd_auth"
        }).then(data=>{
            if(data.data){
                for(let i in data.data){
                    if(i == userName){
                        for(let j in data.data[i]){
                            if(j == "visable"){
                                for(let z in data.data[i][j]){
                                    faultType.push(z)
                                }
                            }
                        } 
                    }   
                    
                }
                this.setState({
                    tableType: faultType[0],
                    faultType: faultType
                }) 
                this.searchTypeTable(faultType[0]) 
            }
        }).catch(
            err=>{
                console.log("读取后台配置失败")
            }
        )
    }

    faultTypeSelection(){
        return this.state.faultType.map((item,index)=>{
            if(index==0){
                return (<Button style={{marginRight:30,backgroundColor:'rgb(46,162,248)'}} key={index} onClick={()=>this.changeType(item,index)} id={index}>{item}</Button>)
            }else{
                return (<Button style={{marginRight:30}} onClick={()=>this.changeType(item,index)} key={index} id={index}>{item}</Button>)  
            } 
        })
    }

    changeType(value,index){
        this.setState({
            tableType: value
        })
        for(let i=0;i<this.state.faultType.length;i++){
            document.getElementById(i).style.backgroundColor = ''
        }
        document.getElementById(index).style.backgroundColor = 'rgb(46,162,248)'
    
        this.searchTypeTable(value)  
      
    }

    searchTypeTable(type){
        let data = [],Type,userName
        this.setState({
            loading:true
        })
        if(type==undefined||type==""||type==null){
            Type = this.state.tableType
        }else{
            Type = type
        }
        let userInfo = localStorage.getItem('userInfo')
        userName = userInfo.slice(9,userInfo.indexOf('"',10))
        http.post('/fdd/statistic',{
            userName: userName,
            yearMonth: this.state.time,
            view: Type
        }).then(
            res=>{
                if(res.data&&res.err==0){
                    let PieData = []
                    for(let i in res.data){
                        data.push(res.data[i])
                        PieData.push({value:res.data[i].total,name:res.data[i].type})
                    }
                    this.setState({
                        data: data,
                        PieData: PieData,
                        loading: false
                    })
                }else{
                    this.setState({
                        loading: false
                    })
                    Modal.warning({
                        title:res.msg
                    })
                }
            }
        ).catch(
            err=>{
                this.setState({
                    loading: false
                })
            }
        )
    }

    //选择日期
    changeTime(e){
        let month = moment(e).format(TimeFormat)
        let startTime = moment(e).format(TimeFormat_2)
        let endTime
        if(startTime == moment().format(TimeFormat_2)){
            endTime = moment().format(TimeFormat_3)
        }else{
            endTime = moment(e).add(+1, 'month').format(TimeFormat_2)
        }
        this.setState({
            time: month,
            startTime : startTime,
            endTime : endTime
        })
    }

    disabledDate = (current)=> {
        // Can not select days before today and today
        return current && current.valueOf() > Date.now();
    }

    render(){
        return (
            <div className={s['container']}>
                <div className={s['header']}>
                    {/* <div style={{marginBottom:20,height:30}}>
                        <span >介质选择： </span>
                        {this.MediaSelection()}  
                    </div>
                    <div style={{marginBottom:20,height:30}}>
                        <span>报警类型： </span>
                        {this.TypeSelection()}  
                    </div> */}
                    <div>
                        <span>执行月份： </span>
                        <MonthPicker
                            format={TimeFormat}
                            style={{width:100,marginRight:10}}
                            onChange={this.changeTime}
                            defaultValue={moment(moment(), 'YYYY-MM')}
                            disabledDate={this.disabledDate}
                        />
                        <Button style={{marginRight:30}} onClick={()=>this.searchTypeTable(null)}>查询</Button> 
                        {this.faultTypeSelection()}   
                    </div>
                </div>
                <div className={s['table-content']}>
                    <FaultTable
                        data={this.state.data}
                        loading={this.state.loading}
                        startTime = {this.state.startTime}
                        endTime = {this.state.endTime}
                    />
                </div>
                <div className={s['pie-content']} style={{display:'inline-block'}}>
                    <PieChart data={this.state.PieData}/>
                </div>
                {/* <div className={s['pie-content']} style={{display:'inline-block'}}>
                    <PieChart/>
                </div>
                <div className={s['pie-content']} style={{display:'inline-block'}}>
                    <PieChart/>
                </div> */}
            </div>
        )
    }
}

class FaultTable extends React.Component{
    constructor(props){
        super(props)
        this.state={
            data:[]
        }
    }

    componentDidMount(){
    }
    
    render(){
        const columns = [
            {
                title: '车间\类型',
                dataIndex: 'type',
                key: 'type',
                width: 80,
            }, {
                title: '总数',
                dataIndex: 'total',
                key: 'total',
                width: 70,
                render:(text,record)=>{
                    return(
                       <div onClick={()=>{
                           localStorage.setItem('selectFaultType',record.type);
                           localStorage.setItem('selectStartTime',this.props.startTime);
                           localStorage.setItem('selectEndTime',this.props.endTime);
                           store.dispatch(choseMenuItemTo("FaultHandle"))}} 
                        style={{width:60,cursor:"pointer"}}>{text}</div> 
                    )
                }
            }, {
                title: '待分派',
                dataIndex: 'toBeAssigned',
                key: 'toBeAssigned',
                width: 70
            }, {
                title: '待维修',
                dataIndex: 'ongoing',
                key: 'ongoing',
                width: 70
            }, {
                title: '待确认',
                dataIndex: 'toBeConfirmed',
                key: 'toBeConfirmed',
                width: 70
            }, {
                title: '已确认',
                dataIndex: 'confirmed',
                key: 'confirmed',
                width: 70
            }
        ]
        return (
            <Table
                columns={columns}
                dataSource={this.props.data}
                pagination={false}
                bordered={true}
                loading={this.props.loading}
            >
            </Table>
        )
    }
}

export default FaultStatisticsView