import React, { Fragment, useState, createRef } from "react";
import { Link } from "react-router-dom";
import moment from 'moment';
import NumberFormat from "react-number-format";

import { Card, Form, Input,  InputNumber,  Select, Row, Col, Button,
         DatePicker, Table, AutoComplete, notification, 
         Modal, Descriptions, message, Spin, Alert, Space } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { PlusCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserPlus, faTrash, faEdit, faPlusCircle, faSave } from '@fortawesome/free-solid-svg-icons';


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
    
    focCantidad = React.createRef();


    formAgregar = React.createRef();
        

    constructor(props) {
        super(props);
        this.focDetalle = React.createRef();
        this.state = {
            modAgregar: false,
            txtRuc: "",
            detCantidad : 0,
            detTotal: 0,
            disButOkAgregar: true,
            disCerrarFactura: true,
            listaTarifasIva: [],
            lstTarifasIva: [],
            factura: {clienteId: null,
                      fecha: moment().toDate(), 
                      valorTotal: 0.00, 
                      valorSubtotal: 0.00, 
                      valorIva: 0.00,
                      valorDescuento: 0.00,
                      detalle: []
                    },
            detalle: []
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

        //Buscar las tarifas de IVA
        this.buscarTarifasIva();

    
    }

    // onChange = idx => e => {
    //     const { name, value } = e.target;
    //     console.log("input", [name]);
    //     const detalle = [...this.state.detalle];
    //     let xtotal = 0;
    //     // if (name === "pvp"){
    //     //     xtotal = this.state.detalle[idx].cantidad * value;
    //     // }
    //     // detalle[idx] = {...detalle[idx], [name]:value, total: xtotal};
    //     detalle[idx] = {...detalle[idx], [name]:value};
    //     this.setState({
    //       detalle
    //     });

    //   };

      onChange = (e) => {
        if (e.target.id === "txtCantidad" || e.target.id === "txtPrecio" || e.target.id === "txtDescuento"){
            const deta = {cant: (this.formAgregar.current.getFieldValue("txtCantidad") === undefined ? 0 : this.formAgregar.current.getFieldValue("txtCantidad")),
                          prec: (this.formAgregar.current.getFieldValue("txtPrecio") === undefined ? 0 : this.formAgregar.current.getFieldValue("txtPrecio")),
                          desc: (this.formAgregar.current.getFieldValue("txtDescuento") === undefined ? 0 : this.formAgregar.current.getFieldValue("txtDescuento")),
                         }
            let total = (deta.cant * deta.prec) - deta.desc;
            this.formAgregar.current.setFieldsValue({txtTotalDetalle: total});
        }

        const texto = (this.formAgregar.current.getFieldValue("txtDetalle") === undefined ? "" : this.formAgregar.current.getFieldValue("txtDetalle"));
        const total = (this.formAgregar.current.getFieldValue("txtTotalDetalle") === undefined ? 0 : this.formAgregar.current.getFieldValue("txtTotalDetalle"));
        if (texto.length > 10 && total > 0 ){
            this.setState({disButOkAgregar: false});
        }
      }

    onClickAdd = (e) => {
        if (this.formAgregar.current !== null){
            this.formAgregar.current.setFieldsValue({txtTotalDetalle: 0, txtCantidad: 0, txtPrecio: 0, txtDescuento: 0, txtDetalle: "", lstTarifaIva: "2"});
        }
        //
        this.setState({modAgregar: true, disButOkAgregar: true});
        setTimeout(() => {
            this.focDetalle.current.focus();
        }, 200)
        
        
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

    async buscarTarifasIva(){
        const xres = await fetch(`${this.servidorAPI}tarifasIva`)
                     .then(async response => {
                         const data = await response.json();
                        if (response.status == 201){
                            this.state.listaTarifasIva = data.data;
                            console.log("tarifas", data)
                            data.data.map(item => {
                                this.setState({lstTarifasIva: [...this.state.lstTarifasIva, {id: item.codigo, label: item.tarifa}]});
                            })

                            console.log("lst", this.state.lstTarifasIva);
                        }
                     });

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
                                this.habilitaCerrarFactura();
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
            this.setState({factura: {...this.state.factura, subtotal : xsubtotal, valorIva: xvalorIva, valorTotal: xtotalfactura}});
            this.onClickAdd();
        }
    }


    onGrabar = async () => {
        await this.setState({factura: {...this.state.factura, detalle: this.state.detalle}});
        const insert = await fetch(`${this.servidorAPI}factura/`, {method: "post", headers: {'Content-Type':'application/json'}, body: JSON.stringify(this.state.factura)})
        .then(async (response) => {
          let resultado = await response.json();
          //resultado.data.detalle = [];
          if (response.status === 201){
              this.setState({acta: await resultado.data, registroNuevo: false});
              notification['success']({
                  message: '',
                  description: `Factura ${resultado.data.id} grabada con exito`
              });
              //this.cargaActa();
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

    async onAceptarDetalle () {

        let detalle = {
            descripcionManual : this.formAgregar.current.getFieldValue("txtDetalle"),
            cantidad : parseInt(this.formAgregar.current.getFieldValue("txtCantidad")),
            valorUnitario : parseFloat(this.formAgregar.current.getFieldValue("txtPrecio")),
            codigoImpuesto: null,
            porcentajeImpuesto:  null,
            subtotal: 0,
            valorDescuento : parseFloat((this.formAgregar.current.getFieldValue("txtDescuento") === undefined ? 0 : this.formAgregar.current.getFieldValue("txtDescuento"))),
            total : null
        }

        const codigoImpuesto = parseInt((this.formAgregar.current.getFieldValue("lstTarifaIva") === undefined ? 2 : this.formAgregar.current.getFieldValue("lstTarifaIva")));
        const regTarifaIva = this.state.listaTarifasIva.filter(item => item.codigo == codigoImpuesto);
        detalle.codigoImpuesto = codigoImpuesto;
        detalle.porcentajeImpuesto = null;
        detalle.subtotal = (detalle.cantidad * detalle.valorUnitario) - detalle.valorDescuento;
        detalle.valorImpuesto = 0.00
        if (regTarifaIva[0].tieneValor === "S"){
            detalle.porcentajeImpuesto = parseFloat(parseFloat(regTarifaIva[0].tarifa).toFixed(2));
            //detalle.valorImpuesto = (((detalle.cantidad * detalle.valorUnitario) - detalle.valorDescuento) * (detalle.porcentajeImpuesto/100))
            detalle.valorImpuesto = detalle.subtotal * (detalle.porcentajeImpuesto/100)
        }
        //detalle.total = ((detalle.cantidad * detalle.valorUnitario) - detalle.valorDescuento) + detalle.valorImpuesto
        detalle.total = detalle.subtotal + detalle.valorImpuesto;
        let tabDetalle = [...this.state.detalle, detalle];
        await this.setState({detalle: tabDetalle, modAgregar: false});
        await this.calcularTotales();
        console.log("detalle", this.state.detalle);
        this.habilitaCerrarFactura();
    }

    async calcularTotales(){
        let subtotal = 0;
        let valorImpuesto = 0;
        let total = 0;
        let valorDescuento= 0;
        this.state.detalle.map( item => {
            valorDescuento += parseFloat(item.valorDescuento);
            subtotal += item.subtotal
            valorImpuesto += item.valorImpuesto;
        })
        //valorIva = parseFloat((subtotal * (porcentajeIva / 100)).toFixed(2));
        total = parseFloat((subtotal  + valorImpuesto).toFixed(2));
        this.setState({factura: {...this.state.factura, valorSubtotal: subtotal, valorIva: valorImpuesto, valorTotal: total, valorDescuento: valorDescuento}})
    }

    habilitaCerrarFactura(){
        console.log("evalua cerrar", this.state.factura, this.state.detalle.length);
        if (this.state.factura.clienteId !== null && this.state.detalle.length > 0 && this.state.factura.valorTotal > 0 ) {
            this.setState({disCerrarFactura: false});
            console.log("habilitar", this.state.disCerrarFactura)
        }
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
                            <Button type="primary" disabled={this.state.disCerrarFactura} onClick={this.onGrabar} icon={<FontAwesomeIcon icon={faSave}></FontAwesomeIcon>}>  Grabar</Button>
                        </Col>
                    </Row>
                </Form>
            </Card>

{/* Detalle de la factura */}

            <Card title="Detalle" >
                <Space>
                    <Button type="text" size="small" icon={<FontAwesomeIcon icon={faPlusCircle}></FontAwesomeIcon>} onClick={this.onClickAdd}>  Agregar</Button>
                </Space>
                <Table
                    size="small"
                    dataSource={this.state.detalle}
                    pagination={false}
                    scroll={{y: window.innerHeight - 460 }}
                    key="detalle"

                >
                    <Column title="Detalle" dataIndex="descripcionManual" key="detalle" >
                    </Column>

                    <Column title="Cantidad" dataIndex="cantidad" width={100} align="right">
                    </Column>

                    <Column title="Precio" width={100} align="right"
                        render={rowData => <NumberFormat value={rowData.valorUnitario} displayType={'text'} thousandSeparator={true} decimalScale={2} fixedDecimalScale={true}></NumberFormat>}
                    >
                    </Column>

                    <Column title="Descuento" width={100} align="right"
                        render={rowData => <NumberFormat value={rowData.valorDescuento} displayType={'text'} thousandSeparator={true} decimalScale={2} fixedDecimalScale={true}></NumberFormat>}                        
                    >
                    </Column>

                    <Column title="Subtotal" width={100} align="right"
                        render={rowData => <NumberFormat value={rowData.subtotal} displayType={'text'} thousandSeparator={true} decimalScale={2} fixedDecimalScale={true}></NumberFormat>}
                    >
                    </Column>

                    <Column title="" width={20} align="center" render={() =>  <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon>}>
                    </Column>


                    <Column title="" width={20} align="center" render={() =>  <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>}>
                    </Column>



                </Table>
            </Card>

{/* Totales de la factura             */}

            <Card>
                <Row gutter={6}>
                    <Col span={14}>
                        <Form.Item layout="vertical" name="txtObservacion" >
                        <Input.TextArea placeholder="Observación" autoSize={{minRows: 6,  maxRows: 10}} style={{height:"500px"}}></Input.TextArea>
                        </Form.Item>
                    </Col>
                    <Col span={10}>
                        <Descriptions size="small" bordered contentStyle={{fontSize:"18px", paddingBottom: "2px", fontWeight: "bold"}} >
                            <Descriptions.Item label="SubTotal" span={3} labelStyle={{width:"150px"}} contentStyle={{display:"block",  textAlign: "right", paddingRight: "5px"}}>
                                <NumberFormat value={this.state.factura.valorSubtotal} displayType={'text'} thousandSeparator={true} decimalScale={2} fixedDecimalScale={true}></NumberFormat>
                            </Descriptions.Item>
                            <Descriptions.Item label="Descuento" span={3} labelStyle={{width:"150px"}} contentStyle={{display:"block",  textAlign: "right", paddingRight: "5px"}}>
                                <NumberFormat value={this.state.factura.valorDescuento} displayType={'text'} thousandSeparator={true} decimalScale={2} fixedDecimalScale={true}></NumberFormat>
                            </Descriptions.Item>
                            <Descriptions.Item label="Valor Iva" span={3} contentStyle={{display:"block",  textAlign: "right", paddingRight: "5px"}}>                                
                                <NumberFormat value={this.state.factura.valorIva} displayType={'text'} thousandSeparator={true} decimalScale={2} fixedDecimalScale={true}></NumberFormat>
                            </Descriptions.Item>
                            <Descriptions.Item label="Total" span={3} contentStyle={{display:"block",  textAlign: "right", paddingRight: "5px"}}>
                                <NumberFormat value={this.state.factura.valorTotal} displayType={'text'} thousandSeparator={true} decimalScale={2} fixedDecimalScale={true}></NumberFormat>
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
            </Card>
        
{/* Modal para agregar detalle a la factura */}

           <Modal
                title="Agregar detalle a factura"
                style={{top:20}}
                visible={this.state.modAgregar}
                onOk={(values) => this.onAceptarDetalle(values)}
                onCancel={() => this.setState({modAgregar: !this.state.modAgregar})}
                okButtonProps={{disabled: this.state.disButOkAgregar}}
           >
               <Form 
                    onFinish={(values) => this.onAceptarDetalle(values)}
                    ref={this.formAgregar}
               >
                   <Form.Item name="txtDetalle" label="Detalle" rules={[{ required: true }]} labelCol={{span: 4}} >
                      <TextArea rows={2} ref={this.focDetalle} onChange={this.onChange} />
                   </Form.Item>
                   <Form.Item name="txtCantidad" label="Cantidad" rules={[{ required: true }]} labelCol={{span: 16}}>
                       <Input type="number" style={{width: 150,textAlign: 'right'}} onChange={this.onChange} placeholder="0"></Input>
                      
                   </Form.Item>
                   <Form.Item name="txtPrecio" label="Precio Unitario" rules={[{ required: true }]} labelCol={{span: 16}}>
                      <Input type="number" style={{width: 150, textAlign: 'right'}} defaultValue="0" onChange={this.onChange} />
                   </Form.Item>
                   <Form.Item name="txtDescuento" label="Descuento" rules={[{ required: true }]} labelCol={{span: 16}}>
                      <Input type="number" style={{width: 150, textAlign: 'right'}} defaultValue={0} onChange={this.onChange} />
                   </Form.Item>
                   <Form.Item name="lstTarifaIva" label="Tarifa IVA" rules={[{ required: true }]} labelCol={{span: 16}}>
                      <Select defaultValue={"2"}  >
                          {
                              this.state.lstTarifasIva.map(item => (
                                <Select.Option value={item.id} key={item.codigo}>
                                    {item.label}
                                </Select.Option>
                              ))
                          }
                      </Select>
                   </Form.Item>
                   <Form.Item name="txtTotalDetalle" label="Total" labelCol={{span: 16}}>
                      <Input type="number" style={{width: 150, textAlign: 'right'}} defaultValue={this.state.detTotal} value={this.state.detTotal} disabled/>
                   </Form.Item>

                   
                    </Form>
           </Modal>
           
        
        </Fragment>
    
        )
}

}

export default Factura