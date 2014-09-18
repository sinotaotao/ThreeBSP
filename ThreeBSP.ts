///<reference path="three.d.ts"/>


// Constants...
var
	EPSILON:number = 1e-5,
	COPLANAR:number = 0,
	FRONT:number = 1,
	BACK:number = 2,
	SPANNING:number = 3;

class ThreeBSP
{

	public tree:ThreeBSP.Node;
	public matrix:THREE.Matrix4;


	constructor(geometry:THREE.Geometry, matrix?:THREE.Matrix4);
	constructor(geometry:ThreeBSP.Node, matrix?:THREE.Matrix4);
	constructor(geometry:any, matrix?:THREE.Matrix4)
	{

		// Convert THREE.Geometry to ThreeBSP)
		if(geometry instanceof THREE.Geometry)
		{
			this.matrix = matrix || new THREE.Matrix4();
		}
		else if(geometry instanceof THREE.Mesh)
		{
			// #todo: add hierarchy support
			geometry.updateMatrix();
			this.matrix = geometry.matrix.clone();
			geometry = geometry.geometry;
		}
		else if(geometry instanceof ThreeBSP.Node)
		{
			this.tree = geometry;
			this.matrix = matrix || new THREE.Matrix4();
			return this;
		} else
		{
			throw 'ThreeBSP: Given geometry is unsupported';
		}

		matrix = this.matrix;

		var i, _length_i,
			face, vertex, faceVertexUvs, uvs,
			polygon,
			polygons = [];

		for(i = 0, _length_i = geometry.faces.length; i<_length_i; i++)
		{
			face = geometry.faces[i];
			faceVertexUvs = geometry.faceVertexUvs[0][i];
			polygon = new ThreeBSP.Polygon;

			if(face instanceof THREE.Face3)
			{
				vertex = geometry.vertices[ face.a ];
				uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y) : null;
				vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[0], uvs);
				vertex.applyMatrix4(matrix);
				polygon.vertices.push(vertex);

				vertex = geometry.vertices[ face.b ];
				uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y) : null;
				vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[2], uvs);
				vertex.applyMatrix4(matrix);
				polygon.vertices.push(vertex);

				vertex = geometry.vertices[ face.c ];
				uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y) : null;
				vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[2], uvs);
				vertex.applyMatrix4(matrix);
				polygon.vertices.push(vertex);
			} else if(typeof THREE.Face3)
			{
				vertex = geometry.vertices[ face.a ];
				uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y) : null;
				vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[0], uvs);
				vertex.applyMatrix4(matrix);
				polygon.vertices.push(vertex);

				vertex = geometry.vertices[ face.b ];
				uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y) : null;
				vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[1], uvs);
				vertex.applyMatrix4(this.matrix);
				polygon.vertices.push(vertex);

				vertex = geometry.vertices[ face.c ];
				uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y) : null;
				vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[2], uvs);
				vertex.applyMatrix4(matrix);
				polygon.vertices.push(vertex);

				vertex = geometry.vertices[ face.d ];
				uvs = faceVertexUvs ? new THREE.Vector2(faceVertexUvs[3].x, faceVertexUvs[3].y) : null;
				vertex = new ThreeBSP.Vertex(vertex.x, vertex.y, vertex.z, face.vertexNormals[3], uvs);
				vertex.applyMatrix4(matrix);
				polygon.vertices.push(vertex);
			} else
			{
				throw 'Invalid face type at index ' + i;
			}

			polygon.calculateProperties();
			polygons.push(polygon);
		}


		this.tree = new ThreeBSP.Node(polygons);
	}

	subtract(other_tree:ThreeBSP):ThreeBSP
	{
		var a = this.tree.clone(),
			b = other_tree.tree.clone();

		a.invert();
		a.clipTo(b);
		b.clipTo(a);
		b.invert();
		b.clipTo(a);
		b.clipTo(a);
		b.invert();
		a.build(b.allPolygons());
		a.invert();
		return new ThreeBSP(a, this.matrix);
	}

	union(other_tree:ThreeBSP):ThreeBSP
	{
		var a = this.tree.clone(),
			b = other_tree.tree.clone();

		a.clipTo(b);
		b.clipTo(a);
		b.invert();
		b.clipTo(a);
		b.invert();
		a.build(b.allPolygons());
		return new ThreeBSP(a, this.matrix);
	}

	intersect(other_tree:ThreeBSP):ThreeBSP
	{
		var a = this.tree.clone(),
			b = other_tree.tree.clone();

		a.invert();
		b.clipTo(a);
		b.invert();
		a.clipTo(b);
		b.clipTo(a);
		a.build(b.allPolygons());
		a.invert();
		return new ThreeBSP(a, this.matrix);
	}
	toGeometry():THREE.Geometry
	{
		var
			matrix = new THREE.Matrix4().getInverse(this.matrix),
			geometry = new THREE.Geometry(),
			polygons = this.tree.allPolygons(),
			polygon_count = polygons.length,
			polygon, polygon_vertice_count,
			vertice_dict = {},
			vertex_idx_a, vertex_idx_b, vertex_idx_c,
			vertex, face,
			verticeUvs;

		for(var i = 0; i<polygon_count; i++)
		{
			polygon = polygons[i];
			polygon_vertice_count = polygon.vertices.length;

			for(var j = 2; j<polygon_vertice_count; j++)
			{
				verticeUvs = [];

				vertex = polygon.vertices[0];
				verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
				vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
				vertex.applyMatrix4(matrix);

				if(typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ]!=='undefined')
				{
					vertex_idx_a = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ];
				} else
				{
					geometry.vertices.push(vertex);
					vertex_idx_a = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1;
				}

				vertex = polygon.vertices[j - 1];
				verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
				vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
				vertex.applyMatrix4(matrix);
				if(typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ]!=='undefined')
				{
					vertex_idx_b = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ];
				} else
				{
					geometry.vertices.push(vertex);
					vertex_idx_b = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1;
				}

				vertex = polygon.vertices[j];
				verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
				vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
				vertex.applyMatrix4(matrix);
				if(typeof vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ]!=='undefined')
				{
					vertex_idx_c = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ];
				} else
				{
					geometry.vertices.push(vertex);
					vertex_idx_c = vertice_dict[ vertex.x + ',' + vertex.y + ',' + vertex.z ] = geometry.vertices.length - 1;
				}

				face = new THREE.Face3(
					vertex_idx_a,
					vertex_idx_b,
					vertex_idx_c,
					new THREE.Vector3(polygon.normal.x, polygon.normal.y, polygon.normal.z)
				);

				geometry.faces.push(face);
				geometry.faceVertexUvs[0].push(verticeUvs);
			}

		}
		return geometry;
	}

	toMesh(material:THREE.Material):THREE.Mesh
	{
		var geometry = this.toGeometry(),
			mesh = new THREE.Mesh(geometry, material);

		mesh.position.setFromMatrixPosition(this.matrix);
		mesh.rotation.setFromRotationMatrix(this.matrix, null);

		return mesh;
	}

}

// Extend sub classes..
module ThreeBSP {


	export class Polygon
	{
		constructor(
			public vertices:Vertex[] = [],
			public normal?:THREE.Vector3,
			public w?:number)
		{
			if(vertices.length>0)
			{
				this.calculateProperties();
			} else
			{
				this.normal = null;
				this.w = NaN;
			}
		}

		calculateProperties():Polygon
		{
			var a = this.vertices[0],
				b = this.vertices[1],
				c = this.vertices[2];

			this.normal =
				b.clone()
					.sub(a)
					.cross(
						c.clone()
							.sub(a)
				).normalize();

			this.w = this.normal
				.clone()
				.dot(a);

			return this;
		}

		clone():Polygon
		{
			var polygon = new Polygon();

			for(var i = 0, vertice_count = this.vertices.length; i<vertice_count; i++)
			{
				polygon.vertices.push(this.vertices[i].clone());
			}

			polygon.calculateProperties();

			return polygon;
		}

		flip():Polygon
		{
			var vertices = [];

			this.normal.multiplyScalar(-1);
			this.w *= -1;

			for(var i = this.vertices.length - 1; i>=0; i--)
			{
				vertices.push(this.vertices[i]);
			}

			this.vertices = vertices;

			return this;
		}

		classifyVertex(vertex:THREE.Vector3):number
		{
			var side_value = this.normal.dot(vertex) - this.w;

			if(side_value< -EPSILON)
			{
				return BACK;
			} else if(side_value>EPSILON)
			{
				return FRONT;
			} else
			{
				return COPLANAR;
			}
		}

		classifySide(polygon:Polygon):number
		{
			var vertex, classification,
				num_positive = 0,
				num_negative = 0,
				vertice_count = polygon.vertices.length;

			for(var i = 0; i<vertice_count; i++)
			{
				vertex = polygon.vertices[i];
				classification = this.classifyVertex(vertex);
				if(classification===FRONT)
				{
					num_positive++;
				} else if(classification===BACK)
				{
					num_negative++;
				}
			}

			if(num_positive>0 && num_negative===0)
			{
				return FRONT;
			} else if(num_positive===0 && num_negative>0)
			{
				return BACK;
			} else if(num_positive===0 && num_negative===0)
			{
				return COPLANAR;
			} else
			{
				return SPANNING;
			}
		}

		splitPolygon(polygon:Polygon, coplanar_front:Polygon[], coplanar_back:Polygon[], front:Polygon[], back:Polygon[])
		{
			var classification = this.classifySide(polygon);

			if(classification===COPLANAR)
			{

				( this.normal.dot(polygon.normal)>0 ? coplanar_front : coplanar_back ).push(polygon);

			} else if(classification===FRONT)
			{

				front.push(polygon);

			} else if(classification===BACK)
			{

				back.push(polygon);

			} else
			{

				var
					f = [],
					b = [];

				for(var i = 0, vertice_count = polygon.vertices.length; i<vertice_count; i++)
				{

					var
						j = (i + 1) % vertice_count,
						vi = polygon.vertices[i],
						vj = polygon.vertices[j],
						ti = this.classifyVertex(vi),
						tj = this.classifyVertex(vj);

					if(ti!=BACK) f.push(vi);
					if(ti!=FRONT) b.push(vi);
					if((ti | tj)===SPANNING)
					{
						var t = ( this.w - this.normal.dot(vi) ) / this.normal.dot(vj.clone().sub(vi));
						var v = vi.interpolate(vj, t);
						f.push(v);
						b.push(v);
					}
				}


				if(f.length>=3) front.push(new ThreeBSP.Polygon(f).calculateProperties());
				if(b.length>=3) back.push(new ThreeBSP.Polygon(b).calculateProperties());
			}
		}
	}

	export class Vertex extends THREE.Vector3
	{
		constructor(
			x:number, y:number, z:number,
			public normal:THREE.Vector3 = new THREE.Vector3(),
			public uv:THREE.Vector2 = new THREE.Vector2()
		)
		{
			super(x, y, z);
		}

		clone():Vertex
		{
			return new Vertex(this.x, this.y, this.z, this.normal.clone(), this.uv.clone());
		}

		interpolate( other:Vertex, t:number ):THREE.Vector3 { // Actually returns a Vertex but the base class types it as Vector3.
			return this.clone().lerp( other, t );
		}

	}

	export class Node
	{

		front:Node;
		back:Node;
		divider:Polygon;

		constructor(public polygons:Polygon[] = [])
		{
			if(polygons.length)
			{
				var front = [], back = [];

				this.divider = polygons[0].clone();

				for(var i = 0, polygon_count = polygons.length; i<polygon_count; i++)
				{
					this.divider.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
				}

				if(front.length>0)
				{
					this.front = new ThreeBSP.Node(front);
				}

				if(back.length>0)
				{
					this.back = new ThreeBSP.Node(back);
				}
			}
		}

		static isConvex(polygons:Polygon[]): boolean
		{
			var i, j;
			for(i = 0; i<polygons.length; i++)
			{
				for(j = 0; j<polygons.length; j++)
				{
					if(i!==j && polygons[i].classifySide(polygons[j])!==BACK)
					{
						return false;
					}
				}
			}
			return true;
		}

		get isConvex(): boolean
		{
			return Node.isConvex(this.polygons);
		}

		build(polygons:Polygon[]):void
		{
			var front = [], back = [];

			if(!this.divider)
			{
				this.divider = polygons[0].clone();
			}

			for(var i = 0, polygon_count = polygons.length; i<polygon_count; i++)
			{
				this.divider.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
			}

			if(front.length>0)
			{
				if(!this.front) this.front = new ThreeBSP.Node();
				this.front.build(front);
			}

			if(back.length>0)
			{
				if(!this.back) this.back = new ThreeBSP.Node();
				this.back.build(back);
			}
		}

		allPolygons():Polygon[]
		{
			var polygons = this.polygons.slice();
			if(this.front) polygons = polygons.concat(this.front.allPolygons());
			if(this.back) polygons = polygons.concat(this.back.allPolygons());
			return polygons;
		}

		clone():Node
		{
			var node = new ThreeBSP.Node();

			node.divider = this.divider.clone();
			node.polygons = this.polygons.map(function (polygon) { return polygon.clone(); });
			node.front = this.front && this.front.clone();
			node.back = this.back && this.back.clone();

			return node;
		}

		invert():Node
		{
			var i, polygon_count, temp;

			for(i = 0, polygon_count = this.polygons.length; i<polygon_count; i++)
			{
				this.polygons[i].flip();
			}

			this.divider.flip();
			if(this.front) this.front.invert();
			if(this.back) this.back.invert();

			temp = this.front;
			this.front = this.back;
			this.back = temp;

			return this;
		}

		clipPolygons(polygons):Polygon[]
		{


			if(!this.divider) return polygons.slice();

			var front:Polygon[] = [], back:Polygon[] = [];

			for(var i = 0, polygon_count = polygons.length; i<polygon_count; i++)
			{
				this.divider.splitPolygon(polygons[i], front, back, front, back);
			}

			if(this.front) front = this.front.clipPolygons(front);
			if(this.back) back = this.back.clipPolygons(back);
			else back = [];

			return front.concat(back);
		}

		clipTo(node):void
		{
			this.polygons = node.clipPolygons(this.polygons);
			if(this.front) this.front.clipTo(node);
			if(this.back) this.back.clipTo(node);
		}
	}

}

export = ThreeBSP;
