export interface IErrorResponse extends Error {
    code : "EMAIL_ALREADY_EXISTS" | "NOT_FOUND" | "JWT_ERROR" | "WORKER_ERROR";
    typeError : "BusinessLogic";
}