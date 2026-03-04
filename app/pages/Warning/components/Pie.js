import React from 'react';
import { Button, message,Spin } from 'antd';
import ReactEcharts from '../../../lib/echarts-for-react';
// echars 皮肤注册
import '../../../lib/echarts-themes/dark';

import moment from 'moment';
import http from '../../../common/http';
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00'
import s from './Pie.css';

class PieChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      loading: false,
    };

    this.chart = null;
    this.container = null;

    this.saveChartRef2 = this.saveChartRef2.bind(this);
    this.saveContainerRef2 = this.saveContainerRef2.bind(this);
    this.getChartOption2 = this.getChartOption2.bind(this)
  }
  static get defaultProps() {
    return {
      points: [],
      data: {
        map: {},
        time: []
      }
    }
  }
  componentDidMount() {
   
  }   

  componentWillReceiveProps(nextProps){
 
  }

getChartOption2() {
    const {data} = this.props
    let legengData = []
    data.map((item,index)=>{
        legengData.push(item.name)
    })
    return {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: legengData
        },
        series: [
            {
                name: '故障来源',
                type: 'pie',
                radius: '60%',
                center: ['55%', '50%'],
                data: data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
  }
  // echart实例
  saveChartRef2(refEchart) {
    if (refEchart) {
      this.chart = refEchart.getEchartsInstance();
    } else {
      this.chart = null;
    }
  }
// 容器实例
  saveContainerRef2(container) {
    this.container = container;
  }

  render() {
    return (
      <div className={s['charts-container']} ref={this.saveContainerRef2}>
          {
            this.state.loading ? 
            <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '30px'}}>
              <Spin tip="Loading…"/>
            </div>
            :
             <ReactEcharts
              style={{
                height: '100%'
              }}
              ref={this.saveChartRef2}
              option={this.getChartOption2()}
              theme={"dark"}
              notMerge={true}
            />
          }
      </div>
    );
  }
}

PieChart.propTypes = {
};

export default PieChart;
