/// <reference path="three.d.ts" />
declare class ThreeBSP {
    public matrix: THREE.Matrix4;
    public tree: ThreeBSP.BSPNode;
    constructor(geometry: THREE.Mesh);
    constructor(geometry: THREE.Geometry, matrix?: THREE.Matrix4);
    constructor(geometry: ThreeBSP.BSPNode, matrix?: THREE.Matrix4);
    public subtract(other_tree: ThreeBSP): ThreeBSP;
    public union(other_tree: ThreeBSP): ThreeBSP;
    public intersect(other_tree: ThreeBSP): ThreeBSP;
    public toGeometry(): THREE.Geometry;
    public toMesh(material: THREE.Material): THREE.Mesh;
}
declare module ThreeBSP {
    class Polygon {
        public vertices: Vertex[];
        public normal: THREE.Vector3;
        public w: number;
        constructor(vertices?: Vertex[], normal?: THREE.Vector3, w?: number);
        public calculateProperties(): Polygon;
        public clone(): Polygon;
        public flip(): Polygon;
        public classifyVertex(vertex: Vertex): number;
        public classifySide(polygon: Polygon): number;
        public splitPolygon(polygon: Polygon, coplanar_front: Polygon[], coplanar_back: Polygon[], front: Polygon[], back: Polygon[]): void;
    }
    class Vertex extends THREE.Vector3 {
        public normal: THREE.Vector3;
        public uv: THREE.Vector2;
        constructor(x: number, y: number, z: number, normal?: THREE.Vector3, uv?: THREE.Vector2);
        public clone(): Vertex;
        public interpolate(other: THREE.Vector3, t: number): THREE.Vector3;
    }
    class BSPNode {
        public polygons: any;
        public front: any;
        public back: any;
        public divider: any;
        constructor(polygons?: any);
        static isConvex(polygons: Polygon[]): boolean;
        public build(polygons: Polygon[]): void;
        public allPolygons(): Polygon[];
        public clone(): BSPNode;
        public invert(): BSPNode;
        public clipPolygons(polygons: any): Polygon[];
        public clipTo(node: any): void;
    }
}
export = ThreeBSP;
