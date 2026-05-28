import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === "coverImage" || file.fieldname === "profilePic") {
    const allowedImages = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    if (allowedImages.includes(fileExt) && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("File must be a valid image (jpg, jpeg, png, webp, gif)"), false);
    }
  } else if (file.fieldname === "pdfFile" || file.fieldname === "file") {
    const allowedDocs = [".pdf", ".epub", ".txt"];
    const allowedMimeTypes = [
      "application/pdf",
      "application/epub+zip",
      "text/plain"
    ];
    if (allowedDocs.includes(fileExt) || allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Book file must be a valid document (PDF, EPUB, TXT)"), false);
    }
  } else if (file.fieldname === "audioFile" || file.fieldname === "musicFile") {
    const allowedAudio = [".mp3", ".wav", ".ogg", ".m4a"];
    const allowedMimeTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/x-m4a",
      "audio/ogg",
      "audio/webm"
    ];
    if (allowedAudio.includes(fileExt) || allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Music file must be a valid audio format (MP3, WAV, OGG, M4A)"), false);
    }
  } else {
    cb(null, true);
  }
};

export default multer({ storage, fileFilter });
