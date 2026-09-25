/* ============================================================
   Danielle Insights - Shared Three.js Interactive Background
   Floating geometric icons (C++, Java, .json, Python, Data).
   Shared across every page (Req 5). Includes mouse interaction,
   click pulse, and responsive resize (Req 10).
   ============================================================ */
(function () {
    var canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Set camera distance; responsive adjustment happens in handleResize
    camera.position.z = 12;

    // Icon definitions: shapes for C++, Java, .json, Python, Data (no text)
    var icons = [
        { shape: 'box', color: 0x0f62fe },   // C++ (blue)
        { shape: 'sphere', color: 0xff6600 }, // Java (orange)
        { shape: 'torus', color: 0xffcc00 },  // .json (yellow)
        { shape: 'sphere', color: 0x00cc88 }, // Python (green)
        { shape: 'cone', color: 0x9933ff },   // Data (purple)
        { shape: 'box', color: 0x0f62fe },
        { shape: 'sphere', color: 0xff6600 },
        { shape: 'torus', color: 0xffcc00 },
        { shape: 'sphere', color: 0x00cc88 },
        { shape: 'cone', color: 0x9933ff }
    ];

    var objects = [];
    icons.forEach(function (item) {
        var geometry;
        switch (item.shape) {
            case 'box':    geometry = new THREE.BoxGeometry(1, 1, 1); break;
            case 'sphere': geometry = new THREE.SphereGeometry(0.7, 32, 32); break;
            case 'torus':  geometry = new THREE.TorusGeometry(0.6, 0.25, 16, 32); break;
            case 'cone':   geometry = new THREE.ConeGeometry(0.5, 1, 32); break;
        }
        var material = new THREE.MeshPhongMaterial({
            color: item.color,
            emissive: item.color,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.8
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 6
        );
        mesh.userData = { speed: 0.002 + Math.random() * 0.004, rotSpeed: 0.005 + Math.random() * 0.01 };
        objects.push(mesh);
        scene.add(mesh);
    });

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Mouse interaction
    var mouse = { x: 0, y: 0 };
    document.addEventListener('mousemove', function (e) {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Click pulse
    canvas.addEventListener('click', function () {
        objects.forEach(function (obj) {
            obj.scale.set(1.4, 1.4, 1.4);
            setTimeout(function () { obj.scale.set(1, 1, 1); }, 300);
        });
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        objects.forEach(function (obj) {
            obj.rotation.x += obj.userData.rotSpeed * (1 + mouse.x * 0.5);
            obj.rotation.y += obj.userData.rotSpeed * (1 + mouse.y * 0.5);
            obj.position.y += Math.sin(Date.now() * 0.001 + obj.userData.speed) * 0.003;
            obj.position.x += Math.cos(Date.now() * 0.001 + obj.userData.speed) * 0.002;
        });
        renderer.render(scene, camera);
    }

    // Resize (Req 10): scale canvas + tweak camera for mobile legibility
    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        // Pull slightly closer on small screens so the icons remain visible
        camera.position.z = window.innerWidth < 768 ? 8 : 12;
    }
    window.addEventListener('resize', handleResize);

    animate();
})();