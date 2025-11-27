const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv')
const app = express();

//DOTENV
dotenv.config();

//Middlewares
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth',require('../Server/routes/authRoute'));
app.use('/api/users',require('../Server/routes/userRoute'));
app.use('/api/posts',require('../Server/routes/postsRoute'))


//Routes
app.get("",(req,res) => {
  res.status(200).json({
    success:true,
    message:"Welcome to fullstack APP"
  })
})

app.listen(8080, '0.0.0.0', () => {
  console.log(`Server Running on port: 8080`);
  console.log(`Server accessible at: http://10.153.240.83:8080`);
})