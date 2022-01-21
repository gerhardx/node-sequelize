const { Sequelize, Op } = require("sequelize");

/**
 *
 * @returns best performing profession
 */
exports.profession = async function (req, res) {
  const { Contract, Job, Profile } = req.app.get("models");
  const { start, end } = req.query;

  const jobs = await Contract.findAll({
    group: "ContractorId",
    attributes: [
      "ContractorId",
      [Sequelize.fn("SUM", Sequelize.col("Jobs.price")), "earned"],
    ],
    include: [
      {
        model: Job,
        required: true,
        where: { paid: true, paymentDate: { [Op.between]: [end, start] } },
        attributes: [],
        order: [["earned", "DESC"]],
      },
    ],
  });
  if (jobs.length === 0) {
    return res.json({ most_permforming_profession: "not found" });
  }

  jobs.sort((a, b) => (a.earned > b.earned ? 1 : -1));

  const result = await Profile.findOne({
    where: {
      id: jobs[0].ContractorId,
    },
  });

  return res.json({ most_permforming_profession: result.profession });
};

/**
 *
 * @returns best clients
 */

exports.clients = async function (req, res) {
  const { Contract, Job, Profile } = req.app.get("models");
  const { start, end, limit } = req.query;

  const jobs = await Contract.findAll({
    attributes: [
      "ClientId",
      [Sequelize.fn("SUM", Sequelize.col("Jobs.price")), "payed"],
    ],
    include: [
      {
        model: Job,
        required: true,
        where: {
          paid: true,
          paymentDate: { [Op.between]: [end, start] },
        },
        attributes: [],
      },
    ],
    group: ["ContractId"],
    limit: limit,
    subQuery: false,
  });

  return res.json(jobs);
};
