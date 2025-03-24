const express = require("express");
const newsController = require("../controllers/newsController");
const upload = require("../middlewares/upload");

const router = express.Router();

router
  .route("/")
  .post(upload.single("image"), newsController.createProduct)
  .get(newsController.getAllProduct);


router
  .route("/:id")
  .get(newsController.getProduct)
  //   // .put(newsController.updateNews)
  .put(upload.single("image"), newsController.updateProduct)
  .delete(newsController.deleteProduct);
router
  .route('/related/:id')
  .get(newsController.getRelatedProduct);

module.exports = router;
