import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import moment from 'moment';
//import NumberFormat from "react-number-format";

import { Card, Form, Input, Select, Row, Col, Button, 
         DatePicker, Table, AutoComplete, notification, 
         Modal, Descriptions, message, Spin, Alert, Space } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';


const{TextArea} = Input;
const { Column } = Table;
const { confirm } = Modal;
const { Option } = Select;

//Date.prototype.toJSON = function() {return moment(this).format();}

class Factura extends React.Component {

    //servidorAPI = process.env.REACT_APP_API_URL;
    servidorAPI = "//localhost:3100/";
    formRef = React.createRef();
    focButton = React.createRef();
    focAuto = React.createRef();
        

    constructor(props) {
        super(props);
        this.state = {
            txtRuc: "",
            factura: {clienteId: null,
                      fechaEmision: moment().toDate(), 
                      total: 0.00, 
                      subtotal: 0.00, 
                      porcentajeIva: 12, 
                      valorIva: 0.00,
                      detalle: []
                    },
            detalle: [{}]
        }

    }

    async componentDidMount(){
        const xres = await fetch(`${this.servidorAPI}emisor/1`)
                     .then(async response => {
                         const data = await response.json();
                        if (response.status == 201){
                            if (Object.keys(data).length > 0){
                                console.log("emisor", data);
                            }
                        }
                     });

        this.formRef.current.setFieldsValue({txtFechaFactura: moment(this.state.factura.fechaEmision).format("DD/MM/YYYY")});
    }

    onChange = idx => e => {
        const { name, value } = e.target;
        const detalle = [...this.state.detalle];
        let xtotal = 0;
        // if (name === "pvp"){
        //     xtotal = this.state.detalle[idx].cantidad * value;
        // }
        // detalle[idx] = {...detalle[idx], [name]:value, total: xtotal};
        detalle[idx] = {...detalle[idx], [name]:value};
        this.setState({
          detalle
        });
        console.log("tabla", this.state.detalle);

      };

    onClickAdd = () => {
        const item = {
            descripcion: "",
            cantidad: 0,
            pvp: 0,
            total: 0
        };
        this.setState({
            detalle: [...this.state.detalle, item]
        });
    };

    onKeyPress = (e) =>{
        if (e.key === "Enter"){
            console.log("tecla", e.target.value);
            this.buscarCliente(e.target.value);
        }
    }

    onSearchCliente = () => {
        console.log("buscar", (this.formRef.current.getFieldValue("txtRucCedula")));
        this.buscarCliente(this.formRef.current.getFieldValue('txtRucCedula'));
    }

    async buscarCliente(pruc) {
        const xres = await fetch(`${this.servidorAPI}cliente/${pruc}`)
                     .then(async response => {
                         const data = await response.json();
                        if (response.status == 201){
                            
                            if (Object.keys(data).length === 0){
                                console.log("Nada", data);
                            }else{
                                this.setState({factura: {...this.state.factura, clienteId: data.data.id}});
                                this.formRef.current.setFieldsValue({txtNombreCliente: data.data.nombres})
                                this.formRef.current.setFieldsValue({txtDireccion: data.data.direccion})
                                console.log("resultado", data.data.nombres);
                            }

                        }
                     });
    }

    onEnterPvp = idx => e =>{
        //console.log("idx", e);
        if (parseInt(e.target.value) > 0 ){
            let detalle = this.state.detalle;
            detalle[idx].total = detalle[idx].cantidad * detalle[idx].pvp;
            this.setState({detalle: detalle});
            let xsubtotal = 0.00;
            detalle.map(item => {
                xsubtotal += item.total;
            });
            let xvalorIva = (xsubtotal * this.state.factura.porcentajeIva) / 100;
            let xtotalfactura = xsubtotal + xvalorIva;
            this.setState({factura: {...this.state.factura, subtotal : xsubtotal, valorIva: xvalorIva, total: xtotalfactura}});
            this.onClickAdd();
        }
    }


    onGrabar = async () => {
        await this.setState({factura: {...this.state.factura, detalle: this.state.detalle}});
        //this.setState({factura: {...this.state.factura, nuevo: 0}});
        console.log("enivar", this.state.factura);
        console.log("detalle", this.state.detalle);

        const insert = await fetch(`${this.servidorAPI}factura/`, {method: "post", headers: {'Content-Type':'application/json'}, body: JSON.stringify(this.state.factura)})
        .then(async (response) => {
          //console.log("response", response);  
          let resultado = await response.json();
          resultado.data.detalle = [];
          if (response.status === 201){
              console.log("ok");
              this.setState({acta: await resultado.data, registroNuevo: false});
              //console.log("acta", this.state.acta);
              //this.setState({acta: {...this.state.acta, detalle: []}});
              //console.log("acta", this.state.acta);
              notification['success']({
                  message: '',
                  description: `Acta grabada con exito`
              });
              this.cargaActa();
          }else if (response.status === 501){
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
          
        });

    }

    render(){
        //let lista=this.state.acta.detalle
        let {loading, lstFiltro, lstOptions, selectedRowKeys } = this.state
        
        return(
        <Fragment>

            <Card title="Factura" loading={this.state.cardLoading}  >
                <Form 
                    layout="horizontal"
                    size="small"
                    // onFinish={(values)=>this.submitForm(values)}
                    // onFinishFailed={this.onFinishFailed}
                     ref={this.formRef}
                >
                    <Row >
                        <Col span={16}>
                            <Col span={24}>
                                    <Form.Item label="Fecha :" name="txtFechaFactura" labelCol={{span: 4}}
                                        rules={[{
                                            required: true,
                                            message:"Ingresar fecha"
                                        }]}
                                    >
                                        {/* <DatePicker  format="DD/MM/YYYY" allowClear={false}/> */}
                                        <Input disabled={true} style={{ width: '27%' }} ></Input>
                                    </Form.Item>
                                </Col>
                            <Col span={24}>
                                <Form.Item label="Cliente" labelCol={{span: 4}}>
                                    <Row gutter={6}>
                                    <Col span={22}>
                                        <Input.Group compact>
                                        <Form.Item
                                            name={'txtRucCedula'}
                                            noStyle
                                            rules={[{ required: true, message: 'Province is required' }]}
                                        >
                                            <Input.Search style={{ width: '30%' }}   placeholder="Ruc/Cedula" maxLength="13" onKeyDown={this.onKeyPress} onSearch={this.onSearchCliente} />
                                        </Form.Item>
                                        <Form.Item
                                            name={ 'txtNombreCliente'}
                                            noStyle
                                        >
                                            <Input style={{ width: '70%' }} placeholder="Nombre cliente" disabled={true} />
                                        </Form.Item>
                                    </Input.Group>
                                    </Col>
                                    <Col span={2}>
                                        <Button size="small"><FontAwesomeIcon icon={faUserPlus}></FontAwesomeIcon></Button>
                                    </Col>

                                    </Row>
                                </Form.Item>      
                      
                                <Form.Item label="Dirección" name={'txtDireccion'} labelCol={{span: 4}}>
                                    <Input disabled={true}></Input>
                                </Form.Item>
                            </Col>
                        </Col>
                        <Col span={8}>

                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Button type="primary" onClick={this.onGrabar}>Grabar</Button>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card title="Detalle" >
                <button onClick={this.onClickAdd}>Agregar</button>
                <div className="ant-table ant-table-small">
                    <div className="ant-table-container">
                        <div className="ant-table-content" style={{height:200, overflowY:"scroll"}}>
                            <table style={{tableLayout: "auto"}}>
                                <thead className="ant-table-thead">
                                    <tr>
                                        <th  className="ant-table-cell">Descripcion</th>
                                        <th width="95px" className="ant-table-cell" style={{textAlign: "right"}}>Cantidad</th>
                                        <th width="95px" className="ant-table-cell" style={{textAlign: "right"}}>PVP</th>
                                        <th width="95px" className="ant-table-cell" style={{textAlign: "right"}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.detalle.map((item, idx) => (
                                        <tr>
                                            <td>
                                                <Input type="text" name="descripcion" value={this.state.detalle[idx].descripcion} onChange={this.onChange(idx)}/>

                                            </td>
                                            <td width="45px">
                                                <Input type="number" style={{textAlign: "right"}} name="cantidad" value={this.state.detalle[idx].cantidad} onChange={this.onChange(idx)}/>

                                            </td>
                                            <td width="45px">
                                                <Input type="number" name="pvp" style={{textAlign: "right"}} value={this.state.detalle[idx].pvp} onChange={this.onChange(idx)} onPressEnter={this.onEnterPvp(idx)}/>

                                            </td>
                                            <td width="45px" style={{textAlign: "right"}}>
                                                {this.state.detalle[idx].total}
                                            </td>
                                        </tr>
                                    ))
                                    }
                                </tbody>
                                
                            </table>

                        </div>

                    </div>

                </div>

            </Card>
            
            <Card>
                <Row gutter={6}>
                    <Col span={16}>
                        <Form.Item layout="vertical" name="txtObservacion" >
                        <Input.TextArea placeholder="Observación" autoSize={{minRows: 6,  maxRows: 10}} style={{height:"500px"}}></Input.TextArea>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Descriptions size="small" >
                        <Descriptions.Item label="SubTotal" span={3} style={{textAlign: "right"}}>{this.state.factura.subtotal} </Descriptions.Item>
                        <Descriptions.Item label="Iva %" span={3}> {this.state.factura.porcentajeIva}</Descriptions.Item>
                        <Descriptions.Item label="Valor Iva" span={3}>{this.state.factura.valorIva}</Descriptions.Item>
                        <Descriptions.Item label="Total" span={3}>{this.state.factura.total}</Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
            </Card>
        </Fragment>
    
        )
}

}

export default Factura