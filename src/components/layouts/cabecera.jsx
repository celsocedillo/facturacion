import React from 'react';
import { Layout } from 'antd';
import { HomeTwoTone, UserOutlined } from '@ant-design/icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faCoffee } from '@fortawesome/free-solid-svg-icons'


const {Header} = Layout;

const Cabecera  = () => 
     (
    <Header >
        <div className="logo">
            <HomeTwoTone/> EMAPAG
        </div>
        <div style={{float: 'right'}}>
            <UserOutlined/>
        </div>
    </Header>
  
  
)

export default Cabecera;