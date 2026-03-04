import {IErrorResponse} from "./type/ErrorType.js";

export class ErrorResponse extends Error implements IErrorResponse {
    constructor(
        public code: "EMAIL_ALREADY_EXISTS" | "NOT_FOUND" | "JWT_ERROR" | "WORKER_ERROR",
        public typeError: "BusinessLogic",
        message: string
    ) {
        super(message);
    }
}