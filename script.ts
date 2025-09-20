const screenWidth = document.documentElement.clientWidth;
const screenHeight = document.documentElement.clientHeight;

const maxPoints = 100;
const border = 200;

const X = 0;
const Y = 1;

const SPEED = 0.05;

/* Green */
const TOP_LEFT_COLOR = "#B8FFBF";
const BOT_RIGHT_COLOR = "#004707";

/* Hot Pink -> Purple */
// const TOP_LEFT_COLOR = "#ff3f81";
// const BOT_RIGHT_COLOR = "#23153c";

/* Blue */
// const TOP_LEFT_COLOR = "#B3E9FF";
// const BOT_RIGHT_COLOR = "#0075A3";

/* Red */
// const TOP_LEFT_COLOR = "#FFB3B3";
// const BOT_RIGHT_COLOR = "#A30000";

/* Yellow */
// const TOP_LEFT_COLOR = "#FFF2B3";
// const BOT_RIGHT_COLOR = "#A38800";

const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

type Vector = [number, number];

interface Point {
	pos: Vector;
	vec: Vector;
	id: number;
}

type Edge = [Point, Point]
type Triangle = [Point, Point, Point];

type HEXColorString = `#${string}`
type RGBColorString = `rgb(${number}, ${number}, ${number})`

interface Circle {
	x: number,
	y: number,
	r: number
}


/**
 * Creates a circle in the center of the given 3 points
 *
 * @param {Triangle} triangle
 * @return {Circle}
 */
function circumCircle(triangle: Triangle): Circle {
	const [ax, ay] = triangle[0].pos;
	const [bx, by] = triangle[1].pos;
	const [cx, cy] = triangle[2].pos;

	const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
	if(d === 0) return { x: 0, y: 0, r: -1 }; // degenerate

	const ux = ((ax * ax + ay * ay) * (by - cy) +
				(bx * bx + by * by) * (cy - ay) +
				(cx * cx + cy * cy) * (ay - by)) / d;

	const uy = ((ax * ax + ay * ay) * (cx - bx) +
				(bx * bx + by * by) * (ax - cx) +
				(cx * cx + cy * cy) * (bx - ax)) / d;

	const dx = ax - ux, dy = ay - uy;
	return { x: ux, y: uy, r: Math.sqrt(dx * dx + dy * dy) };
}


/**
 * Checks if a point lies within a circle
 *
 * @param {Point} point
 * @param {Circle} circle
 * @return {boolean}
 */
function inCircle(point: Point, circle: Circle){
	if(circle.r < 0) return false;
	const dx = point.pos[X] - circle.x;
	const dy = point.pos[Y] - circle.y;
	return dx * dx + dy * dy <= circle.r * circle.r;
}


/**
 * Checks if an edge is equal to another
 *
 * @param {Edge} e1
 * @param {Edge} e2
 * @return {boolean}
 */
function edgeEqual(e1: Edge, e2: Edge): boolean {
	return (e1[0].pos[X] === e2[0].pos[X] &&
		e1[0].pos[Y] === e2[0].pos[Y] &&
		e1[1].pos[X] === e2[1].pos[X] &&
		e1[1].pos[Y] === e2[1].pos[Y]) || (e1[0].pos[X] === e2[1].pos[X] &&
		e1[0].pos[Y] === e2[1].pos[Y] &&
		e1[1].pos[X] === e2[0].pos[X] &&
		e1[1].pos[Y] === e2[0].pos[Y]);
}


/**
 * Bowyer-Watson
 *
 * @param {Point[]} points
 * @return {*}
 */
function delaunay(points: Point[]): Triangle[] {
	// Super-triangle (big enough to contain all points)
	const minX = Math.min(...points.map(p => p.pos[X]));
	const minY = Math.min(...points.map(p => p.pos[Y]));
	const maxX = Math.max(...points.map(p => p.pos[X]));
	const maxY = Math.max(...points.map(p => p.pos[Y]));
	const dx = maxX - minX;
	const dy = maxY - minY;
	const deltaMax = Math.max(dx, dy) * 10;

	const p1: Vector = [minX - deltaMax, minY - deltaMax];
	const p2: Vector = [minX + dx / 2, maxY + deltaMax];
	const p3: Vector = [maxX + deltaMax, minY - deltaMax];

	/** @type {Triangle[]} */
	let triangles: Triangle[] = [[{ pos: p1, vec: [0, 0], id: -1 }, { pos: p2, vec: [0, 0], id: -2 }, { pos: p3, vec: [0, 0], id: -3 }]];

	// Insert points one by one
	for(const point of points){
		const badTris: Triangle[] = [];
		for(const triangle of triangles){
			if(inCircle(point, circumCircle(triangle))){
				badTris.push(triangle);
			}
		}

		// Find the polygon hole boundary (unique edges)
		const polygon: Point[][] = [];
		for(const bt of badTris){
			for(let i = 0; i < 3; i++){
				const edge: Edge = [bt[i], bt[(i + 1) % 3]]; // indexs [0, 1] -> [1, 2] -> [2, 0] - Clever Modulo
				let shared = false;
				
				for(const bt2 of badTris){
					if(bt === bt2) continue; // Skip if comparing to self
					
					for(let j = 0; j < 3; j++){
						const edge2: Edge = [bt2[j], bt2[(j + 1) % 3]]; // indexs [0, 1] -> [1, 2] -> [2, 0] - Clever Modulo
						if(edgeEqual(edge, edge2)) shared = true;
					}
				}
				
				if(!shared) polygon.push(edge);
			}
		}

		// Remove bad triangles
		triangles = triangles.filter(t => !badTris.includes(t));

		// Re-triangulate the hole with new point
		for(const pnt of polygon){
			triangles.push([pnt[0], pnt[1], point]);
		}
	}

	// Remove triangles that contain super-triangle vertices
	triangles = triangles.filter(t =>
		!t.some(v => (v.pos[X] === p1[X] && v.pos[Y] === p1[Y]) || (v.pos[X] === p2[X] && v.pos[Y] === p2[Y]) || (v.pos[X] === p3[X] && v.pos[Y] === p3[Y]))
	);

	return triangles;
}


/** ***********************/
/*                       */
/*    Helper Functions   */
/*                       */
/** ***********************/

/**
 * Wraps a number from min to max, so it will always be between or equal to them
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function wrap(value: number, min: number, max: number): number {
	if(value > max) return value - max;
	if(value < min) return value + max;
	return value;
}


/**
 * Normalise a Vector 
 *
 * @param {Vector} arr
 * @return {Vector}
 */
function normalise(arr: Vector): Vector {
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


/**
 * Generic Lerp function
 *
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @return {RGBColorString}
 */
function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}


/**
 * Lerps from color1 to color2
 *
 * @param {string} color1
 * @param {string} color2
 * @param {number} t
 * @return {RGBColorString}
 */
function lerpColor(color1: HEXColorString, color2: HEXColorString, t: number): RGBColorString {
	const c1 = parseInt(color1.slice(1), 16);
	const c2 = parseInt(color2.slice(1), 16);

	const r1 = (c1 >> 16) & 0xff;
	const g1 = (c1 >> 8) & 0xff;
	const b1 = c1 & 0xff;

	const r2 = (c2 >> 16) & 0xff;
	const g2 = (c2 >> 8) & 0xff;
	const b2 = c2 & 0xff;

	const r = Math.round(lerp(r1, r2, t));
	const g = Math.round(lerp(g1, g2, t));
	const b = Math.round(lerp(b1, b2, t));

	return `rgb(${r}, ${g}, ${b})`;
}



/** **********************/
/*                      */
/*    Draw Functions    */
/*                      */
/** **********************/


/**
 * Draws a circle at the point provided
 *
 * @param {Point} point
 */
function drawCircle(point: Point): void {
	const radius = 3;
	ctx.lineWidth = 1;
	ctx.lineCap = "round";
	ctx.strokeStyle = "black";
	ctx.fillStyle = "white";

	ctx.beginPath();
	ctx.arc(point.pos[X], point.pos[Y], radius, 0, 2 * Math.PI);
	ctx.fill();
	ctx.stroke();
}


/**
 * Draws a line from point1 to point2 in the color provided
 *
 * @param {Point} p1
 * @param {Point} p2
 * @param {RGBColorString} color
 */
function drawLine(p1: Point, p2: Point, color: RGBColorString){
	ctx.lineWidth = 0.8;
	// ctx.lineCap = "round";
	ctx.strokeStyle = color;

	ctx.beginPath();
	ctx.moveTo(p1.pos[X], p1.pos[Y]);
	ctx.lineTo(p2.pos[X], p2.pos[Y]);
	ctx.stroke();
}


/**
 * Creates a triangle given the 3 points provided
 *
 * @param {Point} p1
 * @param {Point} p2
 * @param {Point} p3
 * @return {HEXColorString}
 */
function drawTriangle(p1: Point, p2: Point, p3: Point): RGBColorString {
	const cx = (p1.pos[X] + p2.pos[X] + p3.pos[X]) / 3;
	const cy = (p1.pos[Y] + p2.pos[Y] + p3.pos[Y]) / 3;
	
	const t = ((cx / screenWidth) + (cy / screenHeight)) / 2;
	const color = lerpColor(TOP_LEFT_COLOR, BOT_RIGHT_COLOR, t);
	
	ctx.lineWidth = 3;
	ctx.lineCap = "round";
	ctx.strokeStyle = color;
	ctx.fillStyle = color;

	ctx.beginPath();
	ctx.moveTo(p1.pos[X], p1.pos[Y]);
	ctx.lineTo(p2.pos[X], p2.pos[Y]);
	ctx.lineTo(p3.pos[X], p3.pos[Y]);
	ctx.closePath();
	ctx.fill();
	
	return color;
}


/**
 * Generate a random int from min to max
 *
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min);
}


function main(){
	const body = document.querySelector("body") as HTMLBodyElement;
	const bodySize: Vector = [body.clientWidth, body.clientHeight];
	 
	// Set the canvas size to be the size of the page
	canvas.width = bodySize[X];
	canvas.height = bodySize[Y];
	
	const points: Point[] = [];

	// Make a bunch of points outside of bounds, with 0 velocity
	const topLeft: Point = { pos: [-border, -border], vec: [0, 0], id: 0 };
	const topMiddle: Point = { pos: [bodySize[X] / 2, -border], vec: [0, 0], id: 1 };
	const topRight: Point = { pos: [bodySize[X] + border, -border], vec: [0, 0], id: 2 };

	const middleLeft: Point = { pos: [-border, bodySize[Y] / 2], vec: [0, 0], id: 3 };
	const middleRight: Point = { pos: [bodySize[X] + border, bodySize[Y] / 2], vec: [0, 0], id: 4 };

	const bottomLeft: Point = { pos: [-border, bodySize[Y]], vec: [0, 0], id: 5 };
	const bottomMiddle: Point = { pos: [bodySize[X] / 2, -border], vec: [0, 0], id: 6 };
	const bottomRight: Point = { pos: [bodySize[X] + border, bodySize[Y] + border], vec: [0, 0], id: 7 };
	
	// Add em all in, so that the moving points can connect to em
	points.push(topLeft, topMiddle, topRight, middleLeft, middleRight, bottomLeft, bottomMiddle, bottomRight);

	const min = [-border, -border];
	const max = [bodySize[X] + border, bodySize[Y] + border];

	// Generate random points, with random velocities, then randomise their speed a smidge
	for(let i = 0; i < maxPoints; i++){
		const xPos = randomInt(min[X], max[X]);
		const yPos = randomInt(min[Y], max[Y]);

		let xVel = 0;
		let yVel = 0;

		while(xVel + yVel === 0){
			xVel = randomInt(-1000, 1000);
			yVel = randomInt(-1000, 1000);
		}

		const randomSpeed = (randomInt(0, 50) + 100) / 100;
		const normalised: Vector = normalise([xVel, yVel]);
		normalised[X] *= randomSpeed;
		normalised[Y] *= randomSpeed;
		
		const point: Point = { pos: [xPos, yPos], vec: normalised, id: i };

		points.push(point);
	}

	
	/* Debug Stuff */
	// const triangles = delaunay(points);
	// console.log("Points:");
	// console.log(points);
	// console.log("Triangles:");
	// console.log(triangles);
	// console.log("Triangle:");
	// console.log(triangles[0]);
	// console.log("Point:");
	// console.log(triangles[0][0]);

	
	// The main "loop"
	setInterval(() => {
		ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear

		// Move the points
		for(const point of points){
			if(isNaN(point.pos[X])) throw `Number is NaN - ${point.pos[X]}`;

			const newX = point.pos[X] + (point.vec[X] * SPEED);
			const newY = point.pos[Y] + (point.vec[Y] * SPEED);
			point.pos[X] = wrap(newX, min[X], max[X]);
			point.pos[Y] = wrap(newY, min[Y], max[Y]);
		}

		// Get the triangles & draw them
		const triangles = delaunay(points);
		for(const triangle of triangles){
			const point1 = triangle[0];
			const point2 = triangle[1];
			const point3 = triangle[2];
			const color: RGBColorString = drawTriangle(point1, point2, point3);

			// Draw some lines along the edges
			drawLine(point1, point2, color);
			drawLine(point2, point3, color);
			drawLine(point1, point3, color);
		}

		// for(const point of points){
		// 	drawCircle(point);
		// }

	}, 10);
}

main();