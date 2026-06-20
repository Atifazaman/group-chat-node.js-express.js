const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = require("../config/s3");


const upload = multer({

  storage: multerS3({

    s3: s3,

    bucket: process.env.AWS_BUCKET_NAME,

    contentType: multerS3.AUTO_CONTENT_TYPE,

    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname
      });
    },

    key: (req, file, cb) => {

      cb(
        null,
        `media/${Date.now()}-${file.originalname}`
      );

    }

  })

});


module.exports = upload;