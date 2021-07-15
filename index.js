const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const axios = require('axios')
const formidable = require('express-formidable');
const FormData = require('form-data');

app.use(cors())
app.use(formidable());

app.post('/users/login', (req, res) => {
    const { login, password } = req.fields;

    const body = new FormData();
    body.append('login', login);
    body.append('password', password);

    axios({
        method: "post",
        url: "https://peer.basf.science/users/login",
        body,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then(function (response) {
            res.send(response)
        })
        .catch(function (response) {
            res.send(response)
        });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
