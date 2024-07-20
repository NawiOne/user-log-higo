const userLogService = require('../services/userLog')
const SuccessResult = require('../utils/SuccessResult')

async function getSummary(req, res) {

    const data = await userLogService.getSummary()

    SuccessResult.make(res).send(data)

}

async function getSegmentPercentage(req, res) {

    const data = await userLogService.getSegmentation()

    SuccessResult.make(res).send(data)

}

async function detail(req, res) {
    const email = req.params.email

    const data = await userLogService.detail(email)

    SuccessResult.make(res).send(data)

}

module.exports = {
    getSummary,
    getSegmentPercentage,
    detail
}