const express = require('express');
const exphbs = require('express-handlebars');
const dotenv = require('dotenv');
const routes = require('./routes/imageRoutes');

const connectDB = require('./config/db');

dotenv.config({ path: './config/config.env' });

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.engine('.hbs', exphbs({defaultLayout: 'main' , extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use('/', routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
