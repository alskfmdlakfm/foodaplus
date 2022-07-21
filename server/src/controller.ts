import { Prisma, PrismaClient, Review, Vendor } from '@prisma/client'

const prisma = new PrismaClient();

export async function getVendor(name: string) {
    const result = await prisma.vendor.findFirstOrThrow({
        where: { name }
    });
    return result;
}

export async function getReviews(vendor: Vendor) {
    return await Promise.all(vendor.reviews.map(async (id) => {
        return await prisma.review.findUnique({
            where: { id }})
    }));
}

export async function pushVendor(newVendor: any){
    // return false if the vendor currently exists
    if (await prisma.vendor.findFirst({ where: { name: newVendor.name }})) return false;
    const vendor = await prisma.vendor.create({
        data: newVendor
    });
    return vendor;
}

export async function writeReview(newReview: any, vendorName: string) {
    if (!('rating' in newReview) || !('badge' in newReview)) throw new Error("Missing rating or badge.")
    const review = await prisma.review.create({ data: newReview });
    var vendor: Vendor;
    try {
        vendor = await getVendor(vendorName);
    } catch (err){
        await pushVendor({ name: vendorName });
        vendor = await getVendor(vendorName); 
    }
    const currentRating = (vendor.rating ?? 0);
    const reviewAmount = (vendor.numReviews ?? 0);
    const newRating = ((currentRating * reviewAmount) + newReview.rating)/ (reviewAmount + 1);
    return await prisma.vendor.update({
        where: {name:vendorName},
        data: {
            rating: newRating,
            badges: ["lol todo"],
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