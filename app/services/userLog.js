const DataNotFound = require('../exceptions/DataNotFound')
const userModel = require('../models/userLog')


async function index({ page, limit }) {
    return await userModel.aggregate([
        {
            $group: {
                _id: '$email',
                name: { $first: '$name' },
                email: { $first: '$email' },
                phone: { $first: '$phone' },
                gender: { $first: '$gender' },
            },
        },
        {
            $project: {
                _id: 0,
                name: 1,
                email: 1,
                phone: 1,
                gender: 1,
            },
        },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        // { $sort: { name: 1 } }
    ])

}

async function getSummary() {
    const data = await userModel.aggregate().facet(
        {
            uniqueUsersPerDay: [
                {
                    $group: {
                        _id: "$date",
                        uniqueUsers: { $addToSet: "$email" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        uniqueUserCount: { $size: "$uniqueUsers" }
                    }
                }
            ],
            uniqueUsersTotal: [
                {
                    $group: {
                        _id: null,
                        uniqueUsers: { $addToSet: "$email" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        uniqueUserCount: { $size: "$uniqueUsers" }
                    }
                }
            ],
            crowdedDays: [
                {
                    $group: {
                        _id: "$date",
                        userCount: { $sum: 1 }
                    }
                },
                {
                    $sort: { userCount: -1 }
                },
                {
                    $limit: 1
                },
                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        userCount: 1
                    }
                }
            ],
            crowdedHours: [
                {
                    $group: {
                        _id: "$login_hour",
                        userCount: { $sum: 1 }
                    }
                },
                {
                    $sort: { userCount: -1 }
                },
                {
                    $limit: 1
                },
                {
                    $project: {
                        _id: 0,
                        hour: "$_id",
                        userCount: 1
                    }
                }
            ],
            newAndReturningPerDay: [
                {
                    $group: {
                        _id: "$email",
                        firstLogin: { $first: "$date" },
                        logins: { $push: "$date" }
                    }
                },
                {
                    $unwind: "$logins"
                },
                {
                    $group: {
                        _id: "$logins",
                        newUsers: {
                            $sum: {
                                $cond: [{ $eq: ["$logins", "$firstLogin"] }, 1, 0]
                            }
                        },
                        returningUsers: {
                            $sum: {
                                $cond: [{ $ne: ["$logins", "$firstLogin"] }, 1, 0]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        newUsers: 1,
                        returningUsers: 1
                    }
                },
                {
                    $sort: { date: 1 }
                }
            ],
            totalNewAndReturningUser: [
                {
                    $group: {
                        _id: "$email",
                        firstLogin: { $first: "$date" },
                        logins: { $push: "$date" }
                    }
                },
                {
                    $unwind: "$logins"
                },
                {
                    $group: {
                        _id: "$logins",
                        newUsers: {
                            $sum: {
                                $cond: [{ $eq: ["$logins", "$firstLogin"] }, 1, 0]
                            }
                        },
                        returningUsers: {
                            $sum: {
                                $cond: [{ $ne: ["$logins", "$firstLogin"] }, 1, 0]
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalNewUsers: { $sum: "$newUsers" },
                        totalReturningUsers: { $sum: "$returningUsers" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalNewUsers: 1,
                        totalReturningUsers: 1
                    }
                }
            ],
            totalData: [
                {
                    $count: "totalData"
                }
            ]
        }
    ).allowDiskUse()

    const result = data[0]

    return {
        ...result,
        crowdedDays: result.crowdedDays[0],
        crowdedHours: result.crowdedHours[0],
        totalData: result.totalData[0].totalData,
        uniqueUsersTotal: result.uniqueUsersPerDay[0].uniqueUserCount,
        totalNewAndReturningUser: result.totalNewAndReturningUser[0]
    }

}

async function getSegmentation() {
    const currentYear = new Date().getFullYear();

    const data = await userModel.aggregate().facet(
        {
            ageGroup: [
                {
                    $addFields: {
                        actualAge: { $subtract: [currentYear, "$age"] }
                    }
                },
                {
                    $group: {
                        _id: "$actualAge",
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$count" },
                        ageCounts: { $push: { age: "$_id", count: "$count" } }
                    }
                },
                {
                    $unwind: "$ageCounts"
                },
                {
                    $project: {
                        age: "$ageCounts.age",
                        count: "$ageCounts.count",
                        percentage: {
                            $multiply: [{ $divide: ["$ageCounts.count", "$total"] }, 100]
                        }
                    }
                },
                {
                    $sort: { age: 1 }
                }
            ],
            gender: [
                {
                    $group: {
                        _id: "$gender",
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$count" },
                        genders: { $push: { gender: "$_id", count: "$count" } }
                    }
                },
                {
                    $unwind: "$genders"
                },
                {
                    $project: {
                        _id: 0,
                        gender: "$genders.gender",
                        percentage: {
                            $multiply: [{ $divide: ["$genders.count", "$total"] }, 100]
                        }
                    }
                }
            ],
            brandDevice: [
                {
                    $group: {
                        _id: "$brand_device",
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$count" },
                        brands: { $push: { brand: "$_id", count: "$count" } }
                    }
                },
                {
                    $unwind: "$brands"
                },
                {
                    $project: {
                        _id: 0,
                        brand: "$brands.brand",
                        percentage: {
                            $multiply: [{ $divide: ["$brands.count", "$total"] }, 100]
                        }
                    }
                },
                {
                    $sort: { brand: 1 }
                }

            ],
            digitalInterest: [
                {
                    $group: {
                        _id: "$digital_interest",
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$count" },
                        interests: { $push: { interest: "$_id", count: "$count" } }
                    }
                },
                {
                    $unwind: "$interests"
                },
                {
                    $project: {
                        _id: 0,
                        interest: "$interests.interest",
                        percentage: {
                            $multiply: [{ $divide: ["$interests.count", "$total"] }, 100]
                        }
                    }
                }
            ]
        }
    )

    data[0].ageGroup = mappingAgeGroup(data[0].ageGroup)
    data[0].gender = mappingGender(data[0].gender)
    data[0].brandDevice = mappingBrandDevice(data[0].brandDevice)
    data[0].digitalInterest = mappingDigitalInterest(data[0].digitalInterest)

    return data[0]

}

async function detail(email) {
    const detail = await userModel.aggregate([
        {
            $match: { email }
        },
        {
            $project: {
                _id: 0,
                name: 1,
                gender: 1,
                email: 1,
                phone: 1
            }
        },
        {
            $limit: 1
        }
    ])

    if (detail.length === 0) throw new DataNotFound()

    const topUserPerLocation = await userModel.aggregate([
        {
            $group: {
                _id: { location: "$name_of_location", email: "$email" },
                count: { $sum: 1 },
                name: { $first: "$name" },
                gender: { $first: "$gender" },
                phone: { $first: "$phone" }
            }
        },
        {
            $group: {
                _id: "$_id.location",
                users: {
                    $push: {
                        email: "$_id.email",
                        count: "$count",
                        name: "$name",
                        gender: "$gender",
                        phone: "$phone"
                    }
                }
            }
        },
        {
            $unwind: "$users"
        },
        {
            $sort: {
                "_id": 1,
                "users.count": -1
            }
        },
        {
            $group: {
                _id: "$_id",
                topUsers: { $push: "$users" }
            }
        },
        {
            $project: {
                _id: 0,
                location: "$_id",
                topUsers: { $slice: ["$topUsers", 5] }
            }
        }
    ])

    return {
        detail: detail[0],
        topUserPerLocation
    }

}


function mappingAgeGroup(ageData) {
    const ageRanges = [
        { range: "<18", count: 0, percentage: 0, color: '#EF5A6F' },
        { range: "18-24", count: 0, percentage: 0, color: '#375E83' },
        { range: "25-34", count: 0, percentage: 0, color: '#259AE6' },
        { range: "35-44", count: 0, percentage: 0, color: '#FFA70B' },
        { range: "45-64", count: 0, percentage: 0, color: '#059212' },
        { range: ">64", count: 0, percentage: 0, color: '#028391' },
    ];

    const totalCount = ageData.reduce((sum, item) => sum + item.count, 0);


    for (const item of ageData) {
        const age = item.age;
        const count = item.count;

        if (age < 18) {
            ageRanges[0].count += count;
        } else if (age >= 18 && age <= 24) {
            ageRanges[1].count += count;
        } else if (age >= 25 && age <= 34) {
            ageRanges[2].count += count;
        } else if (age >= 35 && age <= 44) {
            ageRanges[3].count += count;
        } else if (age >= 45 && age <= 64) {
            ageRanges[4].count += count;
        } else if (age > 64) {
            ageRanges[5].count += count;
        }
    }

    for (const item of ageRanges) {
        item.percentage = (item.count / totalCount) * 100;
    }

    return ageRanges

}

function mappingBrandDevice(device) {
    const colors = [
        {
            brand: 'Huawei',
            color: '#ffbe0b'
        },
        {
            brand: 'Xiaomi',
            color: '#0077b6'
        },
        {
            brand: 'LG',
            color: '#8338ec'
        },
        {
            brand: 'Nokia',
            color: '#FF0000'
        },
        {
            brand: 'Motorola',
            color: '#A1DD70'
        },
        {
            brand: 'Sony',
            color: '#DBB5B5'
        },
        {
            brand: 'OnePlus',
            color: '#3f7d20'
        },
        {
            brand: 'Samsung',
            color: '#ee6c4d'
        },
        {
            brand: 'Apple',
            color: '#540b0e'
        },
        {
            brand: 'Google',
            color: '#2ec4b6'
        }
    ]
    return device.map(item => {
        const color = colors.find(col => col.brand === item.brand)
        return {
            ...item,
            color: color?.color
        }
    })
}

function mappingDigitalInterest(interest) {
    const colors = [
        {
            interest: 'E-commerce',
            color: '#ffbe0b'
        },
        {
            interest: 'Social Media',
            color: '#0077b6'
        },
        {
            interest: 'News',
            color: '#8338ec'
        },
        {
            interest: 'Podcast',
            color: '#FF0000'
        },
        {
            interest: 'Technology',
            color: '#A1DD70'
        },
        {
            interest: 'Gaming',
            color: '#DBB5B5'
        },
        {
            interest: 'Sport',
            color: '#3f7d20'
        },
        {
            interest: 'Music',
            color: '#ee6c4d'
        },
    ]
    return interest.map(item => {
        const color = colors.find(col => col.interest === item.interest)
        return {
            ...item,
            color: color?.color
        }
    })
}

function mappingGender(gender) {
    const colors = [
        {
            gender: 'Male',
            color: '#ffbe0b'
        },
        {
            gender: 'Female',
            color: '#0077b6'
        },
    ]
    return gender.map(item => {
        const color = colors.find(col => col.gender === item.gender)
        return {
            ...item,
            color: color?.color
        }
    })
}



module.exports = {
    index,
    getSummary,
    getSegmentation,
    detail
}