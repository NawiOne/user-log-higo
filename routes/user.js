const router = require('express-promise-router')()

const userLogController = require('../app/controllers/userLog')

/* GET users listing. */
const pathUrl = '/api/v1/user-log'

router.get(`${pathUrl}`, userLogController.index);
router.get(`${pathUrl}/summary`, userLogController.getSummary);
router.get(`${pathUrl}/segmentation`, userLogController.getSegmentPercentage);
router.get(`${pathUrl}/detail/:email`, userLogController.detail);

module.exports = router;