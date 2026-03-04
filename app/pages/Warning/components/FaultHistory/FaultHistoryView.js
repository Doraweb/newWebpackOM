import React from 'react';
import {Table, Button, Input ,message,DatePicker} from 'antd';
import s from './FaultHistoryView.css'
import http from '../../../../common/http'

const { RangePicker} = DatePicker;
/*
故障统计
*/
const TimeFormat = 'YYYY-MM-DD HH:MM:SS'
class FaultHistoryView extends React.Component{
    constructor(props){
        super(props)
        this.state={
            media:[],
            FaulType:[],
            position:[]
        }

        this.MediaSelection = this.MediaSelection.bind(this)
        this.TypeSelection = this.TypeSelection.bind(this)
    }

    componentDidMount(){
        let media = [],FaulType = [],position = []
        http.post('/project/getConfig',{
            key:"fdd_specy"
        }).then(data=>{
            if(data.data&&data.data.group){
                for(let i=0;i<data.data.group.length;i++){
                    if(data.data.group[i].name == '介质'){
                        media = data.data.group[i].children    
                    }
                    if(data.data.group[i].name == '类型'){
                        FaulType = data.data.group[i].children
                    }
                    if(data.data.group[i].name == '位置'){
                        position = data.data.group[i].children
                    }
                }
                this.setState({
                    media: media,
                    FaulType: FaulType,
                    position: position
                })
            }
        })
    }

    MediaSelection(){
        return this.state.media.map((item,index)=>{
            return (<Button style={{marginRight:30}}>{item.name}</Button>)
        })
    }

    TypeSelection(){
        return this.state.FaulType.map((item,index)=>{
            return (<Button style={{marginRight:30}}>{item.name}</Button>)
        })
    }

    render(){
        return (
            <div className={s['container']}>
                <div className={s['header']}>
                    <div style={{marginBottom:20,height:30}}>
                        <span>介质选择： </span>
                        {this.MediaSelection()}  
                    </div>
                    <div style={{marginBottom:20,height:30}}>
                        <span>报警类型： </span>
                        {this.TypeSelection()}  
                    </div>
                    <div>
                        <span>报警时间： </span>
                        <RangePicker
                            showTime
                            format={TimeFormat}
                            placeholder={['开始时间', '结束时间']}
                            style={{width:300,marginRight:10}}
                        />
                        <Button style={{marginRight:30}}>查询</Button>  
                        <Button style={{marginRight:30}}>今日报警</Button>
                        <Button style={{marginRight:30}}>本周报警</Button>   
                        <Button style={{marginRight:30}}>本月报警</Button>   
                    </div>
                </div>
                <div className={s['table-content']}>
                    <FaultTable/>
                </div>
            </div>
        )
    }
}

class FaultTable extends React.Component{
    constructor(props){
        super(props)
    }

    componentDidMount(){
    }
    
    render(){
        const data = [];
        const columns = [
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                width: 50,
            }, {
                title: '名称',
                dataIndex: 'name',
                key: 'name',
                width: 70
            }, {
                title: '类型',
                dataIndex: 'type',
                key: 'type',
                width: 70
            }, {
                title: '等级',
                dataIndex: 'rank',
                key: 'rank',
                width: 70
            }, {
                title: '发生时间',
                dataIndex: 'startTime',
                key: 'startTime',
                width: 70
            }, {
                title: '详情',
                dataIndex: 'content',
                key: 'content',
                width: 70
            }, {
                title: '位置',
                dataIndex: 'seat',
                key: 'seat',
                width: 70
            }, {
                title: '分组',
                dataIndex: 'group',
                key: 'group',
                width: 70
            }, {
                title: '部门',
                dataIndex: 'class',
                key: 'class',
                width: 70
            }, {
                title: '处理人',
                dataIndex: 'people',
                key: 'people',
                width: 70
            }, {
                title: '状态',
                dataIndex: 'state',
                key: 'state',
                width: 70
            }, {
                title: '开始处理时间',
                dataIndex: 'start',
                key: 'start',
                width: 70
            }, {
                title: '结束处理时间',
                dataIndex: 'end',
                key: 'end',
                width: 70
            }, {
                title: '处理时长',
                dataIndex: 'time',
                key: 'time',
                width: 70
            }
        ]
        return (
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                bordered={true}
            >
            </Table>
        )
    }
}

export default FaultHistoryView