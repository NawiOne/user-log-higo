const userLogService = require('../services/userLog')

async function getSummary(req, res) {

    const data = await userLogService.getSummary()

    res.json(data)

}

async function getSegmentPercentage(req, res) {

    const data = await userLogService.getSegmentation()

    res.json(data)

}

async function detail(req, res) {
    const email = req.params.email

    const data = await userLogService.detail(email)

    res.json(data)

}

module.exports = {
    getSummary,
    getSegmentPercentage,
    detail
}