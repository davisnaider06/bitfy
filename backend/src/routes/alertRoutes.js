// backend/src/routes/alertRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createAlert,
  getMyAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
} = require('../controllers/alertController');

const router = express.Router();


router.use(protect); //middleware de proteção a todas as rotas abaixo

router.route('/')
  .post(createAlert)   //POST /api/alerts
  .get(getMyAlerts);  //GET /api/alerts

router.route('/:id')
  .get(getAlertById)   //GET /api/alerts/:id
  .put(updateAlert)    //PUT /api/alerts/:id
  .delete(deleteAlert); //DELETE /api/alerts/:id

module.exports = router;