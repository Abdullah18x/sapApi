const express = require('express');
const sql = require('../config/mysqlConfig')
const auth2 = require('../middleware/lecturerAuth')
const auth3 = require('../middleware/studentAuth')
const multer = require('multer')
const fs = require("fs");
var path = require('path')

const router = new express.Router()
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
    }
  })
   
  var upload = multer({ storage: storage })

  
//Create an assignment
router.post('/createAssignment',auth2, upload.single('resourceMaterial'), async (req,res) => {
    let lecturerId = req.body.lecturerId
    let title = req.body.title
    let totalMarks = req.body.totalMarks
    let resourceMaterial = req.file.filename
    let details = req.body.details
    let resourceLinks = req.body.resourceLinks
    let solution = req.body.solution
    let query = 'INSERT INTO assignment(title, lecturerId, details, resourceLinks, resourceMaterial, solution, totalMarks) VALUES (?,?,?,?,?,?,?)'
    try {
        // if (!file) {
        //     const error = new Error('Please upload a file')
        //     error.httpStatusCode = 400
        //     console.log(error) 
        //   }
        let conn = await sql.getDBConnection();
        await conn.execute(query,[title,lecturerId,details,resourceLinks,resourceMaterial,solution,totalMarks])
        res.status(200).send('Inserted assignment')
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/assignAssignment',auth2, async (req,res) => {
    let assignmentId = req.body.assignmentId
    let sectionId = req.body.sectionId
    let subjectId = req.body.subjectId
    let due = req.body.due

    let query = 'INSERT INTO assignedassignment(assignmentId, sectionId, subjectId, due) VALUES (?,?,?,?)'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[assignmentId,sectionId,subjectId,due])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/changeAssignmentStatus',auth2, async (req,res) => {
    let assignmentId = req.body.assignmentId
    let status = req.body.status
    let query = 'UPDATE assignment SET status = ? WHERE assignment.assignmentId = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[status,assignmentId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

//Get all Lecturer assignments
router.post('/getAll',auth2, async (req,res) => {
    let lecturerId = req.body.lecturerId
    let query = 'Select * From assignment Where assignment.lecturerId = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[lecturerId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getAllStudentAssignments',auth3, async (req,res) => {
    let studentId = req.body.studentId
    let query = 'SELECT * FROM student LEFT JOIN studentsection ON student.studentId = studentsection.studentId LEFT JOIN studentsubject ON student.studentId = studentsubject.studentId LEFT JOIN assignedassignment ON studentsection.sectionId = assignedassignment.sectionId AND studentsubject.subjectId = assignedassignment.subjectId LEFT JOIN assignment ON assignedassignment.assignmentId = assignment.assignmentId LEFT JOIN section ON section.sectionId = studentsection.sectionId LEFT JOIN subject ON subject.subjectId = studentsubject.subjectId WHERE student.studentId = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[studentId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})


router.post('/getLatestAssignmentId', async (req,res) => {
    let lecturerId = req.body.lecturerId
    let query = 'Select * From assignment Where assignment.lecturerId = ? ORDER BY assignmentId DESC LIMIT 1'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[lecturerId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

//Assign an assignment
router.post('/assign', async (req,res) => {
    let assigmentId = req.body.assigmentId
    let sectionId = req.body.sectionId
    let due = req.body.due
    let query = 'INSERT INTO assignedassignment(assignmentId, sectionId, due) VALUES (?,?,?)'

    try {
        let conn = await sql.getDBConnection();
        await conn.execute(query,[assigmentId,sectionId,due])
        res.status(200).send('assigned')
    } catch (error) {
        res.status(400).send(error)
    }
})

//Get all assigned assignments
router.post('/getAllAssigned', async (req,res) => {
    let lecturerId = req.body.lecturerId
    let query = 'Select * From assignedassignment left join assignment on assignedassignment.assignmentId = assignment.assignmentId Where assignment.lecturerId = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[lecturerId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getAssignment',auth2, async (req,res) => {
    let assignmentId = req.body.assignmentId
    let query = 'SELECT * FROM assignment WHERE assignmentId = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[assignmentId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getAssignmentStd',auth3, async (req,res) => {
    let assignmentId = req.body.assignmentId
    let query = 'SELECT * FROM assignment WHERE assignmentId = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[assignmentId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getAssignedAssignment',auth2, async (req,res) => {
    let assignedId = req.body.assignedId
    let query = 'SELECT * FROM assignedassignment WHERE assignedId = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[assignedId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getAssignedAssignmentStd',auth3, async (req,res) => {
    let assignedId = req.body.assignedId
    let query = 'SELECT * FROM assignedassignment WHERE assignedId = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[assignedId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getAssignedAssignments',auth2, async (req,res) => {
    let assignmentId = req.body.assignmentId
    let query = 'SELECT * FROM assignment INNER JOIN assignedassignment ON assignment.assignmentId = assignedassignment.assignmentId INNER JOIN section ON assignedassignment.sectionId = section.sectionId INNER JOIN subject ON assignedassignment.subjectId = subject.subjectId  ORDER BY assignedId DESC'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[assignmentId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getSubmittedAssignments',auth2, async (req,res) => {
    let assignedId = req.body.assignedId
    let query = 'SELECT * FROM studentsubmissions INNER JOIN student on studentsubmissions.studentId = student.studentId INNER JOIN assignedassignment ON studentsubmissions.assignedId = assignedassignment.assignedId INNER JOIN section ON assignedassignment.sectionId = section.sectionId INNER JOIN subject ON assignedassignment.subjectId = subject.subjectId WHERE studentsubmissions.assignedId = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[assignedId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getPendingStudents',auth2, async (req,res) => {
    let query = 'SELECT studentsection.studentId, name, rollNo, section, subject FROM assignedassignment LEFT JOIN section on assignedassignment.sectionId = section.sectionId LEFT JOIN subject ON subject.subjectId = assignedassignment.subjectId LEFT JOIN studentsection on assignedassignment.sectionId = studentsection.sectionId LEFT JOIN studentsubject ON studentsubject.subjectId = assignedassignment.subjectId AND studentsubject.studentId = studentsection.studentId LEFT JOIN student ON studentsection.studentId = student.studentId LEFT JOIN studentsubmissions on studentsubmissions.studentId = studentsection.studentId AND studentsubmissions.assignedId = assignedassignment.assignedId WHERE submissionId IS NULL'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query)
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/studentSubmission',auth3, async (req,res) => {
    let assignedId = req.body.assignedId
    let studentId = req.body.studentId
    let solution = req.body.solution
    let errorsList = req.body.errorsList
    let errors = req.body.errors
    let timeTaken = req.body.timeTaken
    let query = 'INSERT INTO studentsubmissions(assignedId, studentId, solution, errorsList, timeTaken, errorsNo) VALUES (?,?,?,?,?,?)'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[assignedId,studentId,solution,errorsList,timeTaken,errors])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getStudentSubmission',auth2, async (req,res) => {
    let assignedId = req.body.assignedId
    let studentId = req.body.studentId
    let query = 'SELECT * FROM `studentsubmissions` INNER JOIN student ON studentsubmissions.studentId = student.studentId WHERE assignedId = ? AND studentsubmissions.studentId = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[assignedId,studentId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getRecentSubmissions',auth2, async (req,res) => {
    let lecturerId = req.body.lecturerId
    let query = 'SELECT * FROM student INNER JOIN studentsection ON student.studentId = studentsection.studentId INNER JOIN studentsubject ON student.studentId = studentsubject.studentId INNER JOIN lecturerassigned ON lecturerassigned.sectionId = studentsection.sectionId INNER JOIN section ON studentsection.sectionId = section.sectionId INNER JOIN subject ON subject.subjectId = studentsubject.subjectId INNER JOIN studentsubmissions ON studentsubmissions.studentId = student.studentId INNER JOIN assignedassignment ON assignedassignment.assignedId = studentsubmissions.assignedId INNER JOIN assignment ON assignment.assignmentId = assignedassignment.assignmentId WHERE lecturerassigned.lecturerId = ? AND assignedassignment.subjectId = studentsubject.subjectId ORDER BY submissionId DESC LIMIT 5'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[lecturerId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getRecentSTDSubmissions',auth2, async (req,res) => {
    let lecturerId = req.body.lecturerId
    let studentId = req.body.studentId
    let query = 'SELECT * FROM student INNER JOIN studentsection ON student.studentId = studentsection.studentId INNER JOIN studentsubject ON student.studentId = studentsubject.studentId INNER JOIN lecturerassigned ON lecturerassigned.sectionId = studentsection.sectionId INNER JOIN section ON studentsection.sectionId = section.sectionId INNER JOIN subject ON subject.subjectId = studentsubject.subjectId INNER JOIN studentsubmissions ON studentsubmissions.studentId = student.studentId INNER JOIN assignedassignment ON assignedassignment.assignedId = studentsubmissions.assignedId INNER JOIN assignment ON assignment.assignmentId = assignedassignment.assignmentId WHERE lecturerassigned.lecturerId = ? AND assignedassignment.subjectId = studentsubject.subjectId AND student.studentId = ? ORDER BY submissionId DESC'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[lecturerId,studentId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getStudentSubmissionS',auth3, async (req,res) => {
    let assignedId = req.body.assignedId
    let studentId = req.body.studentId
    let query = 'SELECT * FROM `studentsubmissions` INNER JOIN student ON studentsubmissions.studentId = student.studentId WHERE assignedId = ? AND studentsubmissions.studentId = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[assignedId,studentId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/gradeAssignment',auth2, async (req,res) => {
    let submissionId = req.body.submissionId
    let marksObtained = req.body.marksObtained
    let query = 'UPDATE studentsubmissions SET marksObtained=?,checked=1 WHERE submissionId = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[marksObtained,submissionId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/deleteStudentSubmission',auth2, async (req,res) => {
    let submissionId = req.body.submissionId

    let query = 'DELETE FROM studentsubmissions WHERE studentsubmissions.submissionId = ?'

    try {
        let conn = await sql.getDBConnection();
        await conn.execute(query,[submissionId])
        res.status(200).send('Deleted')
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/downloadResourceMaterial',auth2, async (req,res) => {
    let resourceMaterial = req.body.resourceMaterial

    try {
        var filePath = "src/uploads/".concat(fileName); // Or format the path using the `id` rest param
        var fileName = resourceMaterial; // The default name the browser will use

        res.download(filePath, fileName);
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/updateAssignmentWOF',auth2, async (req,res) => {
    console.log(req.body)
    let assignmentId = req.body.assignmentId
    let lecturerId = req.body.lecturerId
    let title = req.body.title
    let totalMarks = req.body.totalMarks
    let details = req.body.details
    let resourceLinks = req.body.resourceLinks
    let solution = req.body.solution
    console.log()
    let query = 'UPDATE assignment SET title=?,lecturerId=?,details=?,resourceLinks=?,solution=?,totalMarks=? WHERE assignmentId = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[title,lecturerId,details,resourceLinks,solution,totalMarks,assignmentId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/updateAssignmentWF',auth2, upload.single('resourceMaterial'), async (req,res) => {
    console.log('here')
    let assignmentId = req.body.assignmentId
    let lecturerId = req.body.lecturerId
    let title = req.body.title
    let totalMarks = req.body.totalMarks
    let resourceMaterial = req.file.filename
    let details = req.body.details
    let resourceLinks = req.body.resourceLinks
    let solution = req.body.solution
    let query = 'UPDATE assignment SET title=?,lecturerId=?,details=?,resourceLinks=?,resourceMaterial=?,solution=?,totalMarks=? WHERE assignmentId = ?'
    try {
        // if (!file) {
        //     const error = new Error('Please upload a file')
        //     error.httpStatusCode = 400
        //     console.log(error) 
        //   }
        let conn = await sql.getDBConnection();
        await conn.execute(query,[title,lecturerId,details,resourceLinks,resourceMaterial,solution,totalMarks,assignmentId])
        res.status(200).send('Inserted assignment')
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/deleteAssignment',auth2, async (req,res) => {
    let assignmentId = req.body.assignmentId
    let query = 'DELETE FROM assignment WHERE assignmentId = ?'
    let query2 = 'DELETE FROM assignedassignment WHERE assignmentId = ?'
    let query3 = 'DELETE FROM studentsubmissions WHERE assignmentId = ?'

    try {
        let conn = await sql.getDBConnection();
        await conn.execute(query,[assignmentId])
        await conn.execute(query2,[assignmentId])
        await conn.execute(query3,[assignmentId])
        res.status(200).send('Deleted')
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/deleteAssignedAssignment',auth2, async (req,res) => {
    let assignmentId = req.body.assignmentId
    let assignedId = req.body.assignedId
    let query = 'DELETE FROM assignedassignment WHERE assignedId = ?'
    let query2 = 'DELETE FROM studentsubmissions WHERE assignedId = ?'
    let query3 = 'SELECT * FROM assignedassignment WHERE assignmentId = ?'
    let query4 = 'UPDATE assignment SET status = 0 WHERE assignment.assignmentId = ?;'
    try {
        let conn = await sql.getDBConnection();
        await conn.execute(query,[assignedId])
        await conn.execute(query2,[assignedId])
        let [data,fields] = await conn.execute(query3,[assignmentId])
        if (data.length < 1 ) {
            await conn.execute(query4,[assignmentId])
        }
        res.status(200).send('Deleted')
    } catch (error) {
        res.status(400).send(error)
    }
})


module.exports = router