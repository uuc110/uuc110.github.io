const express = require('express'); 
const app = express(); 
const { Server } = require('socket.io'); 
const http = require('http'); 
const server = http.createServer(app); 
const io = new Server(server); 
const port = 5000;

app.use(express.static('public'));

app.get('*.css', function(req, res) {
    res.type('text/css');
    res.sendFile(req.path, { root: path.join(__dirname, 'public') });
});

app.get('/', (req, res) => { 
    res.sendFile(__dirname + '/public/index.html');
});

app.get('*.css', function(req, res) {
    res.type('text/css');
    res.sendFile(req.path, { root: path.join(__dirname, 'public') });
});



// Store user locations
const userLocations = {};
const usersLocation = {};
const users ={};
const  userType = {};
const  userTypeName = {};
let i=0;
   const locationArr =[]; 
// Socket.io logic
io.on('connection', (socket) => {

    socket.on('new-user-joined', (name, userType)=>{
        console.log("new user : ",name," socket id : ",socket.id);
        users[socket.id] = name;

        if(userType==1){
            userTypeName[socket.id] = "Driver";
            userType[socket.id] = userType;
        }
        if(userType==2){
            userTypeName[socket.id] = "passenger";
            userType[socket.id] = userType;
        }

    });

    socket.on('location',userCoords=>{
        // Store the user's location
        userLocations[socket.id] = userCoords;
        usersLocation[socket.id]=userCoords;
        if(userTypeName[socket.id]=="Driver"){
            locationArr[i] = {lat:userCoords.lat,lng:userCoords.lng,name: users[socket.id],userTypeName: userTypeName[socket.id]};
            i++;
        }

        

        console.log(locationArr);
        io.emit('updateLocations', locationArr );
        if(userTypeName[socket.id]=="Driver"){
            io.emit('new-driver-joined', userCoords ,users[socket.id]);

        }
        if(userTypeName[socket.id]=="passenger"){
            socket.emit('very-new-user-joined',userCoords, users[socket.id]);
        }
        // socket.broadcast.emit('user-joined',sendloc); 
          socket.emit('user-joined',userCoords); 
        console.log(locationArr)
    })


    socket.on('send message', (chat) => { 
        io.emit('send message', (chat)); 
    }); 
    socket.on('send name', (username) => { 
        io.emit('send name', (username)); 
    }); 



  socket.on('disconnect', () => {
    // Remove the user's location when they disconnect
    delete userLocations[socket.id];
  });
});

server.listen(port, () => { 
    console.log(`Server is listening at the port: ${port}`); 
});

