var WIDTH, HEIGHT, ctx, img, scene;

function main() {
	var c = document.getElementById("canvas");
	WIDTH = c.width;
	HEIGHT = c.height;
	ctx = c.getContext("2d");
	img = ctx.getImageData(0, 0, WIDTH, HEIGHT);


	scene = createScene2();
	console.log(scene);

	render(scene);
}


function render(scene) {
    var camera = scene.camera, 
    	objects = scene.objects, 
    	lights = scene.lights;

    var eyeVec = Vec.norm(Vec.sub(camera.dir, camera.org)),
		vpRight = Vec.norm(Vec.cross(eyeVec, Vec.UP_VEC)),
	    vpUp = Vec.norm(Vec.cross(vpRight, eyeVec)),
	    fovRadians = Math.PI * (camera.fov / 2) / 180,
	    HEIGHTWidthRatio = HEIGHT / WIDTH,
	    halfWidth = Math.tan(fovRadians),
	    halfHeight = HEIGHTWidthRatio * halfWidth,
	    cameraWIDTH = halfWidth * 2,
	    cameraHEIGHT = halfHeight * 2,
	    pixelWidth = cameraWIDTH / (WIDTH - 1),
	    pixelHeight = cameraHEIGHT / (HEIGHT - 1);

    var index, color;
    var ray = {
        point: camera.org
    };

    for (var x = 0; x < WIDTH; x++) {
        for (var y = 0; y < HEIGHT; y++) {
            var xcomp = Vec.scale(vpRight, (x * pixelWidth) - halfWidth),
                ycomp = Vec.scale(vpUp, (y * pixelHeight) - halfHeight);

            ray.vector = Vec.norm(Vec.add(eyeVec, Vec.add(xcomp, ycomp)));

            color = trace(ray, scene, 0);
            index = (x * 4) + (y * WIDTH * 4),
            img.data[index + 0] = color.x * 255;
            img.data[index + 1] = color.y * 255;
            img.data[index + 2] = color.z * 255;
            img.data[index + 3] = 255;
        }
    }

    ctx.putImageData(img, 0, 0);
}

function trace(ray, scene) {

    var distObject = intersectScene(ray, scene);

    if (distObject[0] === Infinity) {
        return Vec.COL_0;
    }

    var dist = distObject[0],
        object = distObject[1];

    var pointAtTime = Vec.add(ray.point, Vec.scale(ray.vector, dist));

    return surface(ray, scene, object, pointAtTime, sphereNormal(object, pointAtTime));
}


function intersectScene(ray, scene) {
    var closest = [Infinity, null];
    for (var i = 0; i < scene.objects.length; i++) {
        var object = scene.objects[i];

        var dist = CsgIntersection(object, ray);
        if (dist != null && 
            dist[0] != null &&
            dist[0][0] < closest[0]) {
            closest = [dist[0][0], dist[0][2]];
        }
    }
    return closest;
}

function surface(ray, scene, object, pointAtTime, normal) {
    var b = object.col,
        lambertAmount = 0;

  
    for (var i = 0; i < scene.lights.length; i++) {
        var lightPoint = scene.lights[i];
        if (!isLightVisible(pointAtTime, scene, lightPoint)) continue;
        var contribution = Vec.dot(Vec.norm(
            Vec.sub(lightPoint.org, pointAtTime)), normal);

        if (contribution > 0) {
            lambertAmount += contribution;
        }
    }
    
    lambertAmount = Math.min(1, lambertAmount);

    return Vec.add(
                Vec.scale(b, lambertAmount * (1 - object.ambient) ),
                Vec.scale(b, object.ambient));
}

function isLightVisible(pt, scene, light) {
    var distObject =  intersectScene({
        point: pt,
        vector: Vec.norm(Vec.sub(pt, light.org))
    }, scene);
    return distObject[0] > -0.005;
}







// SLIDERS 

function updateSlider1(val) {
    scene.lights[0].org.x = (val - 50);
    console.log((val - 50));
    render(scene);
}

function updateSlider2(val) {
    scene.lights[0].org.y = (val - 50);
    console.log((val - 50));
    render(scene);
}

function updateSlider3(val) {
    scene.lights[0].org.z = (val - 50);
    console.log((val - 50));
    render(scene);
}


function updateSlider4(val) {
    scene.objects[0].s1.s1.s1.org.x = (val - 100) / 50;
    console.log((val - 50));
    render(scene);
}

function updateSlider5(val) {
    scene.objects[0].s1.s1.s2.org.x = (val - 25) / 50;
    console.log((val - 50));
    render(scene);
}

function updateSlider6(val) {
    scene.objects[0].s1.s2.org.x = (val - 50) / 50;
    console.log((val - 50));
    render(scene);
}

function updateSlider7(val) {
    scene.objects[0].s2.org.x = (val - 25) / 50;
    console.log((val - 50));
    render(scene);
}


function updateSlider8(val) {
    var cam = scene.camera;
    var rad = val * Math.PI / 180;

    var x = -7 * Math.sin(rad);
    var z = -7 * Math.cos(rad);

    var no = Vec.vec(x, 0, z);

    cam.org = no;
    cam.dir = Vec.neg(no);

    render(scene);
}

