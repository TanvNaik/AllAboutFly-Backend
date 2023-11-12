require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

//My Routes
const authRoutes = require("./routes/authentication");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const cartRoutes = require("./routes/cart");
const paymentRoutes = require("./routes/Payment");


// DB Connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log("DB CONNECTED");
  });

// Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());


app.use("/image", cors(),express.static(path.join(__dirname, '/uploads/images')))


//My Routes
app.use("/api", authRoutes); //eg /api/signout
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", cartRoutes);
app.use("/api", paymentRoutes);

//Port
const port = 8000;

//Starting the server
app.listen(port, () => {
  console.log(`app is running at ${port}`);
});
