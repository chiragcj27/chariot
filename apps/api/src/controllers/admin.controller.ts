import { Request, Response } from 'express';
import { PromotionalStrip } from '@chariot/db';

interface PromotionalStripBody {
    stripContent: string;
    stripLink: string;
}

export const adminController = {
    async addPromotionalStrip(req: Request<{}, {}, PromotionalStripBody>, res: Response) {
        try {
            const {stripContent, stripLink} = req.body;
            const newStrip = await PromotionalStrip.create({stripContent, stripLink});
            res.status(201).json(newStrip);
        } catch (error) {
            res.status(500).json({message: 'Error creating promotional strip', error});
        }
    },
    async getPromotionalStrip(req: Request, res: Response) {
        try {
            const promotionalStrip = await PromotionalStrip.find();
            res.status(200).json(promotionalStrip);
        } catch (error) {
            res.status(500).json({message: 'Error getting promotional strip', error});
        }
    },
    
}