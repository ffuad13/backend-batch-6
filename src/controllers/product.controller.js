const { prisma } = require("../config/database");

const createProductCategory = async (req, res, next) => {
	const { name } = req.body;
  if (!name) {
    return res.status(400).json({
      message: 'Nama kategori produk harus diisi',
    });
  }

	try {
    const isCategoryExist = await prisma.category.findFirst({
      where: {
        name,
      },
    });
    if (isCategoryExist) {
      return res.status(400).json({
        message: 'Kategori sudah ada, tidak dapat membuat kateori produk baru',
      });
    }

    const result = await prisma.category.create({
      data: {
        name,
      },
    });

    return res.status(201).json({
      message: 'role created',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

const allProductCategory = async (req, res, next) => {
	try {
		const result = await prisma.category.findMany()
		if (!result) {
			const err = new Error('Tidak ada data kategory');
      err.status = 404;
      throw err;
		}

		return res.status(200).json({
			message: "Berhasil mengambil data kategori",
			data: result
		})
	} catch (error) {
		next(error)
	}
}

const createProduct = async (req, res, next) => {
	const {name, price, categoryId} = req.body
	if (!name || !categoryId) {
    return res.status(400).json({
      message: 'Nama dan kategori produk harus diisi',
    });
  }

	try {
		const isCategoryExist = await prisma.category.findFirst({
      where: {
        id: categoryId,
      },
    });
    if (!isCategoryExist) {
      return res.status(400).json({
        message: 'Kategori tidak ditemukan, tidak dapat membuat produk baru',
      });
    }

		const isProductExist = await prisma.product.findFirst({
      where: {
        name,
      },
    });
    if (isProductExist) {
      return res.status(400).json({
        message: 'Produk sudah ada, tidak dapat membuat produk baru',
      });
    }

		const result = await prisma.product.create({
			data: {
				name,
				price,
				categoryId
			}
		})
		return res.status(201).json({
			message: "Produk berhasil dibuat",
			data: result
		})
	} catch (error) {
		next(error)
	}
}

const allProduct = async (req, res, next) => {
  try {
    const result = await prisma.product.findMany({include: {
			category: true
		}});
    if (!result) {
      const err = new Error('Tidak ada data produk');
      err.status = 404;
      throw err;
    }

    return res.status(200).json({
      message: 'Berhasil mengambil data produk',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {createProductCategory, allProductCategory, createProduct, allProduct}