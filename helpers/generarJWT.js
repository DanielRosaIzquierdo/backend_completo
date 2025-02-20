const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()


const generateJWT = (name) => {
    const payload = { name };

    return new Promise((resolve, reject) => {
              
        jwt.sign(payload, process.env.SECRET_JWT_SEED, {
            expiresIn: '24h',
        }, (error, token) => {
            if (error) {
                console.log(error)
                reject()
            }
            else {
                resolve(token)
            }
        }

        )
    })
}

module.exports = {
    generateJWT
}