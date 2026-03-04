import React  from  'react'
import {  Modal , Table ,Tabs} from "antd";
import http from '../../../common/http';

const TabPane = Tabs.TabPane;
let modalToggleClass;
let index = 0;
if(localStorage.getItem('serverOmd')=="persagy"){
    modalToggleClass = 'persagy-modal-style';
}else{
    modalToggleClass = 'DeviceInfo-style'
}
let {CHcolumns,Pricolumns,Seccolumns,CWPcolumns,CTcolumns,AHUcolumns,EAFANcolumns,AirValuecolumns,AirCompressorCTcolumns,AirCompressorCWPcolumns,AirCompressorcolumns,Dryercolumns} = []
let nameList = [
  {No:"编号",Width:50},
  {Year:"购买年份",Width:50},
  {Name:"名称",Width:110},
  {RatingCoolingCapacity:"额定冷量",Width:80},
  {RatingCOP:"额定COP",Width:80},
  {RatingPower:"额定功率",Width:80},
  {Brand:"品牌",Width:80},
  {Model:"型号",Width:100},
  {RatingH:"额定扬程",Width:50},
  {RatingFlow:"额定流量",Width:80},
  {WithVSD:"是否变频",Width:50},
  {RatingAirVolume:"额定风量",Width:80},
  {Head:"扬程",Width:50},
  {TotalHead:"全压",Width:100},
  {RoomName:"房间名称",Width:100},
  {SystemNo:"系统编号",Width:50},
  {EquipName:"设备名称",Width:100},
  {Type:"型号及规格",Width:100},
  {Quantity:"数量",Width:50},
  {Size:"外形尺寸",Width:100},
  {AirVolumn:"风量",Width:80},
  {PressDrop:"压损",Width:80},
  {HeatLoad:"热量",Width:80},
  {HotWaterFlow:"热水流量",Width:80},
  {Remark:"备注",Width:100},
  {FlowVelocity:"流速",Width:80},
  {HotWaterDiam:"热水口径",Width:60},
  {Length:"管长",Width:50},
  {AbsRoughNess:"管道绝对粗糙度",Width:80},
  {NorminalDiam:"管道公称直径",Width:50},
  {WaterDensity:"冷水密度",Width:60},
  {CrossSecArea:"计算断面积",Width:80},
  {Efficiency:"效率",Width:80},
  {MinimumFlow:"最小流量",Width:80},
  {RatingHeatingCapacity:"制热量",Width:80},
  {CoolingEfficiency:"制冷效率",Width:80},
  {HeatingEfficiency:"制热效率",Width:80},
  {Form:"泵形式",Width:80},
  {Voltage:"电压",Width:50},
  {idCom:"设备标识",Width:100},
  {Specs:"规格",Width:80},
  {WorkPressure:"工作压力",Width:80}
]

class DeviceInfo extends React.Component{
    constructor(props){
        super(props)
        this.state={
            CHdataSource: [],
            PridataSource: [],
            CWPdataSource: [],
            CTdataSource: [],
            SecdataSource: [],
            AHUdataSource: [],
            EAFANdataSource: [],
            AirValuedataSource:[],
            DryerdataSource:[],
            AirCompressorCTdataSource:[],
            AirCompressorCWPdataSource:[],
            AirCompressordataSource:[],
            loading: false,
        }  
        this.getInfo = this.getInfo.bind(this)   
        this.getColumns = this. getColumns.bind(this)
    }

    componentDidMount(){
      this.getInfo()
    }

    shouldComponentUpdate(nextProps,nextState){
      if(nextProps.visible!=this.props.visible){
        if(nextProps.visible==true){
          this.getInfo()
        }
        return true
      }
      return false
    }

    //动态改变表头
    getColumns(items){
      let obj = {}
      let arr = []
      let flag
      for(let i=0;i<items.length;i++){
        Object.assign(obj,items[i])
      }
      for(let key in obj){
        arr.push(key)
      }
      let Columns = arr.map((item)=>{
        let Index
        for(let i=0;i<nameList.length;i++){
          if(nameList[i][item]!=undefined){
            Index = i
          }
        }
        if(Index!=undefined){
          return {title:nameList[Index][item],key:item,dataIndex:item,width:nameList[Index]["Width"],render:(text)=>{return <div style={{userSelect:'text'}}>{text}</div>}}
        }else{
          return {title:item,key:item,dataIndex:item,width:80,render:(text)=>{return <div style={{userSelect:'text'}}>{text}</div>}} 
        }   
      })
      for(let i=0;i<Columns.length;i++){
        flag = Columns[i]
        if(Columns[i].key=="No"&&i!=0){
          Columns[i] = Columns[0]
          Columns[0] = flag
          i = 0
        }
        if(Columns[i].key=="Name"&&i!=1){
          Columns[i] = Columns[1]
          Columns[1] = flag
          i = 0
        }
        if(Columns[i].key=="Brand"&&i!=2){
          Columns[i] = Columns[2]
          Columns[2] = flag
          i = 0
        }
        if(Columns[i].key=="Model"&&i!=3){
          Columns[i] = Columns[3]
          Columns[3] = flag
          i = 0
        }
      }
      return Columns
    }

    getInfo(){
      http.post('/project/getConfig',{
        key:"globalconfig"
      }).then(
            data=>{   
              let ChParams=[],PriChWPParams=[],CWPParams=[],CTParams=[],SecChWPParams=[],AHUParams=[],EAFanParams=[],DamperParams=[],AirCompressorCTParams=[],AirCompressorCWPParams=[],AirCompressorParams=[],DryerParams=[];
              if(data.data.ChillerPlantRoom!=null){
                data.data.ChillerPlantRoom.map(item=>{
                  if(item.ChParams){
                    item.ChParams.map(item2=>{
                      if(item2['No']<10){
                        item2.idCom = item.RoomName + 'Ch0' + item2['No']
                      }else{
                        item2.idCom = item.RoomName + 'Ch' + item2['No']
                      }
                    })
                    ChParams = ChParams.concat(item.ChParams)
                  }
                  if(item.PriChWPParams){
                    item.PriChWPParams.map(item2=>{
                      if(item2['No']<10){
                        item2.idCom = item.RoomName + 'PriChWP0' + item2['No']
                      }else{
                        item2.idCom = item.RoomName + 'PriChWP' + item2['No']
                      }
                    })
                    PriChWPParams = PriChWPParams.concat(item.PriChWPParams)
                  }
                  if(item.CWPParams){
                    item.CWPParams.map(item2=>{
                      if(item2['No']<10){
                        item2.idCom = item.RoomName + 'CWP0' + item2['No']
                      }else{
                        item2.idCom = item.RoomName + 'CWP' + item2['No']
                      }
                    })
                    CWPParams = CWPParams.concat(item.CWPParams)
                  }
                  if(item.CTParams){
                    item.CTParams.map(item2=>{
                      if(item2['No']<10){
                        item2.idCom = item.RoomName + 'CT0' + item2['No']
                      }else{
                        item2.idCom = item.RoomName + 'CT' + item2['No']
                      }
                    })
                    CTParams = CTParams.concat(item.CTParams)
                  }
                  if(item.SecChWPParams){
                    item.SecChWPParams.map(item2=>{
                      if(item2['No']<10){
                        item2.idCom = item.RoomName + 'SecChWP0' + item2['No']
                      }else{
                        item2.idCom = item.RoomName + 'SecChWP' + item2['No']
                      }
                    })
                    SecChWPParams = SecChWPParams.concat(item.SecChWPParams)
                  }
                  if(item.AHUParams){
                    item.AHUParams.map(item2=>{
                      if(item2['No']<10){
                        item2.idCom = item.RoomName + 'AHU0' + item2['No']
                      }else{
                        item2.idCom = item.RoomName + 'AHU' + item2['No']
                      }
                    })
                    AHUParams = AHUParams.concat(item.AHUParams)
                  }
                  if(item.EAFanParams){
                    item.EAFanParams.map(item2=>{
                      if(item2['No']<10){
                        item2.idCom = item.RoomName + 'EAFan0' + item2['No']
                      }else{
                        item2.idCom = item.RoomName + 'EAFan' + item2['No']
                      }
                    })
                    EAFanParams = EAFanParams.concat(item.EAFanParams)
                  }
                  if(item.DamperParams){
                    item.DamperParams.map(item2=>{
                      if(item2['No']<10){
                        item2.idCom = item.RoomName + 'Damper0' + item2['No']
                      }else{
                        item2.idCom = item.RoomName + 'Damper' + item2['No']
                      }
                    })
                    DamperParams = DamperParams.concat(item.DamperParams)
                  }
                  if(item.AirCompressorCTParams){
                    item.AirCompressorCTParams.map(item2=>{
                      if(item2['No']<10){
                        item2.idCom = item.RoomName + 'AirCompressorCT0' + item2['No']
                      }else{
                        item2.idCom = item.RoomName + 'AirCompressorCT' + item2['No']
                      }
                    })
                    AirCompressorCTParams = AirCompressorCTParams.concat(item.AirCompressorCTParams)
                  }
                  if(item.AirCompressorCWPParams){
                    item.AirCompressorCWPParams.map(item2=>{
                      if(item2['No']<10){
                        item2.idCom = item.RoomName + 'AirCompressorCWP0' + item2['No']
                      }else{
                        item2.idCom = item.RoomName + 'AirCompressorCWP' + item2['No']
                      }
                    })
                    AirCompressorCWPParams = AirCompressorCWPParams.concat(item.AirCompressorCWPParams)
                  }
                  if(item.AirCompressorParams){
                    item.AirCompressorParams.map(item2=>{
                      if(item2['No']<10){
                        item2.idCom = item.RoomName + 'AirCompressor0' + item2['No']
                      }else{
                        item2.idCom = item.RoomName + 'AirCompressor' + item2['No']
                      }
                    })
                    AirCompressorParams = AirCompressorParams.concat(item.AirCompressorParams)
                  }
                  if(item.DryerParams){
                    item.DryerParams.map(item2=>{
                      if(item2['No']<10){
                        item2.idCom = item.RoomName + 'Dryer0' + item2['No']
                      }else{
                        item2.idCom = item.RoomName + 'Dryer' + item2['No']
                      }
                    })
                    DryerParams = DryerParams.concat(item.DryerParams)
                  }
                })
                if(ChParams!=[]&&ChParams[0]!=undefined){
                  CHcolumns = this.getColumns(ChParams)
                }
                if(PriChWPParams!=[]&&PriChWPParams[0]!=undefined){
                  Pricolumns = this.getColumns(PriChWPParams)
                }
                if(CWPParams!=[]&&CWPParams[0]!=undefined){
                  CWPcolumns = this.getColumns(CWPParams)
                }
                if(CTParams!=[]&&CTParams[0]!=undefined){
                  CTcolumns = this.getColumns(CTParams)
                }
                if(SecChWPParams!=[]&&SecChWPParams[0]!=undefined){
                  Seccolumns = this.getColumns(SecChWPParams)
                }
                if(AHUParams!=[]&&AHUParams[0]!=undefined){
                  AHUcolumns = this.getColumns(AHUParams)
                }
                if(EAFanParams!=[]&&EAFanParams[0]!=undefined){
                  EAFANcolumns = this.getColumns(EAFanParams)
                }
                if(DamperParams!=[]&&DamperParams[0]!=undefined){
                  AirValuecolumns = this.getColumns(DamperParams)
                }
                if(AirCompressorCTParams!=[]&&AirCompressorCTParams[0]!=undefined){
                  AirCompressorCTcolumns = this.getColumns(AirCompressorCTParams)
                }
                if(AirCompressorCWPParams!=[]&&AirCompressorCWPParams[0]!=undefined){
                  AirCompressorCWPcolumns = this.getColumns(AirCompressorCWPParams)
                }
                if(AirCompressorParams!=[]&&AirCompressorParams[0]!=undefined){
                  AirCompressorcolumns = this.getColumns(AirCompressorParams)
                }
                if(DryerParams!=[]&&DryerParams[0]!=undefined){
                  Dryercolumns = this.getColumns(DryerParams)
                }
              }
              localStorage.setItem("deviceDetails",JSON.stringify({
                ChParams:ChParams,
                PriChWPParams:PriChWPParams,
                CWPParams:CWPParams,
                CTParams:CTParams,
                SecChWPParams:SecChWPParams,
                AHUParams:AHUParams,
                EAFanParams:EAFanParams,
                DamperParams:DamperParams,
                AirCompressorCTParams:AirCompressorCTParams,
                AirCompressorCWPParams:AirCompressorCWPParams,
                AirCompressorParams:AirCompressorParams,
                DryerParams:DryerParams
              }))
              this.setState({ 
                CHdataSource : ChParams,
                PridataSource: PriChWPParams,
                CWPdataSource: CWPParams,
                CTdataSource : CTParams,
                SecdataSource : SecChWPParams,
                AHUdataSource: AHUParams,
                EAFANdataSource: EAFanParams,
                AirValuedataSource:DamperParams,
                AirCompressorCTdataSource: AirCompressorCTParams,
                AirCompressorCWPdataSource: AirCompressorCWPParams,
                AirCompressordataSource: AirCompressorParams,
                DryerdataSource: DryerParams, 
              })
            }
      )
    }

    render(){
        const {
            visible
        } = this.props
        return (
            <Modal
                className={modalToggleClass}
                zIndex={4000}
                title="设备台帐"
                visible= {visible}
                onCancel={this.props.onCancel}
                maskClosable={false}
                width={1500}
                key={Math.random}
                style={{height:"800"}}
                footer={null}
            >
                <div>
                <Tabs defaultActiveKey="1" type="card">
                  <TabPane tab="冷机" key="1">
                    <Table 
                          dataSource={this.state.CHdataSource} 
                          columns={CHcolumns}
                          loading={this.state.loading}
                          pagination={false}
                          scroll={{
                              y: 550
                          }}
                      />
                  </TabPane>
                  {
                    this.state.PridataSource==[]||this.state.PridataSource[0]==undefined?
                    ""
                    :
                    <TabPane tab="一次泵" key="2">
                      <Table 
                            dataSource={this.state.PridataSource} 
                            columns={Pricolumns}
                            loading={this.state.loading}
                            pagination={false}
                            scroll={{
                                y: 550
                            }}
                        />
                    </TabPane>
                  }
                  {
                    this.state.SecdataSource==[]||this.state.SecdataSource[0]==undefined?
                    ""
                    :
                    <TabPane tab="二次泵" key="3">
                      <Table 
                            dataSource={this.state.SecdataSource} 
                            columns={Seccolumns}
                            loading={this.state.loading}
                            pagination={false}
                            scroll={{
                                y: 550
                            }}
                        />
                    </TabPane>
                  }
                  {
                    this.state.CWPdataSource==[]||this.state.CWPdataSource[0]==undefined?
                    ""
                    :
                    <TabPane tab="冷却泵" key="4">
                      <Table 
                            dataSource={this.state.CWPdataSource} 
                            columns={CWPcolumns}
                            loading={this.state.loading}
                            pagination={false}
                            scroll={{
                                y: 550
                            }}
                        />
                    </TabPane>
                  }
                  {
                    this.state.CTdataSource==[]||this.state.CTdataSource[0]==undefined?
                    ""
                    :
                    <TabPane tab="冷却塔" key="5">
                      <Table 
                            dataSource={this.state.CTdataSource} 
                            columns={CTcolumns}
                            loading={this.state.loading}
                            pagination={false}
                            scroll={{
                                y: 550
                            }}
                      />
                    </TabPane>
                  }
                  {
                    this.state.AHUdataSource==[]||this.state.AHUdataSource[0]==undefined?
                    ""
                    :
                    <TabPane tab="AHU" key="6">
                      <Table 
                            dataSource={this.state.AHUdataSource} 
                            columns={AHUcolumns}
                            loading={this.state.loading}
                            pagination={false}
                            scroll={{
                                y: 550
                            }}
                        />
                    </TabPane>
                  }
                  {
                    this.state.EAFANdataSource==[]||this.state.EAFANdataSource[0]==undefined?
                    ""
                    :
                    <TabPane tab="排风机" key="7">
                      <Table 
                            dataSource={this.state.EAFANdataSource} 
                            columns={EAFANcolumns}
                            loading={this.state.loading}
                            pagination={false}
                            scroll={{
                                y: 550
                            }}
                        />
                    </TabPane>
                  }
                  {
                    this.state.AirValuedataSource==[]||this.state.AirValuedataSource[0]==undefined?
                    ""
                    :
                    <TabPane tab="风阀" key="8">
                      <Table 
                            dataSource={this.state.AirValuedataSource} 
                            columns={AirValuecolumns}
                            loading={this.state.loading}
                            pagination={false}
                            scroll={{
                                y: 550
                            }}
                        />
                    </TabPane>
                  }
                  {
                    this.state.DryerdataSource==[]||this.state.DryerdataSource[0]==undefined?
                    ""
                    :
                    <TabPane tab="干燥机" key="9">
                      <Table 
                            dataSource={this.state.DryerdataSource} 
                            columns={Dryercolumns}
                            loading={this.state.loading}
                            pagination={false}
                            scroll={{
                                y: 550
                            }}
                        />
                    </TabPane>
                  }
                  {
                    this.state.AirCompressordataSource==[]||this.state.AirCompressordataSource[0]==undefined?
                    ""
                    :
                    <TabPane tab="空压机" key="10">
                      <Table 
                            dataSource={this.state.AirCompressordataSource} 
                            columns={AirCompressorcolumns}
                            loading={this.state.loading}
                            pagination={false}
                            scroll={{
                                y: 550
                            }}
                        />
                    </TabPane>
                  }
                  {
                    this.state.AirCompressorCTdataSource==[]||this.state.AirCompressorCTdataSource[0]==undefined?
                    ""
                    :
                    <TabPane tab="空压冷却塔" key="11">
                      <Table 
                            dataSource={this.state.AirCompressorCTdataSource} 
                            columns={AirCompressorCTcolumns}
                            loading={this.state.loading}
                            pagination={false}
                            scroll={{
                                y: 550
                            }}
                        />
                    </TabPane>
                  }
                  {
                    this.state.AirCompressorCWPdataSource==[]||this.state.AirCompressorCWPdataSource[0]==undefined?
                    ""
                    :
                    <TabPane tab="空压冷却泵" key="12">
                      <Table 
                            dataSource={this.state.AirCompressorCWPdataSource} 
                            columns={AirCompressorCWPcolumns}
                            loading={this.state.loading}
                            pagination={false}
                            scroll={{
                                y: 550
                            }}
                        />
                    </TabPane>
                  }
                </Tabs>
                </div>
            </Modal>
        )
    }
}

export default DeviceInfo