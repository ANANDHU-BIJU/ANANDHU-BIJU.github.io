/* three.js - 3D Interactive PCB Circuit Schematic Simulator */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    // Three.js Core Variables
    let scene, camera, renderer;
    let nodesMesh, tracesMesh, pulsesMesh;
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Mouse tracking for camera parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    
    // Circuit board parameters
    const nodeCount = 120;
    const nodesData = [];
    const tracesData = [];
    const pulsesData = [];
    const maxPulseCount = 35;
    
    // Buffer Arrays
    const nodePositions = new Float32Array(nodeCount * 3);
    const tracePositions = [];
    const traceColors = [];
    const pulsePositions = new Float32Array(maxPulseCount * 3);

    // Initialize WebGL Scene
    function init() {
        scene = new THREE.Scene();
        
        // Setup Perspective Camera
        camera = new THREE.PerspectiveCamera(45, width / height, 1, 4000);
        camera.position.z = 900;

        // Setup Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0); // transparent background

        // 1. GENERATE PCB CIRCUIT NODES (Solder Pads)
        // Position them on a modular grid to look like a circuit board layout
        const gridUnit = 100;
        for (let i = 0; i < nodeCount; i++) {
            const x = Math.round((Math.random() - 0.5) * 14) * gridUnit;
            const y = Math.round((Math.random() - 0.5) * 8) * gridUnit;
            const z = Math.round((Math.random() - 0.5) * 2) * 50; // flatter plane like a board

            nodesData.push({
                x: x,
                y: y,
                z: z,
                originalX: x,
                originalY: y,
                originalZ: z,
                pulseOffset: Math.random() * 10,
                connected: []
            });

            nodePositions[i * 3] = x;
            nodePositions[i * 3 + 1] = y;
            nodePositions[i * 3 + 2] = z;
        }

        // 2. CONNECT NODES WITH PCB TRACES (Lines)
        // Connect nodes that align horizontally, vertically, or at 45 degrees
        const maxDist = 220;
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                const dx = nodesData[i].x - nodesData[j].x;
                const dy = nodesData[i].y - nodesData[j].y;
                const dz = nodesData[i].z - nodesData[j].z;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                // Check distance and layout alignment (orthogonal or 45 degrees)
                const isOrthoOrDiag = dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy);
                
                if (dist < maxDist && isOrthoOrDiag && nodesData[i].connected.length < 3 && nodesData[j].connected.length < 3) {
                    nodesData[i].connected.push(j);
                    nodesData[j].connected.push(i);

                    tracesData.push({ from: i, to: j });

                    // Add trace line segment coordinates
                    tracePositions.push(nodesData[i].x, nodesData[i].y, nodesData[i].z);
                    tracePositions.push(nodesData[j].x, nodesData[j].y, nodesData[j].z);

                    // Purple trace color (thicker layout in CSS/Material)
                    // High opacity for clear visibility on light and dark backgrounds
                    traceColors.push(0.36, 0.14, 1.0); // purple
                    traceColors.push(0.36, 0.14, 1.0);
                }
            }
        }

        // 3. GENERATE ELECTRON SIGNAL PULSES
        for (let i = 0; i < maxPulseCount; i++) {
            // Pick a random starting node that has connections
            let startNode = Math.floor(Math.random() * nodeCount);
            while (nodesData[startNode].connected.length === 0) {
                startNode = Math.floor(Math.random() * nodeCount);
            }

            const nextNode = nodesData[startNode].connected[0];

            pulsesData.push({
                currNode: startNode,
                nextNode: nextNode,
                progress: Math.random(),
                speed: 0.008 + Math.random() * 0.012
            });
        }

        // --- MESH CREATION & STYLING ---

        // A. Solder Pads (Nodes) - Custom circular program texture
        const padsGeometry = new THREE.BufferGeometry();
        padsGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

        const padsMaterial = new THREE.PointsMaterial({
            color: 0x5d25ff, // Accent purple
            size: 8, // Thicker dots
            map: createDotTexture(),
            transparent: true,
            blending: THREE.NormalBlending, // Normal blending to remain fully visible on white background!
            depthWrite: false,
            opacity: 0.85
        });

        nodesMesh = new THREE.Points(padsGeometry, padsMaterial);
        scene.add(nodesMesh);

        // B. Copper Traces (Lines)
        const tracesGeometry = new THREE.BufferGeometry();
        tracesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(tracePositions, 3));
        tracesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(traceColors, 3));

        const tracesMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            blending: THREE.NormalBlending, // Normal blending for contrast on white
            depthWrite: false,
            opacity: 0.45, // Thicker visibility
            linewidth: 1.5 // note: linewidth > 1 usually ignored by WebGL, but good practice
        });

        tracesMesh = new THREE.LineSegments(tracesGeometry, tracesMaterial);
        scene.add(tracesMesh);

        // C. Electric Pulses (Signal Electrons) - Bright glowing cyan/white dots
        const pulsesGeometry = new THREE.BufferGeometry();
        pulsesGeometry.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3));

        const pulsesMaterial = new THREE.PointsMaterial({
            color: 0x00f5ff, // Cyan electric glow
            size: 6,
            map: createDotTexture(),
            transparent: true,
            blending: THREE.NormalBlending,
            depthWrite: false,
            opacity: 0.95
        });

        pulsesMesh = new THREE.Points(pulsesGeometry, pulsesMaterial);
        scene.add(pulsesMesh);

        // Listeners
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('mousemove', onMouseMove);
        
        animate();
    }

    // Dot canvas texture helper
    function createDotTexture() {
        const size = 16;
        const canvasSize = document.createElement('canvas');
        canvasSize.width = size;
        canvasSize.height = size;
        const ctx = canvasSize.getContext('2d');

        const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        return new THREE.CanvasTexture(canvasSize);
    }

    function onMouseMove(e) {
        targetMouseX = (e.clientX / width - 0.5) * 80;
        targetMouseY = -(e.clientY / height - 0.5) * 80;
    }

    function onWindowResize() {
        width = window.innerWidth;
        height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    // Main animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Camera parallax smoothing
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        
        camera.position.x = mouseX * 2.5;
        camera.position.y = mouseY * 2.5;
        camera.lookAt(scene.position);

        // Slowly float the circuit board in 3D space
        const time = Date.now() * 0.0005;
        nodesMesh.rotation.z = Math.sin(time * 0.2) * 0.04;
        tracesMesh.rotation.z = Math.sin(time * 0.2) * 0.04;
        pulsesMesh.rotation.z = Math.sin(time * 0.2) * 0.04;

        nodesMesh.rotation.x = Math.cos(time * 0.1) * 0.05;
        tracesMesh.rotation.x = Math.cos(time * 0.1) * 0.05;
        pulsesMesh.rotation.x = Math.cos(time * 0.1) * 0.05;

        // Update electric pulses signal positions along traces
        for (let i = 0; i < maxPulseCount; i++) {
            const p = pulsesData[i];
            p.progress += p.speed;

            // If signal reaches target node, select a new linked node
            if (p.progress >= 1.0) {
                p.progress = 0;
                p.currNode = p.nextNode;
                
                const currentConnections = nodesData[p.currNode].connected;
                if (currentConnections.length > 0) {
                    // Random pick next connected node
                    p.nextNode = currentConnections[Math.floor(Math.random() * currentConnections.length)];
                }
            }

            // Lerp position coordinate on line segment
            const nodeA = nodesData[p.currNode];
            const nodeB = nodesData[p.nextNode];
            
            if (nodeA && nodeB) {
                pulsePositions[i * 3] = nodeA.x + (nodeB.x - nodeA.x) * p.progress;
                pulsePositions[i * 3 + 1] = nodeA.y + (nodeB.y - nodeA.y) * p.progress;
                pulsePositions[i * 3 + 2] = nodeA.z + (nodeB.z - nodeA.z) * p.progress;
            }
        }

        // Notify WebGL update
        pulsesMesh.geometry.attributes.position.needsUpdate = true;
        
        renderer.render(scene, camera);
    }

    init();
});
