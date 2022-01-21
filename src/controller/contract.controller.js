const { Op } = require("sequelize");

/**
 *
 * @returns contract by id
 */
exports.getone = async function (req, res) {
  const { Contract } = req.app.get("models");
  const { id } = req.params;
  const profile_id = parseInt(req.profile.id);
  const contract = await Contract.findOne({ where: { id } });
  if (!contract) return res.status(404).end();
  if (profile_id === contract.ContractorId || profile_id === contract.ClientId)
    return res.json(contract);
  res.status(404).end();
};

/**
 *
 * @returns all non terminated user contracts
 */
exports.getall = async function (req, res) {
  const { Contract } = req.app.get("models");
  const profile_id = parseInt(req.profile.id);
  const contracts = await Contract.findAll({
    where: {
      [Op.or]: [{ ContractorId: profile_id }, { ClientId: profile_id }],
      status: { [Op.ne]: ["terminated"] },
    },
  });

  if (!contracts) return res.status(404).end();
  return res.json(contracts);
};
