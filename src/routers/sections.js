const express = require('express');
const sql = require('../config/mysqlConfig')
const auth = require('../middleware/adminAuth')
const auth2 = require('../middleware/lecturerAuth')

const router = new express.Router()

router.post('/addSection', auth, async (req,res) => {
    let section = req.body.section
    let query = 'INSERT INTO section(section) VALUES (?)'
    try {
        let conn = await sql.getDBConnection();
        await conn.execute(query,[section])
        res.status(200)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getSections', auth, async (req,res) => {
    let query = 'SELECT section.sectionId AS sectionId,section.section, COUNT(DISTINCT lecturerassigned.lecturerId) AS totalLecturers, COUNT(DISTINCT studentsection.studentId) AS students FROM section LEFT JOIN lecturerassigned ON section.sectionId = lecturerassigned.sectionId LEFT JOIN studentsection ON section.sectionId = studentsection.sectionId GROUP BY sectionId'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query)
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getSection', auth, async (req,res) => {
    let sectionId = req.body.sectionId
    let query = 'SELECT * FROM section WHERE sectionId=? '
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query, [sectionId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getRecentSections', auth, async (req,res) => {
    let query = 'SELECT section.sectionId AS sectionId,section.section, COUNT(DISTINCT lecturerassigned.lecturerId) AS totalLecturers, COUNT(DISTINCT studentsection.studentId) AS students FROM section LEFT JOIN lecturerassigned ON section.sectionId = lecturerassigned.sectionId LEFT JOIN studentsection ON section.sectionId = studentsection.sectionId GROUP BY sectionId ORDER BY section.sectionId DESC LIMIT 8'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query)
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getlecturerAtRiskStudents', auth, async (req,res) => {
    let query = 'SELECT lecturerassigned.lecturerId AS id, name, COUNT(DISTINCT lecturerassigned.sectionId) AS totalSections, COUNT(DISTINCT atriskstatus.studentId) AS totalStudents FROM lecturer INNER JOIN lecturerassigned on lecturer.lecturerId = lecturerassigned.lecturerId INNER JOIN studentsection ON studentsection.sectionId = lecturerassigned.sectionId INNER JOIN atriskstatus ON atriskstatus.studentId = studentsection.studentId AND atriskstatus.subjectId = lecturerassigned.subjectId GROUP BY lecturerassigned.lecturerId ORDER BY lecturerassigned.lecturerId DESC LIMIT 8'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query)
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getAlllecturerAtRiskStudents', auth, async (req,res) => {
    let query = 'SELECT lecturerassigned.lecturerId AS id, name, COUNT(DISTINCT lecturerassigned.sectionId) AS totalSections, COUNT(DISTINCT atriskstatus.studentId) AS totalStudents FROM lecturer INNER JOIN lecturerassigned on lecturer.lecturerId = lecturerassigned.lecturerId INNER JOIN studentsection ON studentsection.sectionId = lecturerassigned.sectionId INNER JOIN atriskstatus ON atriskstatus.studentId = studentsection.studentId AND atriskstatus.subjectId = lecturerassigned.subjectId GROUP BY lecturerassigned.lecturerId ORDER BY lecturerassigned.lecturerId DESC LIMIT 8'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query)
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getAssignedLecturers', auth, async (req,res) => {
    let sectionId = req.body.sectionId
    let query = 'SELECT name, lecturer.lecturerId AS lecturerId, email, subject.subjectId, subject, COUNT(DISTINCT studentsubject.studentId) AS totalStudents, COUNT(DISTINCT atriskstatus.studentId) AS totalAtRisk FROM lecturer LEFT JOIN lecturerassigned ON lecturer.lecturerId = lecturerassigned.lecturerId LEFT JOIN section ON section.sectionId = lecturerassigned.sectionId LEFT JOIN studentsection ON section.sectionId = studentsection.sectionId LEFT JOIN studentsubject ON studentsection.studentId = studentsubject.stdSubjectId AND lecturerassigned.subjectId = studentsubject.subjectId LEFT JOIN subject ON subject.subjectId = lecturerassigned.subjectId LEFT JOIN atriskstatus ON atriskstatus.studentId = studentsubject.studentId AND lecturerassigned.subjectId = atriskstatus.subjectId WHERE section.sectionId=? GROUP BY lecturer.lecturerId'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query, [sectionId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getSectionStudents', auth, async (req,res) => {
    let sectionId = req.body.sectionId
    let query = 'SELECT student.studentId AS studentId, name, email, rollNo, COUNT(DISTINCT studentsubject.subjectId) as totalSubjects FROM student LEFT JOIN studentsection ON student.studentId = studentsection.studentId LEFT JOIN studentsubject ON studentsubject.studentId = student.studentId WHERE studentsection.sectionId = ? GROUP BY student.studentId'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query, [sectionId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getSectionStudents2', auth2, async (req,res) => {
    let assignId = req.body.assignId
    let query = 'SELECT DISTINCT(student.studentId), name, email, rollNo, atRisk FROM lecturerassigned INNER JOIN studentsection ON lecturerassigned.sectionId = studentsection.sectionId INNER JOIN studentsubject ON studentsubject.subjectId = lecturerassigned.subjectId INNER JOIN student ON student.studentId = studentsection.studentId LEFT JOIN atriskstatus ON atriskstatus.studentId = student.studentId WHERE lecturerassigned.assignId = ?'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query, [assignId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getLecturerSections', auth2, async (req,res) => {
    let lecturerId = req.body.lecturerId
    let query = 'SELECT * FROM lecturerassigned INNER JOIN section ON lecturerassigned.sectionId = section.sectionId INNER JOIN subject ON lecturerassigned.subjectId = subject.subjectId WHERE lecturerassigned.lecturerId = ?'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query, [lecturerId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/updateSection', auth, async (req,res) => {
    let section = req.body.section
    let sectionId = req.body.sectionId
    let query = 'UPDATE section SET section=? WHERE sectionId = ?'
    try {
        let conn = await sql.getDBConnection();
        await conn.execute(query, [section,sectionId])
        res.status(200).send('updated')
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/removeSection',auth, async (req,res) => {
    let sectionId = req.body.sectionId
    console.log(sectionId)
    let query = 'DELETE FROM section WHERE sectionId=?'
    let query2 = 'DELETE FROM studentsection WHERE sectionId=?'
    let query3 = 'SELECT * FROM lecturerassigned WHERE sectionId =?'
    let query4 = 'SELECT * FROM lecturerassigned WHERE lecturerId =?'
    let query5 = 'UPDATE lecturer SET status=0 WHERE lecturerId = ?'
    let query6 = 'DELETE FROM lecturerassigned WHERE sectionId=?'
    try {
        let conn = await sql.getDBConnection();
        console.log('here')
        let [data,fields] = await conn.execute(query3, [sectionId])
        console.log(data.length)
        if(data.length){
            console.log('here')
            for (let i = 0; i < data.length; i++) {
                console.log('here')
                let [data2,fields] = await conn.execute(query4, [data[i].lecturerId])
                if(data2.length <= 1){
                    console.log('here')
                    await conn.execute(query5, [data[i].lecturerId])
                }
                
            }
            await conn.execute(query6, [sectionId])
        }
        await conn.execute(query, [sectionId])
        await conn.execute(query2, [sectionId])
        
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router