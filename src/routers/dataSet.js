const express = require('express')
const sql = require('../config/mysqlConfig')
const auth = require('../middleware/adminAuth')
const auth2 = require('../middleware/lecturerAuth')
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
    let expectedAns = req.body.expectedAns
    let solution = req.body.solution

    let query = 'INSERT INTO datasets(title, totalMarks, timeNeeded, ifC, switchC, whileL, dowhileL, forL, multipleClasses, methods, arrays, expectedAnsType, subjectId, resourceMaterial, details, resourceLinks,expectedAns, solution) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    try {
        // if (!file) {
        //     const error = new Error('Please upload a file')
        //     error.httpStatusCode = 400
        //     console.log(error) 
        //   }
        let conn = await sql.getDBConnection();
        await conn.execute(query,[title,totalMarks,timeNeeded,ifC,switchC,whileL,dowhileL,forL,multipleClasses,methods,arrays,expectedAnsType,subjectId,resourceMaterial,details,resourceLinks,expectedAns,solution])
        res.status(200).send('Inserted assignment')
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
})

router.post('/getDataSets',auth, async (req,res) => {

    let query = 'SELECT * FROM datasets LEFT JOIN subject ON datasets.subjectId = subject.subjectId'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query)
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getDataSets2',auth2, async (req,res) => {

    let query = 'SELECT * FROM datasets LEFT JOIN subject ON datasets.subjectId = subject.subjectId'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query)
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getDataSet',auth, async (req,res) => {
    let datasetId = req.body.datasetId
    let query = 'SELECT * FROM datasets WHERE datasetId = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[datasetId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/uopdateDataSetWOF',auth, async (req,res) => {
    let datasetId = req.body.datasetId
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
    let details = req.body.details
    let resourceLinks = req.body.resourceLinks
    let expectedAns = req.body.expectedAns
    let solution = req.body.solution

    // console.log(datasetId)
    // console.log(title)
    // console.log(totalMarks)
    // console.log(timeNeeded)
    // console.log(ifC)
    // console.log(switchC)
    // console.log(whileL)
    // console.log(dowhileL)
    // console.log(forL)
    // console.log(multipleClasses)
    // console.log(methods)
    // console.log(arrays)
    // console.log(expectedAnsType)
    // console.log(subjectId)
    // console.log(details)
    // console.log(resourceLinks)
    // console.log(expectedAns)
    // console.log(solution)

    let query = 'UPDATE datasets SET title=?, totalMarks=?, timeNeeded=?, ifC=?, switchC=?, whileL=?, dowhileL=?, forL=?, multipleClasses=?, methods=?, arrays=?, expectedAnsType=?, subjectId=?, details=?, resourceLinks=?, expectedAns=?, solution=? WHERE datasetId =?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[title, totalMarks, timeNeeded, ifC, switchC, whileL, dowhileL, forL, multipleClasses, methods, arrays, expectedAnsType, subjectId, details, resourceLinks, expectedAns, solution, datasetId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/uopdateDataSetWF',auth,upload.single('resourceMaterial'), async (req,res) => {
    let datasetId = req.body.datasetId
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
    let expectedAns = req.body.expectedAns
    let solution = req.body.solution

    let query = 'UPDATE datasets SET title=?, totalMarks=?, timeNeeded=?, ifC=?, switchC=?, whileL=?, dowhileL=?, forL=?, multipleClasses=?, methods=?, arrays=?, expectedAnsType=?, subjectId=?,resourceMaterial=?, details=?, resourceLinks=?, expectedAns=?, solution=? WHERE datasetId =?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[title, totalMarks, timeNeeded, ifC, switchC, whileL, dowhileL, forL, multipleClasses, methods, arrays, expectedAnsType, subjectId,resourceMaterial, details, resourceLinks, expectedAns, solution, datasetId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/deleteDs',auth, async (req,res) => {
    let datasetId = req.body.datasetId
    let query = 'DELETE FROM datasets WHERE datasetId = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[datasetId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router