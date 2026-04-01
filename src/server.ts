import passport from 'passport';
import express, { urlencoded } from 'express';
import session from 'express-session';
const app = express();
import dotenv from 'dotenv';
import type { Request, Response, NextFunction } from 'express';
import './google.auth.js';   //import only google strategy register file
dotenv.config();
app.get('/',(req,res)=>{
    res.send("Home page route is working fine");
})




app.use(express.json());
app.use(urlencoded({extended:true}))

app.use(session({
      secret:'mySecretKey324sa$#%235465usedotenv', //ye to temperarory hai, isko env file me store karna chahiye
      resave:false,
      saveUninitialized:true,
      
    
}))

app.use(passport.initialize());   //passport ko initialize karna zaruri hai, warna wo kaam nahi karega
app.use(passport.session());  //auto matic session management ke liye, passport.session() middleware ko use karna zaruri hai, warna session management kaam nahi karega


app.get('/login',(req,res)=>{
    if(req.isAuthenticated())
    {
       return res.redirect('/profile')
    }
    res.send("<h3>Login page route is working fine</h3> <br> <a href='/auth/google'>Login with Google</a>");
})

app.get('/auth/google',
    passport.authenticate('google',{scope:['profile','email']})
)

app.get('/auth/google/callback', passport.authenticate('google',{
    failureRedirect:'/login',
    successRedirect:'/profile',
     

})
)
    
app.get('/profile', (req,res)=>{
    if(req.isAuthenticated())
    {                                                               
       return res.send(`<h3>Profile page route is working fine</h3> <br> <p>Welcome ${(req.user as any)?.emails?.[0]?.value}</p> <br> <a href='/logout'>Logout</a>`);
    }
    
        res.redirect('/login'); 
    
})

app.get('/logout',(req,res,next)=>{
    req.logout((err)=>{
        if(err) return next(err);
        res.redirect('/login');
    });
});







app.use((err:Error,req:Request,res:Response,next:NextFunction)=>{
     res.status(500).send({
        status:false,
        message:"Something went wrong please try again later",
        data:err.message,
    })
    next();
})

app.use((req,res)=>{
    res.status(404).send("page not found try another routes");
})

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
}).on('error',(err)=>{
    console.log("Error in starting server: ", err);
})