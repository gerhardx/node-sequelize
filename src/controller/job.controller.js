const { Op } = require("sequelize");

/**
 *
 * @returns unpaid jobs by user id
 */
exports.unpaid = async function (req, res) {
  const { Contract, Job } = req.app.get("models");
  const profile_id = parseInt(req.profile.id);
  const contracts = await Contract.findAll({
    where: {
      [Op.or]: [{ ContractorId: profile_id }, { ClientId: profile_id }],
      status: { [Op.ne]: ["terminated"] },
    },
  });

  let contracts_id = [];
  contracts.forEach((contract) => {
    contracts_id.push(contract.id);
  });

  const jobs = await Job.findAll({
    where: {
      ContractId: contracts_id,
      paid: { [Op.not]: true },
    },
  });

  if (!jobs) return res.status(404).end();
  return res.json(jobs);
};

/**
 *
 * @returns pay for a job
 */
exports.pay = async function (req, res) {
  const { Contract, Job, Profile } = req.app.get("models");
  const { job_id } = req.params;

  const job = await Job.findOne({
    include: [
      {
        model: Contract,
        required: true,
      },
    ],
    where: {
      id: job_id,
      paid: { [Op.not]: true },
    },
  });
  if (job) {
    if (req.profile.balance >= job.price) {
      let contractor = await Profile.findOne({
        where: {
          id: job.Contract.ContractorId,
        },
      });
      req.profile.balance -= job.price;
      contractor.balance += job.price;
      await Profile.update(
        { balance: req.profile.balance },
        {
          where: {
            id: req.profile.id,
          },
        }
      );
      await Profile.update(
        { balance: contractor.balance },
        {
          where: {
            id: contractor.id,
          },
        }
      );
      await Job.update(
        { paid: true },
        {
          where: {
            id: job.id,
          },
        }
      );

      res.json({ message: "the Job has been paid" });
    } else {
      res.status(404).send({ message: "not enough funds" });
    }
  }
};
