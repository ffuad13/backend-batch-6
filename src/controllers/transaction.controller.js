const { prisma } = require("../config/database");

const createTransaction = async (req, res, next) => {
	const {productId, quantity} = req.body

	try {
		const getProduct = await prisma.product.findFirst({
      where: {
        id: productId,
      },
    });

		const totalPrice = quantity * getProduct.price

		const result = await prisma.transaction.create({
			data: {
				userId: req.user.id,
				productId,
				quantity,
				total_price: totalPrice
			}
		})

		return res.status(201).json({
			message: "Transaksi berhasil dibuat",
			data: result
		})
	} catch (error) {
		next(error)
	}
}

module.exports = { createTransaction }