//import * as z from "zod";
import {IregisterValidator} from "../../../../src/auth/type/validatorTypeRegister";


export const errorValidator : IregisterValidator = {
    email: "",
    password:"" ,
    lastName: "",
    firstName: ""
}

export const errorValidatorWrongType = {
    email: 20,
    password:20 ,
    lastName: 20,
    firstName: 20
}
