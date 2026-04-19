class apiResponse {
    constructor(statuscode, message, data) {
        this.data = data;
        this.message = message;
        this.statuscode = statuscode;
        this.success = statuscode < 400;
    }
}

export default apiResponse;