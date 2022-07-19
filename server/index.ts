import 'dotenv/config';
import express from 'express';

const app = express();
const PORT: string = (process.env.PORT || "8080");


// Routing
app.get('/', (req, res) => {
    res.json('OK');
});

app.get('/today', (req, res) => {
    
});


app.listen(PORT, () => {
    // tslint:disable-next-line:no-console
    console.log(`Listening on http://localhost:${PORT}`);
})