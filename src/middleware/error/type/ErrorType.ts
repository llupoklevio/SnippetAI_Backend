export interface IErrorResponse extends Error {
    code : string;
    typeError : string;
}