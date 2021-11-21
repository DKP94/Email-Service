class Output {
    constructor(message) {
        this.message = message;
        this.body = `
        <p>You have a new message</p>      
        <h3>Message</h3>
        <p>${message}</p>
    `;
    }
}

module.exports = Output;