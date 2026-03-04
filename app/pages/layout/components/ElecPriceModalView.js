import { Modal, Spin } from 'antd'
import React, { Component } from 'react'
import appConfig from '../../../common/appConfig'
import ReactEcharts from '../../../lib/echarts-for-react'

class ElecPriceModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            nowElecPriceList: [],
        }
        this.chart = null;
        this.container = null;
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(this.state.nowElecPriceList) != JSON.stringify(nextState.nowElecPriceList)) {
            return true
        }
        if (this.props.visible != nextProps.visible) {
            if (nextProps.visible == true) {
                this.getNowElecPriceList()
            }
            return true
        }
        return false
    }

    getNowElecPriceList = () => {
        const elecPrice = appConfig.elecPrice
        const now = new Date()
        const month = now.getMonth() + 1
        let nowElecPriceList = []
        if (elecPrice['priceListM30_Month' + month]) {
            nowElecPriceList = [...elecPrice['priceListM30_Month' + month]]
        } else {
            nowElecPriceList = elecPrice.priceListM30 ? [...elecPrice.priceListM30] : []
        }
        nowElecPriceList.push(nowElecPriceList[nowElecPriceList.length - 1])
        nowElecPriceList = nowElecPriceList.map(item => {
            if (item == 0) {
                return elecPrice.priceGu
            } else if (item == 1) {
                return elecPrice.pricePing
            } else if (item == 2) {
                return elecPrice.priceFeng
            } else if (item == 3) {
                return elecPrice.priceJian
            }
        })
        this.setState({
            nowElecPriceList: nowElecPriceList,
        })
    }

    saveChartRef(refEchart) {
        if (refEchart) {
            this.chart = refEchart.getEchartsInstance();
        } else {
            this.chart = null;
        }
    }

    saveContainerRef(container) {
        this.container = container;
    }

    getChartOption() {
        return {
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                data: [
                    '00:00',
                    '00:30',
                    '1:00',
                    '1:30',
                    '2:00',
                    '2:30',
                    '3:00',
                    '3:30',
                    '4:00',
                    '4:30',
                    '5:00',
                    '5:30',
                    '6:00',
                    '6:30',
                    '7:00',
                    '7:30',
                    '8:00',
                    '8:30',
                    '9:00',
                    '9:30',
                    '10:00',
                    '10:30',
                    '11:00',
                    '11:30',
                    '12:00',
                    '12:30',
                    '13:00',
                    '13:30',
                    '14:00',
                    '14:30',
                    '15:00',
                    '15:30',
                    '16:00',
                    '16:30',
                    '17:00',
                    '17:30',
                    '18:00',
                    '18:30',
                    '19:00',
                    '19:30',
                    '20:00',
                    '20:30',
                    '21:00',
                    '21:30',
                    '22:00',
                    '22:30',
                    '23:00',
                    '23:30',
                    '00:00'
                ]
            },
            yAxis: {
                type: 'value'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            series: [
                {
                    data: this.state.nowElecPriceList,
                    type: 'line',
                    step: 'end',
                }
            ]
        };
    }

    render() {
        return (
            <Modal
                visible={this.props.visible}
                onCancel={() => this.props.onCancel(false)}
                title="每日电价趋势"
                maskClosable={false}
                footer={null}
                width={1000}
            >
                <div style={{ height: 400 }} ref={this.saveContainerRef}>
                    <ReactEcharts
                        style={{
                            height: '95%'
                        }}
                        ref={this.saveChartRef}
                        option={this.getChartOption()}
                        notMerge={true}
                        theme="dark"
                    />
                </div>
            </Modal>
        )
    }
}

export default ElecPriceModal