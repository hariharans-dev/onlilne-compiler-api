const router = require("express").Router();
const { check, validationResult } = require("express-validator");

const { python_compiler, c_compiler } = require("../controller/compiler");

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
const python_compiler_middleware = [validateRequestBody_python_compiler];
router.post("/python", python_compiler_middleware, python_compiler);

const validateRequestBody_c_compiler = [
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
const c_compiler_middleware = [validateRequestBody_c_compiler];
router.post("/c", c_compiler_middleware, c_compiler);

module.exports = router;
