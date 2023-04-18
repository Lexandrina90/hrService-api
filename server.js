const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//открываем соединение с базой данных
const db = new sqlite3.Database('./employees.db',(err) => {
  if (err) {
    console.log(err.message);
  }
  console.log('Соединение с базой данных успешно установлено.')
})

//создаем таблицу employees
db.run(`CREATE TABLE IF NOT EXISTS employees(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fio TEXT,
  gender TEXT,
  birthDate TEXT,
  position TEXT,
  grade TEXT ,
  education TEXT,
  startDate TEXT
)`);

// Обработчик POST-запроса на /api/employees
app.post('/api/employees', async (req,res) => {
  const {fio, gender,birthDate, position, grade, education, startDate} = req.body ;

  //Вставляем новую запись в таблицу employees
  const sql = `INSERT INTO employees (fio, gender,birthDate, position, grade, education, startDate)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
   db.run(sql, [fio,gender,birthDate,position,grade,education,startDate], function (err){
    if (err) {
      console.error(err.message);
      res.status(500).send(err.message);
    } else {
      //Отправляем ответ клиенту с ID новой записи
      res.json({id: this.lastID});
    }
   })            
})

//обработчик GET-запроса на /api/employees c указанным ID
app.get('/api/employees/:id', async (req,res) => {
  const {id} = req.params;

  //получаем запись из таблицы employees с указанным ID
  const sql = `SELECT * FROM employees WHERE id = ?`;
  db.get(sql,[id], (err,row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send(err.message)
    } else if (!row) {
      res.status(404).send('Запись не найдена');
    } else {
      res.json(row);
    }
  })
})

//Обработчик GET-запроса на /api/employees
app.get('/api/employees', async (req,res) => {
  //Получаем все записи из таблицы employees
  const sql = `SELECT * FROM employees`;
  db.all(sql,[],(err,rows) => {
    if(err) {
      console.error(err.message);
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  })
})

//Обработчик PUT-запроса на /api/employees/:id
app.put('/api/employees/:id', async (req,res) => {
  const {id} = req.params;
  const {fio, gender,birthDate, position, grade, education, startDate} =req.body;

  //Обновляем запись в таблице employees с указанным ID
  const sql = `UPDATE employees SET fio = ?, gender = ?,birthDate = ?, position = ?, grade = ?, education = ?, startDate = ? WHERE id = ?`;
  db.run(sql, [fio, gender,birthDate, position, grade, education, startDate,id], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send(err.message);
    } else {
      res.json({id: parseInt(id)});
    }
  })
})

//Обработчик DELETE-запроса на /api/employees/:id
app.delete('/api/employees/:id', async (req,res) => {
  const {id} = req.params;

  //удаляем запись из таблицы employees с указанным ID
  const sql = `DELETE FROM employees WHERE id = ?`;
  db.run(sql,[id],(err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send(err.message);
    } else {
      res.json({id:parseInt(id)})
    }
  })
})

//Запускаем сервер на указанном порту 
app.listen(port,'localhost', () => {
  console.log(`Сервер запущен на порту ${port}`);
})
