const Product = require("../models/Product");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const cheerio = require("cheerio");

exports.createProduct = async (req, res) => {
  console.log("Gelen request body:", req.body);
  console.log("Yüklenen dosya bilgisi:", req.file);

  try {
    let imageUrl = "";
    let description = req.body.description;

    // Eğer bir dosya yüklenmişse, Cloudinary'ye yükle
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        use_filename: true,
        folder: "celikhan/product",
        resource_type: "auto",
      });

      imageUrl = result.secure_url;

      // Sunucudaki geçici dosyayı sil
      fs.unlinkSync(req.file.path);
    }

    // Base64 kodlanmış resimleri bul ve Cloudinary'ye yükle
    const base64Regex = /<img\s+[^>]*src=["'](data:image\/[^;]+;base64,([^"']+))["']/g;
    let match;
    while ((match = base64Regex.exec(description)) !== null) {
      const base64Data = match[2]; // Base64 verisi
      const mimeType = match[1].split(";")[0].split(":")[1]; // image/png veya image/jpeg gibi

      // Cloudinary'ye yükle
      const uploadResult = await cloudinary.uploader.upload(`data:${mimeType};base64,${base64Data}`, {
        folder: "celikhan/product",
        resource_type: "image",
      });

      // Base64 verisini Cloudinary URL'si ile değiştir
      description = description.replace(match[1], uploadResult.secure_url);
    }

    // **Cheerio ile <img> etiketlerini düzenle**
    const $ = cheerio.load(description);
    $("img").each(function () {
      $(this).attr("style", "max-width:100%; height:auto; border-radius:8px; display:block; margin:1rem auto;");
    });

    // Güncellenmiş HTML'yi al
    description = $.html();

    // Veritabanına kaydet
    const product = await Product.create({
      title: req.body.title,
      description: description, // Güncellenmiş HTML
      price: req.body.price,
      category: req.body.category,
      imageUrl: imageUrl,
      isFeatured: req.body.isFeatured === "true",
    });

    res.status(201).json({
      status: "success",
      product,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.getAllProduct = async (req, res) => {
  try {
    const product = await Product.find().sort("-createdAt");
    const featuredProduct = await Product.findOne({ isFeatured: true });
    console.log("product bunlar", product);
    res.status(200).json({
      status: "success",
      count: product.length,
      featuredProduct,
      product,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Haber bulunamadı",
      });
    }

    res.status(200).json({
      status: "success",
      product,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.getProductByCategory = async (req, res) => {
  try {
    const product = await Product.find({ category: req.params.category }).sort(
      "-createdAt"
    );

    res.status(200).json({
      status: "success",
      count: product.length,
      product,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      error: error.message,
    });
  }
};
exports.getRelatedProduct = async (req, res) => {
  try {
    const currentProductId = req.params.id;

    // Önce mevcut haberi bul
    const currentProduct = await Product.findById(currentProductId);

    if (!currentProduct) {
      return res.status(404).json({
        status: "fail",
        message: "Haber bulunamadı",
      });
    }

    // Aynı kategorideki diğer haberleri bul, ancak mevcut haberi hariç tut
    // Sadece 3 tane getir ve createdAt'e göre sırala
    const relatedProduct = await Product.find({
      category: currentProduct.category,
      _id: { $ne: currentProductId } // mevcut haberi hariç tut
    })
      .sort("-createdAt")
      .limit(3);

    // Eğer yeterli sayıda benzer haber bulunamazsa, farklı kategorilerden de haber getir
    if (relatedProduct.length < 3) {
      const additionalProduct = await Product.find({
        _id: { $ne: currentProductId },
        category: { $ne: currentProduct.category }
      })
        .sort("-createdAt")
        .limit(3 - relatedProduct.length);

      // İki sonuç kümesini birleştir
      relatedProduct.push(...additionalProduct);
    }

    res.status(200).json({
      status: "success",
      count: relatedProduct.length,
      relatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.getFeaturedProduct = async (req, res) => {
  try {
    const featuredProduct = await Product.findOne({ isFeatured: true });

    res.status(200).json({
      status: "success",
      featuredProduct,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);


    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Haber bulunamadı",
      });
    }

    if (req.file) {
      // Eski resmi cloudinary'den sil
      if (product.imageUrl) {
        const publicId = product.imageUrl.split("/").pop().split(".")[0]; // URL’den dosya adını al
        await cloudinary.uploader.destroy(`celikhan/product/${publicId}`); // Silme işlemi
      }


      // Yeni resmi yükle
      const result = await cloudinary.uploader.upload(req.file.path, {
        use_filename: true,
        folder: "celikhan/product",
        resource_type: "auto",
      });

      // Geçici dosyayı sil
      fs.unlinkSync(req.file.path);

      product.imageUrl = result.secure_url;
    }

    // Eğer haber öne çıkarılacaksa, diğer öne çıkan haberi kaldır
    if (req.body.isFeatured === "true" && !product.isFeatured) {
      await Product.updateMany({}, { isFeatured: false });
    }

    product.title = req.body.title || product.title;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price
    product.category = req.body.category || product.category;
    product.isFeatured = req.body.isFeatured === "true";

    await product.save();

    res.status(200).json({
      status: "success",
      product,
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    console.log("req params", req.params);
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Haber bulunamadı",
      });
    }

    // Cloudinary'den resmi sil
    if (product.imageUrl) {
      const publicId = product.imageUrl.split("/").pop().split(".")[0]; // URL’den dosya adını al
      await cloudinary.uploader.destroy(`celikhan/product/${publicId}`); // Silme işlemi
    }


    // Veritabanından haberi sil
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Haber başarıyla silindi",
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      error: error.message,
    });
  }
};
