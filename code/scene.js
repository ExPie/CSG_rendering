function createSphere(o, c, r, a) {
	return {
		type: "sphere",
		org: o,
		col: c,
		rad: r,

		ambient: a,
		n: 1
	};
}

function createLight(o) {
	return {
		org: o
	};
}

function createCSG(op, s1, s2) {
	if(op == "sub") negateNormals(s2);
	return {
		type: op, // add,sub,cross
		s1: s1,
		s2: s2,
		n: 1
	};
}


// ----- TEST SCENE 1 BALL -----
function createScene1() {
	var s = {};
	
	var cam = {
		org: Vec.vec(0, 0, 10),
		dir: Vec.vec(0, 0, -1),
		fov: 60
	};

	var obj = [
		createSphere(Vec.vec(0, 0, 0), Vec.vec(0.9, 0.0, 0.1), 2, 0.1),
		createSphere(Vec.vec(3, 0, 2), Vec.vec(0.1, 0.0, 0.9), 2, 0.1)
	];

	var li = [
		createLight(Vec.vec(1, 1, 20))
	];

	s.camera = cam;
	s.objects = obj;
	s.lights = li;
	return s;
}

function createScene2() {
	var s = {};
	
	var cam = {
		org: Vec.vec(0, 0, 7),
		dir: Vec.vec(0, 0, -1),
		fov: 60
	};

	obj1 = createCSG(
			"cross",
			createSphere(Vec.vec(-1, 0, 0), Vec.vec(0.9, 0.0, 0.1), 2, 0.1),
			createSphere(Vec.vec(0.5, 0, 0), Vec.vec(0.1, 0.0, 0.9), 2, 0.1));

	obj2 = createCSG(
			"cross",
			obj1,
			createSphere(Vec.vec(0.0, -1, 0), Vec.vec(0.05, 0.9, 0.05), 2, 0.1)
		);

	var obj = [
		createCSG(
			"sub",
			obj2,
			createSphere(Vec.vec(0.5, 1, 1), Vec.vec(0.4, 0.4, 0.1), 1, 0.1)
		)
	];

	var li = [
		createLight(Vec.vec(1, 1, 20))
	];

	s.camera = cam;
	s.objects = obj;
	s.lights = li;
	return s;
}

function createScene3() {
	var s = {};
	
	var cam = {
		org: Vec.vec(0, 0, 7),
		dir: Vec.vec(0, 0, -1),
		fov: 60
	};

	obj1 = createCSG(
			"add",
			createSphere(Vec.vec(1.1, 0, 0), Vec.vec(0.9, 0.0, 0.1), 1.2, 0.1),
			createSphere(Vec.vec(-1.1, 0, 0), Vec.vec(0.9, 0.0, 0.1), 1.2, 0.1));

	obj2 = createCSG(
			"add",
			createSphere(Vec.vec(0, 0, 1.1), Vec.vec(0.9, 0.0, 0.1), 1.2, 0.1),
			createSphere(Vec.vec(0, 0, -1.1), Vec.vec(0.9, 0.0, 0.1), 1.2, 0.1)
		);

	obj3 = createCSG(
			"add",
			obj1,
			obj2
		);

	var obj = [
		createCSG(
			"sub",
			createSphere(Vec.vec(0, 0, 0), Vec.vec(0.1, 0.1, 0.8), 2, 0.1),
			obj3
		)
	];

	var li = [
		createLight(Vec.vec(1, 1, 20))
	];

	s.camera = cam;
	s.objects = obj;
	s.lights = li;
	return s;
}


function negateNormals(csg) {
	switch(csg.type) {
		case "sphere":
			csg.n *= -1;
			break;
		case "cross":
			negateNormals(csg.s2);
			negateNormals(csg.s1);
			break;
		case "add":
			negateNormals(csg.s2);
			negateNormals(csg.s1);
			break;
		case "sub":
			negateNormals(csg.s2);
	}
} 



// intersect functions

function CsgIntersection(csg, ray) {
	switch(csg.type) {
		case "sphere":
			return [sphereIntersection(csg, ray)];
		case "cross":
			return iCrossMul(CsgIntersection(csg.s1, ray), 
							 CsgIntersection(csg.s2, ray));
		case "add":
			return iAddMul(CsgIntersection(csg.s1, ray), 
							 CsgIntersection(csg.s2, ray));
		case "sub":
			return iSubMul(CsgIntersection(csg.s1, ray), 
							 CsgIntersection(csg.s2, ray));
	}
}

function sphereIntersection(sphere, ray) {
    var eye_to_center = Vec.sub(sphere.org, ray.point),
        v = Vec.dot(eye_to_center, ray.vector),
        eoDot = Vec.dot(eye_to_center, eye_to_center),
        discriminant = (sphere.rad * sphere.rad) - eoDot + (v * v);
    if (discriminant < 0) {
        return null;
    } else {
        return [v - Math.sqrt(discriminant), v + Math.sqrt(discriminant), sphere];
    }
}


function sphereNormal(sphere, pos) {
	if(sphere.n == -1) return Vec.neg(Vec.norm(Vec.add(pos, Vec.neg(sphere.org))));
	else return Vec.norm(Vec.add(pos, Vec.neg(sphere.org)));
}


// interval helpers

function iCross(i1, i2) {
	if( i1 == null || i2 == null ||
		i2[0] > i1[1] || i1[0] > i2[1]) return null;
	return [Math.max(i1[0], i2[0]), 
			Math.min(i1[1], i2[1]), 
			i1[0] > i2[0] ? i1[2] : i2[2]];
}

function iSub(i1, i2) {
	var res = [];

	if (i1[0] < i2[0]) {
		var p = [i1[0], Math.min(i1[1], i2[0]), i1[2]];
		res.push(p);
	}

	if (i1[1] > i2[1]) {
		var p = [Math.max(i1[0], i2[1]), i1[1], i2[2]];
		res.push(p);
	}

	if(res[0] == undefined) return null;
	return res;
}

function iAdd(i1, i2) {
	if(i2[0] > i1[1] || i1[0] > i2[1]) return [i1, i2];
	return [[Math.min(i1[0], i2[0]), Math.max(i1[1], i2[1])]];	
}

function iCrossMul(is1, is2) {
	res = [];
	for(var i = 0; i < is1.length; i++) {
		for(var j = 0; j < is2.length; j++) {
			var c = iCross(is1[i], is2[j]);
			if(c != null) {
				res.push(c);
			}
		}
	}
	if(res[0] == undefined) return [null];
	return res;
}

function iSubMul(is1, is2) {
	var res = is1;

	for(var i = 0; i < is2.length; i++) {
		res = iSubOne(res, is2[i]);
	}

	return iAddMul(res, []);
}

function iSubOne(is, sa) {
	if(sa == null) return is;
	var res = [];

	is = is.filter(function (e) {
		return e != null;
	});

	is.sort(function(a, b) {
		return a[0] - b[0];
	});

	for(var i = 0; i < is.length; i++) {
		var ic = iSub(is[i], sa);
		if(ic == null) continue;
		res = res.concat(ic);
	}

	return res;
}

function iAddMul(is1, is2) {
	var arr = is1.concat(is2);

	arr = arr.filter(function (e) {
		return e != null;
	});

	arr.sort(function(a, b) {
		return a[0] - b[0];
	});

	var res = [arr[0]];

	for(var i = 1; i < arr.length; i++) {
		if(res[res.length-1][1] < arr[i][0])
			res.push(arr[i]);
		else if(res[res.length-1][1] == arr[i][0])
			res[res.length-1][1] = arr[i][1];
		if(arr[i][1] > res[res.length-1][1])
			res[res.length-1][1] = arr[i][1];
	}

	if(res[0] == undefined) return [null];
 	return res;
}

function findMin(is) {
	if(is.length == 0) return null;

	var minIndex = 0;
	for(var i = 0; i < is.length; i++) {
		if(is[i][0] < is[minIndex]) {
			minIndex = i;
		}
	}

	return i;
}



