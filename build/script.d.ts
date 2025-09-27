type Vector = [number, number];
interface Point {
    pos: Vector;
    vec: Vector;
    id: number;
}
type Edge = [Point, Point];
type Triangle = [Point, Point, Point];
type HEXColorString = `#${string}`;
type RGBColorString = `rgb(${number}, ${number}, ${number})`;
interface Circle {
    x: number;
    y: number;
    r: number;
}
declare const screenWidth: number;
declare const screenHeight: number;
declare const maxPoints: number;
declare const SPEED: number;
declare const border = 200;
declare const X = 0;
declare const Y = 1;
declare const randomColorBlend: `#${string}`[][];
declare const ColorCombo: number;
declare const TOP_LEFT_COLOR: `#${string}`;
declare const BOT_RIGHT_COLOR: `#${string}`;
declare const canvas: HTMLCanvasElement;
declare const ctx: CanvasRenderingContext2D;
/**
 * Creates a circle in the center of the given 3 points
 *
 * @param {Triangle} triangle
 * @return {Circle}
 */
declare function circumCircle(triangle: Triangle): Circle;
/**
 * Checks if a point lies within a circle
 *
 * @param {Point} point
 * @param {Circle} circle
 * @return {boolean}
 */
declare function inCircle(point: Point, circle: Circle): boolean;
/**
 * Checks if an edge is equal to another
 *
 * @param {Edge} e1
 * @param {Edge} e2
 * @return {boolean}
 */
declare function edgeEqual(e1: Edge, e2: Edge): boolean;
/**
 * Bowyer-Watson
 *
 * @param {Point[]} points
 * @return {*}
 */
declare function delaunay(points: Point[]): Triangle[];
/** ***********************/
/** ***********************/
/**
 * Wraps a number from min to max, so it will always be between or equal to them
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
declare function wrap(value: number, min: number, max: number): number;
/**
 * Normalise a Vector
 *
 * @param {Vector} arr
 * @return {Vector}
 */
declare function normalise(arr: Vector): Vector;
/**
 * Generic Lerp function
 *
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @return {RGBColorString}
 */
declare function lerp(a: number, b: number, t: number): number;
/**
 * Lerps from color1 to color2
 *
 * @param {string} color1
 * @param {string} color2
 * @param {number} t
 * @return {RGBColorString}
 */
declare function lerpColor(color1: HEXColorString, color2: HEXColorString, t: number): RGBColorString;
/** **********************/
/** **********************/
/**
 * Draws a circle at the point provided
 *
 * @param {Point} point
 */
declare function drawCircle(point: Point): void;
/**
 * Draws a line from point1 to point2 in the color provided
 *
 * @param {Point} p1
 * @param {Point} p2
 * @param {RGBColorString} color
 */
declare function drawLine(p1: Point, p2: Point, color: RGBColorString): void;
/**
 * Creates a triangle given the 3 points provided
 *
 * @param {Point} p1
 * @param {Point} p2
 * @param {Point} p3
 * @return {HEXColorString}
 */
declare function drawTriangle(p1: Point, p2: Point, p3: Point, color: RGBColorString): void;
/**
 * Generate a random int from min to max
 *
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
declare function randomInt(min: number, max: number): number;
declare function main(): void;
