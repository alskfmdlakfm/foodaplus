import 'dotenv/config';
import express from 'express';
import router from './src/routes';
import morgan from 'morgan';

const app = express();
const PORT: string = (process.env.PORT || "8080");


// Routing
// app.get('/', (req, res) => {
//     res.json('OK');
// });

app.use(morgan('dev'));
app.use('/', router);


app.listen(PORT, () => {
    // tslint:disable-next-line:no-console
    console.log(`Listening on http://localhost:${PORT}`);
})