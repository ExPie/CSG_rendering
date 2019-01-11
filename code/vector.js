var Vec = {};

Vec.UP_VEC = { x: 0, y: 1, z: 0};

Vec.COL_R = { x: 1, y: 0, z: 0};
Vec.COL_G = { x: 0, y: 1, z: 0};
Vec.COL_B = { x: 0, y: 0, z: 1};
Vec.COL_W = { x: 1, y: 1, z: 1};
Vec.COL_0 = { x: 0, y: 0, z: 0};

Vec.vec = function(x, y, z) {
	return { x: x, y: y, z: z };
}

Vec.neg = function(a) {
	return {
        x: -a.x,
        y: -a.y,
        z: -a.z
    };
}

Vec.add = function(a, b) {
	return {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z
    };
}

Vec.sub = function(a, b) {
	return Vec.add(a, Vec.neg(b));
}

Vec.scale = function(a, t) {
    return {
        x: a.x * t,
        y: a.y * t,
        z: a.z * t
    };
};

Vec.dot = function(a, b) {
	return a.x * b.x + a.y * b.y + a.z * b.z;
}

Vec.cross = function(a, b) {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
};

Vec.length = function(a) {
	return Math.sqrt(Vec.dot(a, a));
}

Vec.norm = function(a) {
    return Vec.scale(a, 1 / Vec.length(a));
};

Vec.reflect = function(a, n) {
    var d = Vec.scale(n, Vec.dot(a, n));
    return Vec.add(Vec.scale(d, 2), Vec.neg(a));
};
