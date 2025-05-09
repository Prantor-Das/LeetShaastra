import { parser } from "../middleware/cloudinaryUpload.middleware";

router.post("/upload", parser.single("image"), async (req, res) => {
  try {
    const imageUrl = req.file.path; // Cloudinary URL

    const newEntry = new Image({
      name: req.body.name,
      imageUrl: imageUrl
    });

    await newEntry.save();

    res.json({ success: true, imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});