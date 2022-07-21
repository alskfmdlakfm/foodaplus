import { Badge, Prisma, PrismaClient, Review, Vendor } from '@prisma/client'
<<<<<<< HEAD
import { NotFoundError } from '@prisma/client/runtime';
=======
>>>>>>> origin/main

const prisma = new PrismaClient();

export async function getVendor(name: string) {
    var result;
    try {
        result = await prisma.vendor.findFirstOrThrow({
            where: { name }
        });
        return result;
    } catch (error: any) {
        result = await pushVendor({ name, badges: []});
        return result;
    }
}

export async function getReviews(vendor: Vendor) {
    const reviews =  await Promise.all(vendor.reviews.map(async (id) => {
        return await prisma.review.findUnique({
            where: { id }})
    }));
    reviews.sort((a, b) => a && b ? (a.createdAt < b.createdAt) ? -1 : 1 : 0);
    return reviews;
}

export async function pushVendor(newVendor: any){
    if (await prisma.vendor.findFirst({ where: { name: newVendor.name }})) throw new Error("Vendor already exists.");
    const vendor = await prisma.vendor.create({
        data: newVendor
    });
    return vendor;
}

export async function writeReview(newReview: any, vendorName: string) {
    if (!('rating' in newReview) || !('badge' in newReview)) throw new Error("Missing rating or badge.")
    const review = await prisma.review.create({ data: newReview });
<<<<<<< HEAD
    var vendor: Vendor = await getVendor(vendorName);
=======
    var vendor: Vendor;
    try {
        vendor = await getVendor(vendorName);
    } catch (err){
        await pushVendor({ name: vendorName });
        vendor = await getVendor(vendorName); 
    }
>>>>>>> origin/main
    // update badges
    const badgeIndex = vendor.badges.findIndex(e => e.text === review.badge); // find if this exists
    const badge = badgeIndex >= 0 ? vendor.badges[badgeIndex] : { text: newReview.badge, count: 1 } as Badge
    if (badgeIndex >= 0) ++badge.count;
    const vendorBadges = badgeIndex >= 0 ? vendor.badges : [...vendor.badges, badge].sort((a,b) => a.count-b.count) // if it does then
    // adjust rating
    const currentRating = (vendor.rating ?? 0);
    const reviewAmount = (vendor.numReviews ?? 0);
    const newRating = ((currentRating * reviewAmount) + newReview.rating)/ (reviewAmount + 1);
    return await prisma.vendor.update({
        where: {name:vendorName},
        data: {
            rating: newRating,
            badges: vendorBadges,
            numReviews: reviewAmount + 1,
            reviews: [...vendor.reviews, review.id]
        }
    });
}

export async function voteOnReview(reviewId: string, newVote: number) {
    // TODO: make this work
    const review = prisma.review.update({
        where: {
            id: reviewId
        },
        data: {
            votes: {
                increment: newVote
            }
        }
    });
    return review;
}