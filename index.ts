import 'dotenv/config';
import express, { urlencoded } from 'express';
import router from './src/routes';
import morgan from 'morgan';
import cors from 'cors';

const app = express();
const PORT: string = (process.env.PORT || "8080");

app.use(urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cors({ origin: '*' }));
app.use('/', router);


app.listen(PORT, () => {
    // tslint:disable-next-line:no-console
    console.log(`Listening on http://localhost:${PORT}`);
})