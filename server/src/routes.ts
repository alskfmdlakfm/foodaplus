import { Vendor } from '@prisma/client';
import { NotFoundError } from '@prisma/client/runtime';
import express from 'express';
import {getVendor, pushVendor, writeReview, voteOnReview} from './controller';

const router = express.Router();

router.get('/vendor', async (req, res) => {
    const vendorName = req.query.name?.toString();
    if (!vendorName){
        res.sendStatus(500);
        return;
    }
    try {
        const vendor = await getVendor(vendorName);
        res.json(vendor);
    } catch (err: any) {
        if (err instanceof NotFoundError){
            res.status(404).send(`${vendorName} not found.`);
        } else {
            res.status(500).send(err.toString());
        }
    }
});

router.post('/vendor', async (req, res) => {
    const { name, review } = req.body;
    const vendor = {
        name,
        totalRating: 0,
        numReviews: 0
    }
    try {
        const result = await pushVendor(vendor);
        if(result){
            res.sendStatus(201);
        } else {
            res.status(403).send("Vendor already exists.");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

export default router;