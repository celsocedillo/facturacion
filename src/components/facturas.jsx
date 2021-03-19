import React  from "react";
import { Link } from "react-router-dom";
import { ReactComponent as BankDeposit } from './svg/bankDeposit.svg'

class Facturas extends React.Component {

    render(){
        return(
            <div>
                Hola Facturacion
                <BankDeposit height="25px" width="25px"/>
            </div>
        );
    }
}

export default Facturas