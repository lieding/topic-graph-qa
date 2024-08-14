import { useState } from 'react';
import EditModal, { EditModalTypeEnum } from './editModal';
import { Row, Col, Button } from 'antd';

export default () => {
  const [ editModalVisible, toggleEditModal ] = useState(false);

  const [ editModalType, setEditModalType ] = useState(EditModalTypeEnum.CREATE);


  const newKnomadge = () => {
    setEditModalType(EditModalTypeEnum.CREATE);
    toggleEditModal(true);
  }

  return (
    <>
      <div>
        <Row justify="end">
          <Col span={4}>
            <Button type="primary" size='small' onClick={newKnomadge}>Add</Button>
          </Col>
        </Row>
      </div>
      <EditModal isOpen={editModalVisible} close={() => toggleEditModal(false)} type={editModalType} />
    </>
  )
}