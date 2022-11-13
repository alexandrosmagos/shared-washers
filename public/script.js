const washSpeed = 600; // If changed, need to be updated in the CSS as well
const screen = document.getElementsByClassName('controls');
const controller = document.getElementsByClassName('power');
var socket = io();

socket.on('connect', function() {
    console.log('connected');
});

socket.on('start', (machineID, time) => {
  const machine = document.getElementById(machineID);
  console.log(`User started ${machineID} at ${time}`);
  db[machineID].isActive = true;
  db[machineID].timeStarted = time;
  startMachine(machine);
});

socket.on('stop', (machineID, time) => {
  const machine = document.getElementById(machineID);
  console.log(`User stopped ${machineID} at ${time}`);
  stopMachine(machine)
});



for (let i = 0; i < controller.length; i++) {
  const btn = document.getElementById(controller[i].id)
  const machine = document.getElementById(Object.keys(db)[i]);

  if (db[Object.keys(db)[i]].isActive) startMachine(machine);

  //Buttons START/STOP
  btn.addEventListener("click", function (event) {
    btn.disabled = true;
    setTimeout(() => {
      btn.disabled = false;
    }, 1000);
    
    if (!db[machine.id].isActive) {
      socket.emit('start', machine.id, new Date().getTime());
    } else {
      socket.emit('stop', machine.id);
    }
  })
}

function startMachine(machine) {
  machine.classList.add("isWashing");
  machine.classList.add("isStarting");
  machine.classList.add("isFilled");
  setTimeout(() => {
    machine.classList.remove("isStarting");
  }, washSpeed * 2);
  db[machine.id].isActive = true;
  updateMachine(machine);
}

function stopMachine(machine){
  machine.classList.remove("isWashing");
  machine.classList.remove("isFilled");
  db[machine.id].isActive = false;
  updateMachine(machine);
}


function updateMachine(machine) {
  const btn = document.getElementById(machine.id).parentNode.childNodes[3].childNodes[1];
  btn.innerHTML = db[machine.id].isActive ? "STOP" : "START";

  const controls = document.getElementById(machine.childNodes[1].id);

  const time = db[machine.id].isActive ? (new Date().getTime() - db[machine.id].timeStarted) / 1000 : 0;
  const timePassed = time < 3600 ? new Date(time * 1000).toISOString().substr(14, 5) : new Date(time * 1000).toISOString().substr(11, 8);

  if (db[machine.id].isActive) {
    controls.innerHTML = timePassed;
    setTimeout(() => {
      updateMachine(machine);
    }, 1000);
  } else {
    controls.innerHTML = "READY";
  }
}