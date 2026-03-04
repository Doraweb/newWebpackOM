import React from 'react'
import { Modal, Table, Button, Input } from "antd";
import { modalTypes } from '../../../common/enum'
import s from './PointModalView.css'
import appConfig from '../../../common/appConfig'

const language = appConfig.language;
const Search = Input.Search

let pointToggleClass, modalToggleClass, inputToggleClass;
if (localStorage.getItem('serverOmd') == "persagy") {
    pointToggleClass = 'persagy-table-tbody persagy-table-thead persagy-table-placeholder persagy-pagination-item';
    modalToggleClass = 'persagy-modal-style persagy-point-modal';
    inputToggleClass = 'persagy-point-input';
}

const columns = [
    {
        title: language == 'en' ? 'Point Name' : '点名',
        dataIndex: 'name',
        width: 200,
    }, {
        title: language == 'en' ? 'Point Description' : '点名释义',
        dataIndex: 'description',
        width: 200
    }, {
        title: language == 'en' ? 'Source' : '来源',
        dataIndex: 'sourceType',
        width: 100
    }, {
        title: language == 'en' ? 'Address' : '地址',
        dataIndex: 'addr',
        width: 100
    }
]

class PointView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedPoint: null
        }

        this.onOk = this.onOk.bind(this)
    }

    componentDidMount() {
        const { initialize } = this.props
        initialize()
    }

    onOk() {
        const { hidePointModal, onSelectChange } = this.props
        hidePointModal()
    }
    render() {
        const {
            pagination,
            pointData,
            onPaginationChange,
            modal,
            hidePointModal,
            searchPointData,
            loading,
            onSelectChange,
            selectedIds
        } = this.props
        return (
            <Modal
                className={modalToggleClass}
                title={language == 'en' ? "Point Selection" : "点位选择"}
                visible={modal.type === modalTypes.POINT_MODAL}
                onCancel={hidePointModal}
                maskClosable={false}
                zIndex={2000}
                width={1600}
                footer={[
                    <Button key="ok" type="primary" size="large" onClick={this.onOk} disabled={!(selectedIds && selectedIds.length)}>
                        {language == 'en' ? "OK" : "确定"}
                    </Button>,
                    <Button key="cancel" size="large" onClick={hidePointModal}>
                        {language == 'en' ? "Cancel" : "取消"}
                    </Button>,
                ]}
            >
                <div className={inputToggleClass} style={{ marginBottom: '10px' }}>
                    <Search
                        placeholder={language == 'en' ? 'Please search for specific point name' : '请搜索具体的点名'}
                        onSearch={value => searchPointData(value)}
                    />
                </div>
                <Table
                    className={pointToggleClass}
                    columns={columns}
                    dataSource={pointData}
                    rowKey="name"
                    pagination={{
                        ...pagination,
                        style: { marginBottom: 0 }
                    }}
                    onChange={onPaginationChange}
                    rowSelection={{
                        type: 'radio',
                        selectedRowKeys: selectedIds,
                        onChange: onSelectChange
                    }}
                    scroll={{ y: 400 }}
                    loading={loading}
                />
            </Modal>
        )
    }
}

export default PointView