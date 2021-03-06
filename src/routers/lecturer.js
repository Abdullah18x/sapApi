const express = require('express');
const sql = require('../config/mysqlConfig')
const token = require('../methods/generateToken')
const auth = require('../middleware/lecturerAuth')
const auth2 = require('../middleware/adminAuth')

const router = new express.Router()

//Login
router.post('/login', async (req,res) => {
    let userName = req.body.userName
    let password = req.body.password
    let query = 'Select * from lecturer where userName = ? and password = ?'

    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[userName,password])

        if(data.length === 0 || data === undefined){
            res.status(400).send('Invalid login')
        }
        let getToken = await token.generateToken(data[0].lecturerId,2,data[0].userName)
        let data2 = {...data[0], token: getToken}
        res.send(data2)

    } catch (error) {
        res.status(400).send(error)
    }
})

//Fetch All
router.post('/fetchLecturers', auth2, async (req,res) => {
    let query = 'Select * from lecturer '
     try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query)
        res.send(data)

    } catch (error) {
        res.status(400).send('error fetching Lecturers')
    }
})


//Fetch Lecturer
router.post('/fetchLecturer', auth, async (req,res) => {
    let lecturerId = req.body.lecturerId 
    let query = 'Select * from lecturer where lecturerId = ?'
     try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[lecturerId])
        res.send(data)

    } catch (error) {
        res.status(400).send('error fetching Admin')
    }
})

//Admin fetch Lecturer
router.post('/adminFetchLecturer', auth2, async (req,res) => {
    let lecturerId = req.body.lecturerId 
    let query = 'Select * from lecturer where lecturerId = ?'
     try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[lecturerId])
        res.send(data)

    } catch (error) {
        res.status(400).send('error fetching Admin')
    }
})

//Admin fetch Lecturer by userName
router.post('/adminFetchLecturerUserName', auth2, async (req,res) => {
    let userName = req.body.userName 
    let query = 'Select * from lecturer where userName = ?'
     try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[userName])
        res.send(data)

    } catch (error) {
        res.status(400).send('error fetching Admin')
    }
})

//Add Lecturer
router.post('/addL', auth2, async (req,res) => {
    let userName = req.body.userName
    let password = req.body.password
    let email = req.body.email
    let name = req.body.name
    let status = req.body.status
    let query = 'Select * from lecturer where username = ?'
    
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] = await conn.execute(query,[userName])
        if(data.length === 0 || data === undefined){
            let query2 = 'INSERT INTO lecturer (userName, password, email, name, status) VALUES (?, ?, ?, ?, ?)'
            try {
                await conn.execute(query2,[userName,password,email,name,status])
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

//Update Lecturer
router.patch('/updateL', async (req,res) => {
    let userName = req.body.userName
    let newUserName = req.body.newUserName
    let email = req.body.email
    let password = req.body.password
    let name = req.body.name
    try {
        let conn = await sql.getDBConnection();
        if(newUserName === userName){
            let query = 'UPDATE lecturer SET userName = ?, password = ?, email = ?, name = ? WHERE lecturer.userName = ?'
            try {
                await conn.execute(query,[userName,password,email,name,userName])
                res.status(200).send('Updated1')
            } catch (error) {
                res.status(400).send(error)
            }
        }else{
            let query = 'Select * from lecturer where username = ?'
            try {
                let[data,fields] = await conn.execute(query, [newUserName])
                if(data.length === 0 || data.length === undefined){
                    let query2 = 'UPDATE lecturer SET userName = ?, password = ?, email = ?, name = ? WHERE lecturer.userName = ?'
                    try {
                        await conn.execute(query2,[newUserName,password,email,name,userName])
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

//update Lecturer Status
router.patch('/updateLecturerStatus', auth2, async (req,res) =>{
    let userName = req.body.userName
    let status = req.body.status
    let query = 'UPDATE lecturer SET status = ? WHERE lecturer.userName = ?'
    try {
        let conn = await sql.getDBConnection();
        await conn.execute(query,[status,userName])
        res.status(200).send('Updated Status')
    } catch (error) {
        res.status(400).send('Failed to update')
    }
})

//Assign a Lecturer
router.post('/assignLecturer', async (req,res) => {
    let lecturerId = req.body.lecturerId
    let subjectId = req.body.subjectId
    let sectionId = req.body.sectionId
    let programmingLanguageId = req.body.programmingLanguageId
    let testQuery = 'SELECT * FROM lecturerassigned WHERE lecturerId = ? AND subjectId = ? AND sectionId = ?'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] =  await conn.execute(testQuery,[lecturerId,subjectId,sectionId])
        if(data.length === 0 || data === undefined){
            let query = 'INSERT INTO lecturerassigned ( lecturerId, subjectId, sectionId, programmingLanguageId) VALUES (?, ?, ?, ?)'
            let query2 = 'UPDATE lecturer SET status = 1 WHERE lecturer.lecturerId = ?'
            
            try {
                let conn = await sql.getDBConnection();
                await conn.execute(query,[lecturerId,subjectId,sectionId,programmingLanguageId])
                await conn.execute(query2,[lecturerId])
                res.status(200).send('Updated Status')
            } catch (error) {
                res.status(400).send(error)
            }
        }else{
            res.status(400).send('Lecturer already assigned to the section for specific subject')
        }
    } catch (error) {
        res.status(400).send()
    }  
})

router.post('/unAssignLecturer', auth2, async (req,res) => {
    let lecturerId = req.body.lecturerId
    let sectionId = req.body.sectionId
    let subjectId = req.body.subjectId
    let query = 'DELETE FROM lecturerassigned WHERE lecturerId = ? AND sectionId = ? AND subjectId = ?'
    let query2 = 'SELECT * FROM lecturerassigned WHERE lecturerId = ?'
    let query3 = 'UPDATE lecturer SET status = 0 WHERE lecturerId = ?'
    try {
        let conn = await sql.getDBConnection();
        await conn.execute(query,[lecturerId,sectionId,subjectId])
        let [data,fields] =  await conn.execute(query2,[lecturerId])
        if (!data.length) {
            await conn.execute(query3,[lecturerId])
        }
        res.send('Unassigned')
    } catch (error) {
        res.send(error)
    }
})

router.post('/getAssignedSections', auth2, async (req,res) => {
    let lecturerId = req.body.lecturerId
    let query = 'SELECT section.sectionId, section, COUNT(DISTINCT stdSubjectId) subjectStudents, subject, subject.subjectId FROM `lecturerassigned` LEFT JOIN lecturer ON lecturerassigned.lecturerId = lecturer.lecturerId LEFT JOIN subject ON lecturerassigned.subjectId = subject.subjectId LEFT JOIN section ON section.sectionId = lecturerassigned.sectionId LEFT JOIN studentsection ON studentsection.sectionId = section.sectionId LEFT JOIN studentsubject ON studentsubject.studentId = studentsection.studentId AND studentsubject.subjectId = lecturerassigned.subjectId WHERE lecturerassigned.lecturerId = ? GROUP BY section.sectionId'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] =  await conn.execute(query,[lecturerId])
        res.send(data)
    } catch (error) {
        res.send(error)
    }
})

router.post('/getLecturerSectionList', auth, async (req,res) => {
    let lecturerId = req.body.lecturerId
    let query = 'SELECT section.sectionId, section FROM lecturerassigned INNER JOIN section ON lecturerassigned.sectionId = section.sectionId WHERE lecturerassigned.lecturerId = ?'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] =  await conn.execute(query,[lecturerId])
        res.send(data)
    } catch (error) {
        res.send(error)
    }
})

router.post('/getSectionSubjectList', auth, async (req,res) => {
    let lecturerId = req.body.lecturerId
    let sectionId = req.body.sectionId
    let query = 'SELECT lecturerassigned.subjectId, subject FROM lecturerassigned INNER JOIN subject ON lecturerassigned.subjectId = subject.subjectId WHERE lecturerassigned.lecturerId = ? AND lecturerassigned.sectionId = ?'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] =  await conn.execute(query,[lecturerId,sectionId])
        res.send(data)
    } catch (error) {
        res.send(error)
    }
})

router.post('/getLectrerStatus', auth, async (req,res) => {
    let lecturerId = req.body.lecturerId
    let query = 'SELECT status FROM lecturer WHERE lecturerId = ?'
    try {
        let conn = await sql.getDBConnection();
        let [data,fields] =  await conn.execute(query,[lecturerId])
        res.send(data)
    } catch (error) {
        res.send(error)
    }
})

//Delete a Lecturer
router.delete('/deleteL', async (req,res) => {
    let lecturerId = req.body.lecturerId
    let query = 'DELETE FROM lecturerassigned WHERE lecturerassigned.lecturerId = ?'
    let query2 = 'DELETE FROM lecturer WHERE lecturer.lecturerId = ?'
    try {
        let conn = await sql.getDBConnection();
        await conn.execute(query,[lecturerId])
        await conn.execute(query2,[lecturerId])
        res.status(200).send('Lecturer Deleted')
    } catch (error) {
        res.status(400).send(error)
    }
})


module.exports = router