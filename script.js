const screenWidth = document.documentElement.clientWidth;
const screenHeight = document.documentElement.clientHeight;

const maxPoints = 100;
const border = 200;

const X = 0;
const Y = 1;

const SPEED = 0.1;

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function wrap(value, min, max){
	if(value > max) return value - max;
	if(value < min) return value + max;
	return value;
}


function normalise(arr) {
	const xVec = arr[0];
	const yVec = arr[1];
	
	const magnitude = Math.sqrt((xVec * xVec) + (yVec * yVec));
	let xNormal = xVec;
	let yNormal = yVec;
	
	if(magnitude > 0){
		xNormal = xVec / magnitude;
		yNormal = yVec / magnitude;
	}
	
	return [xNormal, yNormal];
}



// --- Geometry helpers ---
function circumcircle(tri) {
	const [ax, ay] = tri[0];
	const [bx, by] = tri[1];
	const [cx, cy] = tri[2];

	const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
	if (d === 0) return {x: 0, y: 0, r: -1}; // degenerate

	const ux = ((ax*ax + ay*ay) * (by - cy) +
				(bx*bx + by*by) * (cy - ay) +
				(cx*cx + cy*cy) * (ay - by)) / d;

	const uy = ((ax*ax + ay*ay) * (cx - bx) +
				(bx*bx + by*by) * (ax - cx) +
				(cx*cx + cy*cy) * (bx - ax)) / d;

	const dx = ax - ux, dy = ay - uy;
	return {x: ux, y: uy, r: Math.sqrt(dx*dx + dy*dy)};
	}

	function inCircle(p, circle) {
	if (circle.r < 0) return false;
	const dx = p[0] - circle.x;
	const dy = p[1] - circle.y;
	return dx*dx + dy*dy <= circle.r * circle.r;
	}

	function edgeEqual(e1, e2) {
	return (e1[0][0] === e2[0][0] && e1[0][1] === e2[0][1] &&
			e1[1][0] === e2[1][0] && e1[1][1] === e2[1][1]) ||
			(e1[0][0] === e2[1][0] && e1[0][1] === e2[1][1] &&
			e1[1][0] === e2[0][0] && e1[1][1] === e2[0][1]);
	}

	// --- Main Bowyer-Watson ---
	function delaunay(points) {
	// Super-triangle (big enough to contain all points)
	let minX = Math.min(...points.map(p => p[0]));
	let minY = Math.min(...points.map(p => p[1]));
	let maxX = Math.max(...points.map(p => p[0]));
	let maxY = Math.max(...points.map(p => p[1]));
	const dx = maxX - minX;
	const dy = maxY - minY;
	const deltaMax = Math.max(dx, dy) * 10;

	const p1 = [minX - deltaMax, minY - deltaMax];
	const p2 = [minX + dx/2, maxY + deltaMax];
	const p3 = [maxX + deltaMax, minY - deltaMax];

	let triangles = [[[p1[0], p1[1]], [p2[0], p2[1]], [p3[0], p3[1]]]];

	// Insert points one by one
	for (let p of points) {
		let badTris = [];
		for (let t of triangles) {
		if (inCircle(p, circumcircle(t))) {
			badTris.push(t);
		}
		}

		// Find the polygon hole boundary (unique edges)
		let polygon = [];
		for (let bt of badTris) {
		for (let i = 0; i < 3; i++) {
			const edge = [bt[i], bt[(i+1)%3]];
			let shared = false;
			for (let bt2 of badTris) {
			if (bt2 === bt) continue;
			for (let j = 0; j < 3; j++) {
				const edge2 = [bt2[j], bt2[(j+1)%3]];
				if (edgeEqual(edge, edge2)) shared = true;
			}
			}
			if (!shared) polygon.push(edge);
		}
		}

		// Remove bad triangles
		triangles = triangles.filter(t => !badTris.includes(t));

		// Re-triangulate the hole with new point
		for (let e of polygon) {
		triangles.push([e[0], e[1], p]);
		}
	}

	// Remove triangles that contain super-triangle vertices
	triangles = triangles.filter(t => 
		!t.some(v => (v[0] === p1[0] && v[1] === p1[1]) ||
					(v[0] === p2[0] && v[1] === p2[1]) ||
					(v[0] === p3[0] && v[1] === p3[1]))
	);

	return triangles;
}

  

/**
 * Wraps a number from min to max
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function wrapNumber(value, min, max){
	if(max < value) value -= max;
	if(min > value) value += max
	
	return value;
}



/**
 * Draw a filled circled at a given point
 * @param {number[]} point
 * @param {number} radius
 */
function drawCircle(point){
	const radius = 4;
	ctx.lineWidth = 2;
	ctx.lineCap = "round";
	ctx.strokeStyle = "black";
	ctx.fillStyle = "white";
	
	ctx.beginPath();
	ctx.arc(point[X], point[Y], radius, 0, 2 * Math.PI);
	ctx.fill();
	ctx.stroke();
}


/**
 * Draws a line from p1 to p2
 * @param {number[]} p1
 * @param {number[]} p2
*/
function drawLine(p1, p2){
	ctx.lineWidth = 2;
	ctx.lineCap = "round";
	ctx.strokeStyle = "black";
	
	
	ctx.beginPath();
	ctx.moveTo(p1[X], p1[Y]);
	ctx.lineTo(p2[X], p2[Y]);
	ctx.stroke();
}


/**
 * Generate a random int from min to max
 *
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}


/**
 * @param {number} time
 * @return {Promise<void>}
 */
async function sleep(time){
	return new Promise(resolve => setTimeout(resolve, time));
}

/**
 * @typedef {Object} Point
 * @property {number[]} pos
 * @property {number[]} vec
 **/



async function main(){
	const body = document.querySelector("body")
	const bodyHeight = body.clientHeight;
	const bodyWidth = body.clientWidth;

	canvas.height = bodyHeight;
	canvas.width = bodyWidth;
	
	/** @type {Point[]} */
	const points = [];

	
	ctx.lineWidth = 1;
	ctx.lineCap = "round";
	ctx.strokeStyle = "white";
	
	
	const topLeft = { pos: [-border, -border], vec: [0, 0] };
	const topMiddle = { pos: [bodyWidth / 2, -border], vec: [0, 0] };
	const topRight = { pos: [bodyWidth + border, -border], vec: [0, 0] };
	
	const middleLeft = { pos: [-border, bodyHeight / 2], vec: [0, 0] };
	const middleRight = { pos: [bodyWidth + border, bodyHeight / 2], vec: [0, 0] };
	
	const bottomLeft = { pos: [-border, -border], vec: [0, 0] };
	const bottomMiddle = { pos: [bodyWidth / 2, -border], vec: [0, 0] };
	const bottomRight = { pos: [bodyWidth + border, bodyHeight + border], vec: [0, 0] };
	
	points.push(topLeft, topMiddle, topRight, middleLeft, middleRight, bottomLeft, bottomMiddle, bottomRight);
	
	const min = [-border, -border];
	const max = [bodyWidth + border, bodyHeight + border];
	
	for(let i = 0; i < maxPoints; i++){
		const xPos = randomInt(min[X], max[X]);
		const yPos = randomInt(min[Y], max[Y]);
		
		const xVel = randomInt(-1, 1);
		const yVel = randomInt(-1, 1);
		
		const normalised = normalise([xVel, yVel]);
		const point = { pos: [xPos, yPos], vec: normalised };
		
		points.push(point);
	}
	
	// console.log(points)
	// const triangles = delaunay([...points.map(x => x.pos)]);
	// console.log(triangles)
	
	setInterval(() => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// const point = points[16];
		// console.log(point.pos[X]);
		// console.log(wrap(point.pos[X] + point.vec[X], -border, bodyWidth + border));
	
		for(const point of points){
			if(isNaN(point.pos[X])) throw `number is NaN - point.Number`;
			
			const newX = point.pos[X] + (point.vec[X] * SPEED);
			const newY = point.pos[Y] + (point.vec[Y] * SPEED);
			point.pos[X] = wrap(newX, topLeft[X], bottomRight[X]);
			point.pos[Y] = wrap(newY, topLeft[Y], bottomRight[Y]);
		}
	
	
		const tri = delaunay([...points.map(x => x.pos)]);
		// console.log(tri)
		for(const triangle of tri){
			drawLine(triangle[0], triangle[1]);
			drawLine(triangle[1], triangle[2]);
			drawLine(triangle[0], triangle[2]);
		}
		
		for(const point of points){
			drawCircle(point.pos);
		}
		
	}, 16);
}

main();