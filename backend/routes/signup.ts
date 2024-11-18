import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'
const router = express.Router();
const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET;

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const fullToken = req.headers.authorization?.split(' ');
        let token;
        if(fullToken) {
            token = fullToken[1];
        }
        let user;
        if(token){
            const emailCheck = await prisma.user.findFirst({
                where : {
                    email
                }
            });
            if(!emailCheck){
                user = await prisma.user.create({
                    data: {
                        name,
                        email,
                    }
                });
            }
            else{
                res.json({
                    msg : "This Email already exists"
                })
            }
        }
        else{
            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password,
                    role
                }
            });
        }
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }
        const storageToken = jwt.sign({ email, name }, jwtSecret);
        res.status(201).json(storageToken);
    } catch (error) {
        res.status(500).json({ error: "User creation failed" });
    }
});

export default router;
