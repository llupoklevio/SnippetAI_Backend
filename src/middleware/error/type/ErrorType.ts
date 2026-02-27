export interface IErrorResponse extends Error {
    code : "EMAIL_ALREADY_EXISTS" | "NOT_FOUND" | "JWT_ERROR";
    typeError : "BusinessLogic";
}