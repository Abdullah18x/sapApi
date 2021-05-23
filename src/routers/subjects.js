const express = require('express');
const sql = require('../config/mysqlConfig')
const auth = require('../middleware/adminAuth')

const router = new express.Router()

//Get All Subjects
router.post('/getSubjects', auth, async (req,res) => {
    let query = 'SELECT * FROM subject'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query)
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router