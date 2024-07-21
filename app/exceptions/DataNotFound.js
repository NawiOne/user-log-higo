// Execption when user not found
/**
 * @extends Error
 */
class DataNotFound extends Error {
    /**
     * @param  {string} message
     */
    constructor(message) {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = 404;
        this.printMsg = message || 'Data not found!';
    }
}

module.exports = DataNotFound;
