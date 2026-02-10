const getAllOrders = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Orders controller - to be implemented',
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
};
