var express = require("express");
var router = express.Router();
const { getProfile } = require("./getProfile");
const contract = require("../controller/contract.controller");
const job = require("../controller/job.controller");
const balance = require("../controller/balance.controller");
const admin = require("../controller/admin.controller");

router
  .get("/contracts/:id", getProfile, contract.getone)
  .get("/contracts", getProfile, contract.getall)
  .get("/jobs/unpaid", getProfile, job.unpaid)
  .post("/jobs/:job_id/pay", getProfile, job.pay)
  .post("/balances/deposit/:userId/:money", balance.add)
  .get("/admin/best-profession", admin.profession)
  .get("/admin/best-clients", admin.clients);

module.exports = router;
