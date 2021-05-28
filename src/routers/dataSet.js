const express = require('express')
const sql = require('../config/mysqlConfig')
const auth = require('../middleware/adminAuth')
const multer = require('multer')
var path = require('path')
const fs = require("fs");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
      
    }
  })
   
  var upload = multer({ storage: storage })
const router = new express.Router()

router.post('/createDataSet',auth, upload.single('resourceMaterial'), async (req,res) => {
    let title = req.body.title
    let totalMarks = req.body.totalMarks
    let timeNeeded = req.body.timeNeeded
    let ifC = req.body.ifC
    let switchC = req.body.switchC
    let whileL = req.body.whileL
    let dowhileL = req.body.dowhileL
    let forL = req.body.forL
    let multipleClasses = req.body.multipleClasses
    let methods = req.body.methods
    let arrays = req.body.arrays
    let expectedAnsType = req.body.expectedAnsType
    let subjectId = req.body.subjectId
    let resourceMaterial = req.file.filename
    let details = req.body.details
    let resourceLinks = req.body.resourceLinks
    let solution = req.body.solution
    
    console.log(req.body)
    console.log(title)
    console.log(totalMarks)
    console.log(timeNeeded)
    console.log(ifC)
    console.log(switchC)
    console.log(whileL)
    console.log(dowhileL)
    console.log(multipleClasses)
    console.log(methods)
    console.log(arrays)
    console.log(expectedAnsType)
    console.log(subjectId)
    console.log(resourceMaterial)
    console.log(details)
    console.log(resourceLinks)
    console.log(solution)

    let query = 'INSERT INTO datasets(title, totalMarks, timeNeeded, ifC, switchC, whileL, dowhileL, forL, multipleClasses, methods, arrays, expectedAnsType, subjectId, resourceMaterial, details, resourceLinks, solution) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    try {
        // if (!file) {
        //     const error = new Error('Please upload a file')
        //     error.httpStatusCode = 400
        //     console.log(error) 
        //   }
        let conn = await sql.getDBConnection();
        await conn.execute(query,[title,totalMarks,timeNeeded,ifC,switchC,whileL,dowhileL,forL,multipleClasses,methods,arrays,expectedAnsType,subjectId,resourceMaterial,details,resourceLinks,solution])
        res.status(200).send('Inserted assignment')
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
})

router.post('/test',auth,async (req,res) => {
    

    let query = 'INSERT INTO datasets(title, totalMarks, timeNeeded, ifC, switchC, whileL, dowhileL, forL, multipleClasses, methods, arrays, expectedAnsType, subjectId, resourceMaterial, details, resourceLinks, solution) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    try {
        res.status(200).send('Inserted assignment')
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
})

module.exports = router