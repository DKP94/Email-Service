class MailConfig {
    constructor(from, to, subject , content) {        
        this.from = `Email Service App Contact <${from}>`,     
        this.to = to, 
        this.subject = subject, 
        this.html = content    
    }
}

module.exports = MailConfig;