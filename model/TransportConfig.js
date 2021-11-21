class TransportConfig {
    constructor(host,port,secure,user,pass,tls){
        this.host = host,
        this.port = port,
        this.secure = secure, 
        this.auth = {
            user: user,
            pass: pass
        },
        this.tls = {
            rejectUnauthorized : tls
        }
    }
}

module.exports = TransportConfig;