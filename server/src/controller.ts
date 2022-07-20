import { Prisma, PrismaClient, Review, Vendor } from '@prisma/client'

const prisma = new PrismaClient();

export async function getVendor(name: string) {
    const result = await prisma.vendor.findFirstOrThrow({
        where: { name }
    });
    return result;
}

export async function pushVendor(newVendor: any){
    // return false if the vendor currently exists
    if (await prisma.vendor.findFirst({ where: { name: newVendor.name }})) return false;
    const vendor = await prisma.vendor.create({
        data: newVendor
    });
    return !!vendor;
}

export async function writeReview (newReview: Review, vendorName: string) {
    // const review = await prisma.review.create({ data: newReview });
    const vendor = await prisma.vendor.findUnique({where: {name: vendorName}, include: {reviews: true}});
    if (!vendor){
        // TODO: make this work
        return await prisma.vendor.create({
            data: {
                name: vendorName,
                rating: newReview.rating,
                numReviews: 1,
                reviews: {
                    create: [newReview]
                }
            }
        })
    } else if (vendor != null) {
        const currentRating = (vendor.rating ?? 0);
        const reviewAmount = (vendor.numReviews ?? 0);
        const newRating = (currentRating / (reviewAmount == 0 ? 1 : reviewAmount) 
            + newReview.rating) / (reviewAmount + 1);
            const reviews = [...vendor.reviews, newReview] as Review[];
        return await prisma.vendor.update({
            where: {name:vendorName},
            data: {
                rating: newRating,
                badges: "lol todo",
                numReviews: reviewAmount + 1,
                // reviews: newReview,
            }
        })
    }
}

export async function voteOnReview(review: Review, newVote: number) {
    // TODO: make this work
    // await prisma.review.update({
    //     where: { id: review.id },
    //     data: {
    //         vote: { increment: 1 }
    //     }
    // });
    // return true;
}