
import express from 'express';

const app = express();


app.get('/',(req,res)=>{
    res.send("Home page route is working fine");
})



app.listen(3000,()=>{
    console.log('Server is running on port 3000');
}).on('error',(err)=>{
    console.log("Error in starting server: ", err);
})