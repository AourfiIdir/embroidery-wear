import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();
const jwt_key = process.env.JWT_KEY;
//creat a middleware to check the user auths
const Userauth = (req,res,next)=>{
    const bearerToken = req.headers['authorization'];
    const Token = bearerToken && bearerToken.split(' ')[1];
    if(Token == null)res.status(401).json({error:"cant get the token"});
    jwt.verify(Token,jwt_key,(err,user)=>{
      if(err){
        res.status(401).json({error:"the user is not  verified, please sign in to continue"});
      }
      req.user = {
        id:user.id,
        role:user.role
      }
      req.id = user.id;
      req.role = user.role;
      next();//continue the process
    }) 
  }

  function Roleauth(requiredRoles) {
    return (req, res, next) => {
      const userRole = req.role; 
      
      const rolesToCheck = Array.isArray(requiredRoles) 
        ? requiredRoles 
        : [requiredRoles];
      
      // Check if user's role is included in required roles
      if (!rolesToCheck.includes(userRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    };
  }

export {Roleauth,Userauth};