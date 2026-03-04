import React from 'react';
import { Modal, Tabs, Spin, Button } from 'antd'

import http from '../../../common/http';
import ReactEcharts from '../../../lib/echarts-for-react';
import moment, { duration } from 'moment';

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
class HistoryOnlineStatus extends React.Component{
    constructor(props){
        super(props);
        this.state={
            data:[],
            time:[],
            date:moment().format(TIME_FORMAT),
            loading:false
        }
    }

    shouldComponentUpdate(nextProps){
        if(nextProps.visible == true && nextProps.visible != this.props.visible){
            this.getDataHttp(this.state.date,nextProps.id)
        }else if(nextProps.visible == false && nextProps.visible != this.props.visible){
            this.setState({
                data:[],
                time:[],
                date:moment().format(TIME_FORMAT),
            })
        }
        return true
    }

    saveChartRef = (chart) => {
        if (chart) {
          console.info(1)
          this.chart = chart.getEchartsInstance();
          console.info( this.chart )
        } else {
          this.chart = chart;
        }
    }

    //上一天
    lastDay = () => {
        let date = moment(this.state.date).add(-1,'days').format(TIME_FORMAT)
        this.setState({
            date: date
        })
        this.getDataHttp(date)
    }

    //下一天
    nextDay = () => {
        let date = moment(this.state.date).add(1,'days').format(TIME_FORMAT)
        this.setState({
            date: date
        })
        this.getDataHttp(date)
    }

    //今天
    today = () => {
        let date = moment().format(TIME_FORMAT)
        this.setState({
            date: date
        })
        this.getDataHttp(date)
    }

    getDataHttp = (date,id) => {
        let timeBegin = moment(date).startOf('days').format(TIME_FORMAT)
        let timeEnd = moment(date).endOf('days').format(TIME_FORMAT)
        const Id = id != undefined?id:this.props.id
        let data = []
        let time = []
        this.setState({
            loading: true
        })
        http.post('/network/queryHistoryOnlineStatus',{
            timeBegin: timeBegin,
            timeEnd: timeEnd,
            id: Id
        }).then(res=>{
            if(res.err == 0){
                res.data.map(item=>{
                    data.push(item.delayMins)
                    time.push(item.time)
                })
                this.setState({
                    data: data,
                    time: time,
                    loading: false
                })
            }else{
                Modal.info({
                    title:res.msg,
                    zIndex:10000
                })
                this.setState({
                    time:[],
                    data:[],
                    loading: false
                })
            }
        }).catch(err=>{
            this.setState({
                time:[],
                data:[],
                loading: false
            })
            Modal.info({
                title:'查询历史在离线接口请求失败',
                zIndex:10000
            })
        })
    }

    getChartOption() {
		let time = this.state.time;
		let data = this.state.data;
        let text = moment(this.state.date).format('YYYY-MM-DD')
		return {
			title: {
				text: text+' 心跳延迟分钟数历史曲线',
                subtext:this.props.name,
                left:'center',
                top:10,
                subtextStyle: {
                    color: "#aaa"
                }
			},
			tooltip: {
				trigger: 'axis'
			},
			toolbox: {
				show: true,
				feature: {
					dataView: {
						show: true,
					}
				},
				right: '2%'
			},
			grid: {
				top: '14%',
				left: '4%',
				right: '5%',
				bottom: '5%',
				containLabel: true
			},
			xAxis: [
				{
					type: 'category',
					data: time
				}
			],
			yAxis: [
				{
					type: 'value'
				}
			],
			series:
		        {
					name: '延时分钟数',
					type: 'line',
					label: {
						normal: {
							show: true, //折线上不显示数据
							position: 'top'
						}
					},
					data: data,
				}

		}
	}

    render(){
        return (
            <Modal 
                title='延时查询'
                visible={this.props.visible}
                footer={null}
                onCancel={this.props.handleCancel}
                zIndex={9999}
                width={1150}
                maskClosable={false}
                style={{marginTop:50}}
            >
                <div style={{height:600}}>
                    <div>
                        <Button onClick={this.lastDay}>前一天</Button>
                        <Button onClick={this.today}>今天</Button>
                        <Button onClick={this.nextDay}>后一天</Button>
                    </div>
                    <div style={{marginTop:20}}>
                        <Spin spinning={this.state.loading}>
                            <ReactEcharts
                                style={{
                                    height:540
                                }}
                                option={this.getChartOption()}
                                ref = {this.saveChartRef}
                                theme="dark"
                                notMerge={true}
                                lazyUpdate={true}
                            />
                        </Spin>
                        
                    </div>
                </div>
            </Modal>
        )
    }
}

export default HistoryOnlineStatus