// backend/routes/propertyRoutes.js
import express from 'express';
import multer from 'multer';
import {
  getProperties,
  createProperty,
  uploadPropertyImage,
  removeProperty,
  updatePropertyController
} from '../controllers/propertyController.js';

const router = express.Router();
const upload = multer();

router.get('/', getProperties);
router.post('/', createProperty);
router.post('/upload-image', upload.single('image'), uploadPropertyImage);
router.delete('/:id', removeProperty);
router.put('/:id', updatePropertyController);

export default router;
