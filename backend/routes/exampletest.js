import express from "express";
import multer from "multer";
import router from "./mysqlRoutes";

router.post("api/example/upload" ,async(req,res)=>{
   const { file } = req.body;
   const result = await uploadToAzure(file, file.name);
   return res.json(result);
   
}
);