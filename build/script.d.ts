declare const screenWidth: number;
declare const screenHeight: number;
declare const maxPoints = 100;
declare const border = 200;
declare const X = 0;
declare const Y = 1;
declare const SPEED = 0.05;
declare const TOP_LEFT_COLOR = "#B8FFBF";
declare const BOT_RIGHT_COLOR = "#004707";
declare const canvas: HTMLCanvasElement;
declare const ctx: CanvasRenderingContext2D;
declare const COLORS: string[];
type Vector = [number, number];
interface Point {
    pos: Vector;
    vec: Vector;
    id: number;
}
type Edge = [Point, Point];
type Triangle = [Point, Point, Point];
interface Circle {
    x: number;
    y: number;
    r: number;
}
declare function circumCircle(triangle: Triangle): Circle;
declare function inCircle(point: Point, circle: Circle): boolean;
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
declare function normalise(arr: Vector): Vector;
declare function lerp(a: number, b: number, t: number): number;
declare function lerpColor(color1: string, color2: string, t: number): string;
/** **********************/
/** **********************/
declare function drawCircle(point: Point): void;
declare function drawLine(p1: Point, p2: Point): void;
declare function drawTriangle(p1: Point, p2: Point, p3: Point): void;
/**
 * Generate a random int from min to max
 *
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
declare function randomInt(min: number, max: number): number;
declare function main(): void;
