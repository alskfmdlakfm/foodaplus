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

export async function writeReview(newReview: Review, vendorName: string) {
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