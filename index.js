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


app.post('/', async (req, res) => {
    if (req.body.email === '' || req.body.password === '')
        return res.render('login', { message: 'Neįvesti prisijungimo duomenys', status: 'danger' })

    try {
        const data = await fs.readFile(file, 'utf8')
        if (!JSON.parse(data).find(user => user.email === req.body.email && user.password === req.body.password))
            return res.render('login', { message: 'Neteisingi prisijungimo duomenys', status: 'danger' })

        return res.redirect('/admin')
    } catch {
        return res.render('login', { message: 'Duomenų bazės failas nerastas', status: 'danger' })
    }

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

app.get('/admin', async (req, res) => {

    const data = await fs.readFile(file, 'utf8')
    const users = JSON.parse(data)
    const options = { users }
    if (req.query.success == 1){
        options.message = 'Duomenys sėkmingai ištrinti'
        options.status = 'success'
    }
    if(req.query.success == 0){
        options.message = 'Nepavyko ištrinti duomenų'
        options.status = 'danger'
    }
    res.render('admin',  options)
})

app.get('/delete/:id', async (req, res) => {
    try {
        const data = await fs.readFile(file, 'utf8')
        let users = JSON.parse(data)
        users = users.filter((user, index) => index != req.params.id)
        await fs.writeFile(file, JSON.stringify(users, null, 4))
        res.redirect('/admin?success=1')
    } catch {
        res.redirect('/admin?success=0')
    }
})

app.listen(3000);