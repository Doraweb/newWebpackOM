import { Button, Input, Modal } from 'antd'
import React, { Component } from 'react'
import { Radio, Table } from 'antd'
import http from '../../../common/http'
import ReactEcharts from '../../../lib/echarts-for-react'
import appConfig from '../../../common/appConfig'

const language = appConfig.language
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
class EnergyPriceModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            energyData: {},
            newEnergyData: {},
            type: "ElecPrice"
        }
        this.chart = null;
        this.container = null;
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.visible != nextProps.visible) {
            if (nextProps.visible == true) {
                this.getEnergyPriceConfig()
            }
            return true
        }
        if (JSON.stringify(this.state.energyData) != JSON.stringify(nextState.energyData)) {
            return true
        }
        if (JSON.stringify(this.state.newEnergyData) != JSON.stringify(nextState.newEnergyData)) {
            return true
        }
        if (this.state.type != nextState.type) {
            return true
        }
        return false
    }

    getEnergyPriceConfig = () => {
        http.get('/getEnergyPriceConfig').then(res => {
            if (res.err == 0) {
                this.setState({
                    energyData: res.data,
                })
            } else {
                Modal.error({
                    title: language == "en" ? 'Tip' : '提示',
                    content: res.msg
                })
                this.setState({
                    energyData: {},
                })
            }
        }).catch(err => {
            Modal.error({
                title: language == "en" ? 'Tip' : '提示',
                content: err.message
            })
            this.setState({
                energyData: {},
            })
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
        const { energyData, type } = this.state
        const monthList = language == "en" ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] :
            ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        return {
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                data: monthList
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
                    data: energyData[type] && energyData[type]['priceListMonth'] ? energyData[type]['priceListMonth'] : [],
                    type: 'line',
                    label: {
                        show: true,
                        position: 'top'
                    },
                }
            ]
        };
    }

    onChange = e => {
        this.setState({
            type: e.target.value
        })
    }

    editPrice = (value, type, index) => {
        const { newEnergyData } = this.state
        let newPriceObj = newEnergyData
        newPriceObj[type]['priceListMonth'][index] = Number(value)
        this.setState({
            newEnergyData: newPriceObj
        })
    }

    editEnergyPrice = () => {
        this.setState({
            newEnergyData: JSON.parse(JSON.stringify(this.state.energyData))
        })
        const columns = [
            {
                title: language == "en" ? "Month" : '月份',
                dataIndex: 'month',
                key: 'month',
            },
            {
                title: language == "en" ? "Water" : '水',
                dataIndex: 'WaterPrice',
                key: 'WaterPrice',
                width: 100,
                render: (text, record, index) => {
                    return <Input size='small' defaultValue={text} onChange={(e) => { this.editPrice(e.target.value, 'WaterPrice', index) }} />
                }
            },
            {
                title: language == "en" ? "Electricity" : '电',
                dataIndex: 'ElecPrice',
                key: 'ElecPrice',
                width: 100,
                render: (text, record, index) => {
                    return <Input size='small' defaultValue={text} onChange={(e) => { this.editPrice(e.target.value, 'ElecPrice', index) }} />
                }
            },
            {
                title: language == "en" ? "Gas" : '气',
                dataIndex: 'GasPrice',
                key: 'GasPrice',
                width: 100,
                render: (text, record, index) => {
                    return <Input size='small' defaultValue={text} onChange={(e) => { this.editPrice(e.target.value, 'GasPrice', index) }} />
                }
            }
        ]

        const dataSource = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
        const { energyData } = this.state
        const str = language == "en" ? " - Avg. Price" : '月平均价格'
        for (let key in energyData) {
            if (energyData[key]['priceListMonth'].length == 0) {
                dataSource.map((item, index) => {
                    dataSource[index]['month'] = (index + 1) + str
                })
            }
            energyData[key]['priceListMonth'].map((item, index) => {
                dataSource[index]['month'] = (index + 1) + str
                dataSource[index][key] = item
            })
        }

        Modal.confirm({
            title: language == "en" ? "Modify Energy Prices" : '修改能源价格',
            width: 500,
            content: (
                <div style={{ marginLeft: -35, marginTop: 20 }}>
                    <Table
                        dataSource={dataSource}
                        columns={columns}
                        pagination={false}
                        size='small'
                    />
                </div>
            ),
            onOk: () => {
                const { newEnergyData } = this.state
                http.post('/setEnergyPriceConfig', {
                    data: newEnergyData
                }).then(res => {
                    if (res.err == 0) {
                        this.getEnergyPriceConfig()
                    } else {
                        Modal.error({
                            title: language == "en" ? "Tip" : '提示',
                            content: res.msg
                        })
                    }
                }).catch(err => {
                    Modal.error({
                        title: language == "en" ? "Tip" : '提示',
                        content: err.message
                    })
                })
            }
        })
    }


    render() {
        return (
            <Modal
                title={language == "en" ? "Energy Prices" : "能源价格"}
                visible={this.props.visible}
                onCancel={this.props.handleCancel}
                footer={null}
                maskClosable={false}
                width={800}
            >
                <div>
                    <RadioGroup value={this.state.type} onChange={this.onChange}>
                        <RadioButton value="ElecPrice">{language == "en" ? "Monthly Electricity Price Trend" : "逐月电价趋势"}</RadioButton>
                        <RadioButton value="WaterPrice">{language == "en" ? "Monthly Water Price Trend" : "逐月水价趋势"}</RadioButton>
                        <RadioButton value="GasPrice">{language == "en" ? "Monthly Gas Price Trend" : "逐月气价趋势"}</RadioButton>
                    </RadioGroup>
                    {
                        appConfig.userData.role > 2 ?
                            <Button onClick={this.editEnergyPrice} style={{ float: 'right' }}>{language == "en" ? "Settings" : "设置"}</Button>
                            :
                            ""
                    }
                </div>
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

export default EnergyPriceModal