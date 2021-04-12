import React, { Fragment, useState, createRef } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import NumberFormat from "react-number-format";

import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Button,
  DatePicker,
  Table,
  AutoComplete,
  notification,
  Modal,
  Descriptions,
  message,
  Spin,
  Alert,
  Space,
} from "antd";
import TextArea from "antd/lib/input/TextArea";
import { FormInstance } from 'antd/lib/form';

class Cliente extends React.Component {

  servidorAPI = "//localhost:3100/";
  frmCliente = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      modVisible: this.props.visible,
      disButAceptar: true,
      loaGrabar: false,
    };
  }

  componentDidMount() {
    this.setState({ modVisible: this.props.miVisible });
    console.log("aca cliente", this.state.modVisible);
  }

  onCancel = () => {
    this.setState({ modVisible: false });
  };


  onFinish = () =>{
        this.setState({loaGrabar: true});
        let cliente = {
          tipoIdentificacionId: this.frmCliente.current.getFieldValue("sltTipoIdentificacion"),
          rucCedula: this.frmCliente.current.getFieldValue("txtIdentificacion"),
          nombres : this.frmCliente.current.getFieldValue("txtNombre"),
          apellidos: this.frmCliente.current.getFieldValue("txtApellidos"),
          direccion: this.frmCliente.current.getFieldValue("txtDireccion"),
          telefono: this.frmCliente.current.getFieldValue("txtTelefono"),
          email: this.frmCliente.current.getFieldValue("txtEmail"),
        }
        console.log("a grabar", cliente);
        this.insertaCliente(cliente);
  }

  onFinishFailed = () =>{
    console.log("failed");
  }

  async insertaCliente(cliente){
    const insert = await fetch(`${this.servidorAPI}cliente`, {method: "post", headers: {'Content-type':'application/json'}, body: JSON.stringify(cliente)})
                    .then(async (response) => {
                      let resultado = await response.json();
                      if (response.status === 201){
                        //console.log("grabado", resultado);
                        this.setState({loaGrabar: false});
                        this.props.onModalChange(false, resultado.data)
                      }
                      else if (response.status === 501){
                        notification['error']({
                            message: 'Error',
                            description: `Error al crear el acta [${resultado.error.message}]`
                        });
                    }else{
                        notification['error']({
                            message: 'Error',
                            description: `Error desconocido`
                        });
                    }
                    })
  }

  render() {
    return (
      <Spin spinning={this.state.loaGrabar}>
      
        <Modal
          title="Crear cliente"
          //isible= {true}
          visible={this.props.miVisible}
          onOk={() => this.aceptar()}
          onCancel={() => this.props.onModalChange(false, null)}
          width={1200}
          style={{top:20}}
          footer={null}
          //okButtonProps={{disabled:this.state.disButAceptar}}
        >
          <Form
            layout="horizontal"
            size="small"
            onFinish={(values)=>this.onFinish(values)}
            //onFinishFailed={this.onFinishFailed}
            ref={this.frmCliente}
          >
            <Row>
              <Col span={24}>
              <Form.Item name="grpIdentificacion" label="Identificación" labelCol={{span:3}}>               
                <Input.Group compact>
                  <Form.Item name="sltTipoIdentificacion" noStyle
                    rules={[
                      {required: true,
                        message:"Seleccione tipo de identificacion"}
                      ]}
                  >
                  <Select style={{width: "50%"}}>
                    <Select.Option value="04">Ruc</Select.Option>
                    <Select.Option value="05">Cedula</Select.Option>
                    <Select.Option value="06">Pasaporte</Select.Option>
                    <Select.Option value="08">Identificacion del exterior</Select.Option>
                  </Select>
                  </Form.Item>
                  <Form.Item name="txtIdentificacion" noStyle
                    rules={[
                      {required: true,
                        message:"Ingrese el número de identificación"}
                      ]}
                  >
                    <Input style={{width: "50%"}} placeholder="RUC/Cedula/Pasaporte"></Input>
                  </Form.Item>

                </Input.Group>
                </Form.Item>

                <Form.Item name="txtNombres" label="Nombres" labelCol={{span:3}}>
                  <Input.Group compact>
                    <Form.Item name="txtApellidos" noStyle
                      rules={[
                        {required: true,
                          message:"Ingrese los apellidos"}
                        ]}
                    >
                      <Input style={{width: "50%"}} placeholder="Apellidos"></Input>
                    </Form.Item>
                    <Form.Item name="txtNombre" noStyle
                      rules={[
                        {required: true,
                          message:"Ingrese los nombres"}
                        ]}                  
                    >
                      <Input style={{width: "50%"}} placeholder="Nombres"></Input>
                    </Form.Item>

                  </Input.Group>
                </Form.Item>
                <Form.Item name="txtDireccion" label="Direccion" labelCol={{span:3}}
                      rules={[
                        {required: true,
                          message:"Ingrese la dirección"}
                        ]}
                >
                  <TextArea></TextArea>
                </Form.Item>
                <Form.Item name="txtTelefono" label="Telefono" labelCol={{span:3}}
                  rules={[
                    {required: true,
                      message:"Ingrese un número de telefono"}
                    ]}
                >
                  <Input></Input>
                </Form.Item>
                <Form.Item name="txtEmail" label="Correo" labelCol={{span:3}}
                  rules={[
                    {required: true,
                      message:"Ingrese un correo"}
                    ]}
                >
                  <Input></Input>
                </Form.Item>
                <Form.Item style={{paddingLeft: "10px", paddingTop: "10px"}}>
                  <Space>
                  <Button type="primary" htmlType="submit">
                    Grabar
                  </Button>
                  <Button onClick={() => this.props.onModalChange(false)}>
                    Cancelar
                  </Button>

                  </Space>

                </Form.Item>

              </Col>
            </Row>
          </Form>
        </Modal>
        
      </Spin>
    );
  }
}

export default Cliente;
