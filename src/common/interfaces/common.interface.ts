
export interface ServerResponseWrapper {
    success: boolean;
    code: number;
    errorMsg?: string;
    data?: any;
}