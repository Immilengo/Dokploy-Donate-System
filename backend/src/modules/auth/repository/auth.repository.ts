import { prisma }  from '@infra/database/prisma';
import { Prisma } from '@prisma/client';

export class AuthRepository{
    async findByEmail(email: string){
        return prisma.user.findFirst({
            where: { email: email.toLowerCase(), deleted: false},
        });
    }

    async findById(id: string){
        return prisma.user.findUnique({where: {id}});
    }

    async create(data: Prisma.UserCreateInput){
        return prisma.user.create({data});
    }

    async findByGoogleId(googleId: string){
        return prisma.user.findFirst({where: {googleId, deleted: false}});
    }

    async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
    }

    async updateGoogleId(id: string, googleId: string){
        return prisma.user.update({where:{id}, data: {googleId}});
    }
}