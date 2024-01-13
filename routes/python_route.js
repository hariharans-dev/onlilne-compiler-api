const router = require("express").Router();
const { check, validationResult } = require("express-validator");

const { python_compiler } = require("../controller/python_controller");

const validateRequestBody_python_compiler = [
  (req, res, next) => {
    const numberOfFields = Object.keys(req.body).length;
    if (numberOfFields == 0) {
      return res.status(400).json({ message: "no feild given" });
    }
    next();
  },
  check("code").exists(),
  check("input").exists(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "not in proper format" });
    }
    next();
  },
];
const compiler_middleware = [validateRequestBody_python_compiler];
router.post("/compiler", compiler_middleware, python_compiler);

module.exports = router;
