const router = require('express-promise-router')()

const userLogController = require('../app/controllers/userLog')

/* GET users listing. */
router.get('/summary', userLogController.getSummary);
router.get('/segmentation', userLogController.getSegmentPercentage);
router.get('/detail/:email', userLogController.detail);

module.exports = router;