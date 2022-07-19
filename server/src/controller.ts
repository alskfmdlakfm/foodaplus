import { Prisma, PrismaClient, Review, Vendor } from '@prisma/client'

const prisma = new PrismaClient();

module.exports.getVendor = async (name: string) => {
    const result = await prisma.vendor.findUnique({
        where: { name }
    });
    return result;
}

module.exports.pushVendor = async (newVendor: Vendor) => {
    const vendor = await prisma.vendor.create({
        data: newVendor
    });
}

module.exports.writeReview = async (newReview: Review, vendorName: string) => {
    const review = await prisma.review.create({ data: newReview });
    if (review){
        // TODO: make this work
        // await prisma.vendor.update({
        //     where: { name: vendorName },
        //     data: {
        //         reviews: {
        //             push: review
        //         }
        //     }
        // })
    }
}

module.exports.voteOnReview = async (review: Review, newVote: number) => {
    // TODO: make this work
    // await prisma.review.update({
    //     where: { id: review.id },
    //     data: {
    //         vote: { increment: 1 }
    //     }
    // });
    // return true;
}