var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");

const {
  signup,
  signout,
  signin,
  isSignedIn
} = require("../controllers/authentication");

router.post(
  "/signup",
  [
    check("name")
      .isLength({ min: 3 })
      .withMessage("Name should be atleast 3 characters"),
    check("email").isEmail().withMessage("Email is required"),
    check("password")
      .isLength({ min: 3 })
      .withMessage("Password should be atleast 3 characters")
  ],
  signup
);

router.post(
  "/signin",
  [
    check("email","Email is required!").isEmail(),
    check("password")
      .isLength({ min: 1 })
      .withMessage("Password field is required")
  ],
  signin
);

router.get("/signout", signout);

router.get("/test", isSignedIn, (req, res) => {
  res.json(req.auth);
});

module.exports = router;
