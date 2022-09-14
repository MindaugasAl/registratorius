import express from 'express'
import { engine } from 'express-handlebars';
import fs from 'fs/promises'

const app = express();
const file = './duomenys.json'

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use('/public', express.static('public'))
app.use(express.urlencoded({
    extended: true
}))

app.get('/', (req, res) => {
    const options = {}

    if (req.query.status === '1') {
        options.message = 'Vartotojas sėkmingai užregistruotas, prašome prisijungti'
        options.status = 'success'
    }
    res.render('login', options);
});

app.post('/', (req, res)=> {
    if (req.body.email === '' || req.body.password === '')
return res.render('login', {message: 'Neįvesti prisijungimo duomenys', status: 'danger'})
})

app.get('/register', async (req, res) => {
    if (
        JSON.stringify(req.query) !== '{}' &&
        req.query.name !== '' &&
        req.query.email !== '' &&
        req.query.password !== '') {

        try {
            let data = await fs.readFile(file, 'utf8');
            data = JSON.parse(data)
            if (data.find(user => user.email === req.query.email)) {
                return res.render('register', { message: 'Toks el., paštas jau registruotas', status: 'danger' })
            }
            data.push(req.query)
            await fs.writeFile(file, JSON.stringify(data, null, 4))
            // return res.render('register', { message: 'Vartotojas sėkmingai užregistruotas <a href="/">prisijunkite</a>', status: 'success' })
            return res.redirect("/?status=1")
        } catch {
            await fs.writeFile(file, JSON.stringify([req.query], null, 4))
        }

    } else {
        return res.render('register', { message: 'Prašome užsiregitruoti', status: 'danger' })

    }
    res.render('register')
})



app.listen(3000);