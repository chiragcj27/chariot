import { Request, Response } from 'express';
import { PromotionalStrip, Sale, User, Order, Product, SaleStatus, OrderStatus } from '@chariot/db';

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
    async getAnalytics(req: Request, res: Response) {
        try {
            // Get date ranges for comparison (last 30 days vs previous 30 days)
            const now = new Date();
            const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

            // Total Sales (completed sales only)
            const completedSales = await Sale.find({ status: SaleStatus.COMPLETED });
            const totalSales = completedSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            
            const last30DaysSales = await Sale.find({
                status: SaleStatus.COMPLETED,
                saleDate: { $gte: last30Days }
            });
            const last30DaysTotal = last30DaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            
            const previous30DaysSales = await Sale.find({
                status: SaleStatus.COMPLETED,
                saleDate: { $gte: previous30Days, $lt: last30Days }
            });
            const previous30DaysTotal = previous30DaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            const salesChange = previous30DaysTotal > 0 
                ? ((last30DaysTotal - previous30DaysTotal) / previous30DaysTotal * 100).toFixed(1)
                : '0.0';

            // Active Sellers (approved sellers)
            const activeSellers = await User.countDocuments({
                role: 'seller',
                approvalStatus: 'approved'
            });
            
            const last30DaysSellers = await User.countDocuments({
                role: 'seller',
                approvalStatus: 'approved',
                createdAt: { $gte: last30Days }
            });
            const previous30DaysSellers = await User.countDocuments({
                role: 'seller',
                approvalStatus: 'approved',
                createdAt: { $gte: previous30Days, $lt: last30Days }
            });
            const sellersChange = previous30DaysSellers > 0
                ? ((last30DaysSellers - previous30DaysSellers) / previous30DaysSellers * 100).toFixed(1)
                : '0.0';

            // Active Buyers (approved buyers)
            const activeBuyers = await User.countDocuments({
                role: 'buyer',
                approvalStatus: 'approved'
            });
            
            const last30DaysBuyers = await User.countDocuments({
                role: 'buyer',
                approvalStatus: 'approved',
                createdAt: { $gte: last30Days }
            });
            const previous30DaysBuyers = await User.countDocuments({
                role: 'buyer',
                approvalStatus: 'approved',
                createdAt: { $gte: previous30Days, $lt: last30Days }
            });
            const buyersChange = previous30DaysBuyers > 0
                ? ((last30DaysBuyers - previous30DaysBuyers) / previous30DaysBuyers * 100).toFixed(1)
                : '0.0';

            // Average Order Value (non-cancelled orders)
            const orders = await Order.find({
                status: { $ne: OrderStatus.CANCELLED }
            });
            const avgOrderValue = orders.length > 0
                ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length
                : 0;
            
            const last30DaysOrders = await Order.find({
                status: { $ne: OrderStatus.CANCELLED },
                createdAt: { $gte: last30Days }
            });
            const last30DaysAvg = last30DaysOrders.length > 0
                ? last30DaysOrders.reduce((sum, order) => sum + order.total, 0) / last30DaysOrders.length
                : 0;
            
            const previous30DaysOrders = await Order.find({
                status: { $ne: OrderStatus.CANCELLED },
                createdAt: { $gte: previous30Days, $lt: last30Days }
            });
            const previous30DaysAvg = previous30DaysOrders.length > 0
                ? previous30DaysOrders.reduce((sum, order) => sum + order.total, 0) / previous30DaysOrders.length
                : 0;
            const avgOrderChange = previous30DaysAvg > 0
                ? ((last30DaysAvg - previous30DaysAvg) / previous30DaysAvg * 100).toFixed(1)
                : '0.0';

            // Sales over time (last 6 months)
            const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
            const salesOverTime = await Sale.aggregate([
                {
                    $match: {
                        status: SaleStatus.COMPLETED,
                        saleDate: { $gte: sixMonthsAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$saleDate' },
                            month: { $month: '$saleDate' }
                        },
                        total: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                }
            ]);

            // Format sales over time for chart
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const salesChartData = salesOverTime.map(item => ({
                label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
                value: item.total
            }));

            // Sales by category
            const salesByCategory = await Sale.aggregate([
                {
                    $match: {
                        status: SaleStatus.COMPLETED,
                        'metadata.categoryName': { $exists: true, $ne: null }
                    }
                },
                {
                    $group: {
                        _id: '$metadata.categoryName',
                        total: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { total: -1 }
                },
                {
                    $limit: 5
                }
            ]);

            // Top Sellers (by total sales)
            const topSellers = await Sale.aggregate([
                {
                    $match: {
                        status: SaleStatus.COMPLETED
                    }
                },
                {
                    $group: {
                        _id: {
                            sellerId: '$sellerId',
                            sellerName: '$sellerName'
                        },
                        totalSales: { $sum: '$totalAmount' },
                        orderCount: { $sum: 1 }
                    }
                },
                {
                    $sort: { totalSales: -1 }
                },
                {
                    $limit: 5
                }
            ]);

            // Get product counts for top sellers
            const topSellersWithProducts = await Promise.all(
                topSellers.map(async (seller) => {
                    const productCount = await Product.countDocuments({
                        sellerId: seller._id.sellerId,
                        status: { $ne: 'deleted' }
                    });
                    return {
                        sellerId: seller._id.sellerId.toString(),
                        sellerName: seller._id.sellerName,
                        totalSales: seller.totalSales,
                        orderCount: seller.orderCount,
                        productCount
                    };
                })
            );

            res.status(200).json({
                stats: {
                    totalSales: {
                        value: totalSales,
                        change: parseFloat(salesChange),
                        changeType: parseFloat(salesChange) >= 0 ? 'positive' : 'negative'
                    },
                    activeSellers: {
                        value: activeSellers,
                        change: parseFloat(sellersChange),
                        changeType: parseFloat(sellersChange) >= 0 ? 'positive' : 'negative'
                    },
                    activeBuyers: {
                        value: activeBuyers,
                        change: parseFloat(buyersChange),
                        changeType: parseFloat(buyersChange) >= 0 ? 'positive' : 'negative'
                    },
                    avgOrderValue: {
                        value: avgOrderValue,
                        change: parseFloat(avgOrderChange),
                        changeType: parseFloat(avgOrderChange) >= 0 ? 'positive' : 'negative'
                    }
                },
                salesOverTime: salesChartData,
                salesByCategory: salesByCategory.map(item => ({
                    category: item._id,
                    total: item.total,
                    count: item.count
                })),
                topSellers: topSellersWithProducts
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
            res.status(500).json({ message: 'Error fetching analytics', error });
        }
    },
    
}