const express = require('express');
const sql = require('../config/mysqlConfig')
const auth = require("../middleware/adminAuth");
const auth2 = require("../middleware/lecturerAuth");
const auth3 = require("../middleware/studentAuth");
const router = new express.Router()

router.post('/getFeedbacks',auth, async (req,res) => {
    let query = 'SELECT * FROM feedback WHERE resolved = 0 ORDER BY fbId DESC'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query)
        res.send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})



module.exports = router