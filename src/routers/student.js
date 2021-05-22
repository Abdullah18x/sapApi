const express = require('express');
const sql = require('../config/mysqlConfig')
const token = require('../methods/generateToken')
const auth = require('../middleware/adminAuth')
const auth2 = require('../middleware/lecturerAuth')
const auth3 = require('../middleware/studentAuth')

const router = new express.Router()

//Login
router.post('/login', async (req,res) => {
    let userName = req.body.userName
    let password = req.body.password
    let query = 'Select * from student where userName = ? and password = ?'
     try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[userName,password])
        console.log(data)
        if(data.length === 0 || data === undefined){
            res.status(400).send('Invalid login')
        }
        let getToken = await token.generateToken(data[0].studentId,3,data[0].userName)
        let data2 = {...data[0], token: getToken}
        console.log(data2)
        res.send(data2)

    } catch (error) {
        res.status(400).send('error here')
    }
})

//Get all Students
router.post('/getAll', auth, async (req,res) => {
    let query = 'SELECT student.studentId, name, email, rollNo, email, section FROM student LEFT JOIN studentsection ON student.studentId = studentsection.studentId LEFT JOIN section ON section.sectionId = studentsection.sectionId'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query)
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/getStudent', auth3, async (req,res) => {
    let studentId = req.body.studentId
    let query = 'SELECT * FROM student LEFT JOIN studentsection ON student.studentId = studentsection.studentId LEFT JOIN studentsubject ON student.studentId = studentsubject.studentId WHERE student.studentId = ?'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[studentId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

//Get Lecturer Students
router.post('/getLecturerStudents',auth, async (req,res) => {
    let sectionId = req.body.sectionId
    let lecturerId = req.body.lecturerId
    let subjectId = req.body.subjectId
    let query = 'SELECT student.studentId AS studentId, name, email, rollNo, atRisk FROM student LEFT JOIN studentsection ON student.studentId = studentsection.studentId LEFT JOIN studentsubject ON studentsubject.studentId = student.studentId LEFT JOIN lecturerassigned ON lecturerassigned.sectionId = studentsection.sectionId LEFT JOIN atriskstatus ON atriskstatus.studentId = student.studentId AND studentsubject.subjectId = lecturerassigned.subjectId WHERE lecturerassigned.lecturerId =? AND lecturerassigned.sectionId = ? AND studentsubject.subjectId = ?'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query, [lecturerId,sectionId,subjectId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

//Get Lecturer Students 2
router.post('/fetchStudents',auth2, async (req,res) => {
    let lecturerId = req.body.lecturerId
    let query = 'SELECT student.studentId, name, rollNo, email, subject, section, atRisk FROM lecturerassigned INNER JOIN studentsection ON lecturerassigned.lecturerId = studentsection.sectionId INNER JOIN student ON student.studentId = studentsection.studentId INNER JOIN studentsubject ON studentsubject.studentId = student.studentId INNER JOIN atriskstatus ON student.studentId = atriskstatus.studentId INNER JOIN section ON studentsection.sectionId = section.sectionId INNER JOIN subject ON subject.subjectId = studentsubject.subjectId WHERE lecturerId =? and lecturerassigned.subjectId = studentsubject.subjectId'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query, [lecturerId])
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
})

//Add a student
router.post('/addS', async (req,res) => {
    let userName = req.body.userName
    let password = req.body.password
    let email = req.body.email
    let name = req.body.name
    let rollNo = req.body.rollNo
    let sectionId = req.body.sectionId
    let query = 'Select * from student where username = ?'
    
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[userName])
        if(data.length === 0 || data === undefined){
            let query2 = 'INSERT INTO student (userName, password, name, rollNo, email, sectionId) VALUES (?, ?, ?, ?, ?, ?)'
            try {
                await conn.execute(query2,[userName,password,name,rollNo,email,sectionId])
                res.send('Inserted')
            } catch (error) {
                res.status(400).send(error)
            }
        }else{
            res.status(400).send('Username Taken')
        }
        
    } catch (error) {
        res.status(401).send(error)
    } 
})

//get at risk students
router.post('/getAtRiskStudents',auth, async (req,res) => {
    let query = 'SELECT * FROM student LEFT JOIN studentsection ON student.studentId = studentsection.studentId LEFT JOIN studentsubject ON student.studentId = studentsubject.studentId LEFT JOIN atriskstatus ON student.studentId = atriskstatus.studentId LEFT JOIN section ON studentsection.sectionId = section.sectionId LEFT JOIN subject ON subject.subjectId = studentsubject.subjectId WHERE atRisk IS NOT NULL'
    
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query)
        res.send(data)
    } catch (error) {
        res.status(401).send(error)
    } 
})

//Update a student profile(Admin and lecturer authority)
router.patch('/updateS', async (req,res) => {
    let userName = req.body.userName
    let newUserName = req.body.newUserName
    let password = req.body.password
    let name = req.body.name
    let rollNo = req.body.rollNo
    let email = req.body.email
    let sectionId = req.body.sectionId

    try {
        let conn = await sql.getDBConnection();
        if(newUserName === userName){
            let query = 'UPDATE student SET userName = ?, password = ?, name = ?, rollNo = ?, email = ?, sectionId = ? WHERE student.userName = ?'
            try {
                await conn.execute(query,[userName,password,name,rollNo,email,sectionId,userName])
                res.status(200).send('Updated1')
            } catch (error) {
                res.status(400).send(error)
            }
        }else{
            let query = 'Select * from student where username = ?'
            try {
                let[data,fields] = await conn.execute(query, [newUserName])
                if(data.length === 0 || data.length === undefined){
                    let query2 = 'UPDATE student SET userName = ?, password = ?, name = ?, rollNo = ?, email = ?, sectionId = ? WHERE student.userName = ?'
                    try {
                        await conn.execute(query2,[newUserName,password,name,rollNo,email,sectionId,userName])
                        res.send('Updated2')
                    } catch (error) {
                        res.status(400).send(error)
                    }
                }
                else{
                    res.status(400).send('Username Taken')
                }
            } catch (error) {
                res.status(400).send(error)
            }
        }
    } catch (error) {
        res.status(400).send(error)
    }

})

//Update a student(Restricted Router for students)
router.patch('/restrictedUpdateS', async (req,res) => {
    let userName = req.body.userName
    let password = req.body.password
    let email = req.body.email
    let query = 'UPDATE student SET password = ?, email = ? WHERE student.userName = ?'

    try {
        let conn = await sql.getDBConnection();
        await conn.execute(query,[password,email,userName])
        res.status(200).send('Updated')
    } catch (error) {
        res.status(400).send(error)
    }
})

//Delete Student
router.delete('/deleteS', async (req,res) => {
    let studentId = req.body.studentId
    let query = 'DELETE FROM student WHERE student.studentId = ?'
    try {
        let conn = await sql.getDBConnection();
        await conn.execute(query,[studentId])
        res.status(200).send('Student Deleted')
    } catch (error) {
        res.status(400).send(error)
    }
})


module.exports = router