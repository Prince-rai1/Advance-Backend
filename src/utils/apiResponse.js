class apiResponse {
    constructor(statuscode, message, data) {
        this.message = message;
        this.statuscode = statuscode;
        this.success = statuscode < 400;
        this.data = data;
    }
}

export default apiResponse;