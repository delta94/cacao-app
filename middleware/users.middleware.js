const jwt = require('jsonwebtoken');

const secretOrKey = process.env.privateKey;

const User = require('../model/users.model');

module.exports.checkToken = (req, res, next) => {  
    const error = {};
    /* 
    \\  slice the Bearer token generate by JWT
    \\  token format: 
    \\  Bearer idfhoehfuihewfuwiehfuiewhfuiwehuiewhuiweh
    \\  'Bearer'.length + ' '.length === 7 
    */
    
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if(!token) {        
        error.invalidToken = 'Invalid auth token';
        return res.status(401).json({
            success: false,            
            error
        })
    }

    if(token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }        
        
    if(token) {
        jwt.verify(token, secretOrKey, (err, payload) => {
            if(err) {                   
                error.unauthor = 'Unauthorization';
                return res.status(401).json({ 
                    success: false,
                    error
                });
            }
            
            User.findById(payload.userId)            
                .then(user => {                    
                    // sign payload information into req.user
                    req.user = user;                        
                    next();
                })                            
        })
    }            
}

module.exports.protectedRoute = (req, res, next) => {
    const id = req.params.id;
    const error = {};    

    if(req.user._id.toString() !== id) {                
        error.unauthor = 'Unauthorization';
        return res.status(403).json({ 
            success: false,
            error
        });
    }    
    next();
}