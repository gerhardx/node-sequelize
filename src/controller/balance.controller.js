const { Op } = require("sequelize");

/**
 *
 * @returns Deposits balance to user profile
 */
exports.add = async function (req, res) {
  const { Contract, Job, Profile } = req.app.get("models");
  const { userId, money } = req.params;

  const jobs = await Contract.findOne({
    include: [
      {
        model: Job,
        where: {
          paid: { [Op.not]: true },
        },
        required: true,
      },
    ],
    where: {
      ClientId: userId,
    },
  });

  let amount = 0;

  jobs.Jobs.forEach((job) => {
    amount += job.price;
  });

  if (amount * 1.25 >= parseFloat(money)) {
    console.log("deposit");
    await Profile.increment(
      { balance: parseFloat(money) },
      { where: { id: userId } }
    );
    res.send({ message: "Deposit has been made succesfully" });
  } else {
    res
      .status(404)
      .send({ message: "Cannot deposit more than 1.25x of your pending jobs" });
  }
};
