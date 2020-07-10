//initialize variables for canvas and jsdataframe for dealing with data about objects
var canvas = document.getElementById("simulation");
var ctx = canvas.getContext("2d");

window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}; 

//define variables for state
var state = {
    drag: false,
    dragStart: {x: 0, y: 0},
    dragEnd: {x: 0, y: 0},
    mouse: {x: 0, y: 0},
    coords: {x: 0, y: 0},
    ra: {raw: 0, hour: 0, arcmin: 0, arcsec: 0},
    d: {raw: 0, deg: 0, arcmin: 0, arcsec: 0},
    showObj: false,
    objNum: 0
}

//initialize the image
var img = new Image();
img.src = '../images/betterstarmap.png';
img.onload = function(){
    ctx.drawImage(img, state.coords.x, state.coords.y);
};
var objectImages = {};
function addImage(object) {
    var newImage = new Image(100, 100);
    newImage.url = object.imgLink;
    objectImages[object.objName] = newImage;
};
objects.forEach(addImage);

function clear() {
    // Store the current transformation matrix
    ctx.save();
    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Restore the transform
    ctx.restore();
}

function drawObject(object) {
    //draw the object

    //draw rectangle behind image
    ctx.beginPath();
    //set style:
    ctx.lineWidth = "0";
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    //draw rectangle
    ctx.rect(20, canvas.height - 340, 220, 320);
    ctx.fill();

    ctx.drawImage(objectImages[object.objName], 30, canvas.height - 330);
}    
function drawDots(object) {
    ctx.beginPath();
    ctx.linewidth = "0";
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.arc(object.x + state.coords.x, object.y + state.coords.y, 10, 0, 2 * Math.PI);
    ctx.fill();

    ctx.font = "15px Arial";
    ctx.fillText(object.objName, object.x + state.coords.x + 20, object.y + state.coords.y + 10);
};

function draw() {
    clear();
    ctx.drawImage(img, state.coords.x, state.coords.y);

    //draw circles and names
    objects.forEach(drawDots);

    //draw rectangle behind words:
    ctx.beginPath();
    //set style:
    ctx.lineWidth = "0";
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    //draw rectangle
    ctx.rect(0, 0, 500, 100);
    ctx.fill();

    //draw words
    ctx.font = "20px Arial";
    ctx.fillStyle = "rgb(100,100,200)";
    ctx.fillText("Right Ascension: " + state.ra.hour + "hours " + state.ra.arcmin + "arcmins " + state.ra.arcsec + "arcsecs", 10, 30);
    ctx.fillText("Declination: " + state.d.deg + "degs " + state.d.arcmin + "arcmins " + state.d.arcsec + "arcsecs", 10, 65);

    //draw an object if it says too
    if(state.showObj) {
	drawObject(state.objNum);
	console.log(state.showObj);
    }
};

//when mouse is pressed, store coordinates and set move variable to true so it moves
canvas.addEventListener('mousedown', function(event) {
    state.mouse = {
        x: event.pageX - canvas.offsetLeft,
        y: event.pageY - canvas.offsetTop
    }
    state.dragStart = state.mouse;
    state.drag = true;

})

//when mouse is released, stop moving around the image
canvas.addEventListener('mouseup', function(event) {
    state.drag = false;
})

canvas.addEventListener('mousemove', function(event) {
    state.mouse = {
        x: event.pageX - canvas.offsetLeft,
        y: event.pageY - canvas.offsetTop
    };
    //calculate raw ra and d values:
    state.ra.raw = (2591 - (state.mouse.x - state.coords.x))/107.96;
    state.d.raw = -(state.mouse.y- state.coords.y)/7.117 + 90;
    //change into degs, mins, and secs
    state.ra.hour = Math.floor(state.ra.raw);
    state.d.deg = Math.floor(state.d.raw);
    state.ra.arcmin = Math.floor((state.ra.raw % 1)*60);
    state.d.arcmin = Math.floor((state.d.raw % 1)*60);
    state.ra.arcsec = Math.floor((state.ra.raw % 0.01666)*60*60);
    state.d.arcsec = Math.floor((state.d.raw % 0.01666)*60*60);

    if (state.drag) {
        state.dragEnd = state.mouse;
        state.coords = {
            x: Math.min(Math.max(state.coords.x + (state.dragEnd.x - state.dragStart.x), canvas.width - img.width), 0),
            y: Math.min(Math.max(state.coords.y + (state.dragEnd.y - state.dragStart.y),  canvas.height - img.height), 0)
        };

        state.dragStart = state.dragEnd;
    }
    draw();
})

function collisions(item, index) {
    if(item.x + 20 + state.coords.x > state.mouse.x && item.x - 20 +state.coords.x< state.mouse.x && item.y + 20 + state.coords.y> state.mouse.y && item.y - 20 + state.coords.y < state.mouse.y) {
	if(state.objNum = index) {
	    //if the variable is already set, toggle whether to show it or not
	    state.showObj = !state.showObj;
	} else {
	    state.showObj = true;
	    state.objNum = index;
	}
    }
}

canvas.addEventListener('click', function(event) {
    objects.forEach(collisions);
    //after figuring out which one to draw, draw the selected one if it says to
    if(state.showObj) {
	draw();
    }
});
	
window.addEventListener('resize', resizeCanvas, false);

resizeCanvas();
draw();
