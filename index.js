var express = require('express');
var app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');
let db;

app.set('view engine', 'ejs');

initDB();

//public
app.use(express.static(__dirname + '/public'));

// index page
app.get('/', async (req, res) => {
  res.render('pages/index', {db: db});
});

//Everything else render pages/404
app.get('*', function(req, res){
    res.render('pages/404');
});

io.on('connection', (socket) => {
    // console.log(`User ${socket.id} connected`);
    // socket.on('disconnect', () => {
    //     console.log(`User ${socket.id} disconnected`);
    // });
    socket.on('start', (machine, time) => {
        // console.log(`User started ${machine} at ${time}`);
        db[machine].isActive = true;
        db[machine].timeStarted = time;
        updateDB(machine);
        io.emit("start", machine, time);
    });
    socket.on('stop', (machine, time) => {
        // console.log(`User stopped ${machine} at ${time}`);
        // update db
        db[machine].isActive = false;
        db[machine].timeStarted = null;
        updateDB(machine);
        io.emit('stop', machine);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});


async function initDB() {
    const empty_db = {
        washingMachine1: {
            isActive: false,
            timeStarted: 0
        },
        washingMachine2: {
            isActive: true,
            timeStarted: 0
        },
        dryer: {
            isActive: false,
            timeStarted: 0
        }
    };

    if (!fs.existsSync('./db.json')) {
        fs.writeFileSync('./db.json', JSON.stringify(empty_db));
        db = empty_db;
    } else {
        db = JSON.parse(fs.readFileSync('./db.json'));
    }
}

async function updateDB(machine) {
    fs.writeFileSync('./db.json', JSON.stringify(db));

}