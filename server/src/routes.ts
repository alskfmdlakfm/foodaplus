import express from 'express';
import {getVendor, pushVendor, writeReview, voteOnReview} from './controller';

const router = express.Router();

router.get('/vendor', async (req, res) => {
    const vendorName = req.query.name?.toString();
    if (!vendorName){
        res.sendStatus(500);
        return;
    }
    const vendor = await getVendor(vendorName);
    res.json(vendor);
});

router.post('/vendor', async (req, res) => {
    const { name, review, }
});

export default router;