import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import googleAuth from 'google-auth-library'
const app = express();
dotenv.config
// Google auth
const { OAuth2Client } = googleAuth;
const CLIENT_ID = '536952253095-cd2v6nr47eb2lq0f8oam78gi3jo2qs54.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);

// Middleware
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser())
app.get('/', (req, res) => {
    res.render('index')
})
app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    let token = req.body.token
    console.log(token);
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        console.log(payload);
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
    }
    verify()
        .then(() => {
            res.cookie('session-token', token);
            res.send("succcess")
        })
        .catch(console.error);
})
//ckeck tocken 
function checkAuthenticated(req,res,next){
    let token = req.cookies['session-token'];
    let user={};
    async function verify(){
        const ticket = await client.verifyIdToken({
            idToken:token,
            audience:CLIENT_ID,
        });
        const payload = ticket.getPayload();
        user.name = payload.name,
        user.email = payload.email,
        user.picture = payload.picture
    }
    verify().then(()=>{
        req.user = user;
        next()
    }).catch(err=>{
        res.redirect('/login')
    })
}
app.get('/dashboard',checkAuthenticated, (req, res) => {
    let user = req.user;
    res.render('dashboard', { user })
})
app.get('/logout',(req,res)=>{
    res.clearCookie('session-token');
    res.redirect('/login')
})
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})