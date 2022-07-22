import { NotFoundError } from '@prisma/client/runtime';
import express from 'express';
import {getVendor, pushVendor, writeReview, voteOnReview, getReviews} from './controller';

const router = express.Router();

//usage: /vendor?name=<insert name here>
router.get('/vendor', async (req, res) => {
    const vendorName = req.query.name?.toString();
    console.log(vendorName);
    if (!vendorName){
        res.sendStatus(500);
        return;
    }
    try {
        const vendor = await getVendor(vendorName);
        const vendorJson = {
            name: vendor.name,
            rating: vendor.rating,
            numReviews: vendor.numReviews,
            badges: vendor.badges,
            reviews: await getReviews(vendor)
        }
        res.json(vendorJson);
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

router.post('/review', async (req, res) => {
    const { name, rating, badge, comment  } = req.body;
    const newReview = {
        rating: parseFloat(rating),
        badge,
        comment
    };
    try {
        const vendor = await writeReview(newReview, name);
        res.status(201).json(vendor);
    } catch(err: any){
        res.status(500).send(err.toString());
    }
});

router.put('/vote', async (req, res) => {
    const { reviewId, vote } = req.body; 
    if (vote != 1 && vote != -1){
        res.sendStatus(400);
        return;
    }
    try {
        const review = await voteOnReview(reviewId, parseInt(vote));
        res.status(200).json(review);
    } catch (err: any) {
        res.status(500).send(err.toString()); 
    }
})

export default router;