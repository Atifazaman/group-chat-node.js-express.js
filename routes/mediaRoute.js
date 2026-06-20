const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = require("../config/s3");


router.post(
  "/upload",
  upload.single("file"),

  async (req, res) => {

    try {

      console.log(req.file);


      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.file.key
      });


      const signedUrl = await getSignedUrl(
        s3,
        command,
        {
          expiresIn: 3600
        }
      );


      res.status(200).json({

        message: "File uploaded",

        url: signedUrl,

        type: req.file.mimetype,

        key: req.file.key

      });


    } catch(err){

      console.log(err);

      res.status(500).json({
        error: err.message
      });

    }

  }
);


module.exports = router;