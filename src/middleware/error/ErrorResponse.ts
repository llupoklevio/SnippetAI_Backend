import {IErrorResponse} from "./type/ErrorType.js";

export class ErrorResponse extends Error implements IErrorResponse {
    constructor(
        public code: string,
        public typeError: string,
        message: string
    ) {
        super(message);
    }
}