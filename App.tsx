import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const App: React.FC = () => {
  const mountRef1 = useRef<HTMLDivElement>(null);
  const mountRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef1.current || !mountRef2.current) {
        return;
    }

    const mount1 = mountRef1.current;
    const mount2 = mountRef2.current;
    let animationFrameId: number;

    // --- General Setup ---
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg');
    const earthSpecTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg');


    // --- Scene 1: Direct Sunlight ---
    const scene1 = new THREE.Scene();
    const camera1 = new THREE.PerspectiveCamera(75, mount1.clientWidth / mount1.clientHeight, 0.1, 1000);
    camera1.position.z = 5;
    const renderer1 = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer1.setSize(mount1.clientWidth, mount1.clientHeight);
    renderer1.setPixelRatio(window.devicePixelRatio);
    mount1.appendChild(renderer1.domElement);
    
    const controls1 = new OrbitControls(camera1, renderer1.domElement);
    controls1.enableDamping = true;
    controls1.dampingFactor = 0.05;
    controls1.minDistance = 3;
    controls1.maxDistance = 10;
    
    const earthGeo = new THREE.SphereGeometry(2, 32, 32);
    const earthMat1 = new THREE.MeshPhysicalMaterial({
        map: earthTexture,
        metalness: 0.2,
        roughness: 0.7,
        specularIntensityMap: earthSpecTexture
    });
    const earth1 = new THREE.Mesh(earthGeo, earthMat1);
    scene1.add(earth1);

    const sunLight = new THREE.DirectionalLight(0xffffff, 3.5);
    sunLight.position.set(5, 3, 5);
    scene1.add(sunLight);
    const ambientLight1 = new THREE.AmbientLight(0xffffff, 0.05);
    scene1.add(ambientLight1);


    // --- Scene 2: Reflected Moonlight ---
    const scene2 = new THREE.Scene();
    const camera2 = new THREE.PerspectiveCamera(75, mount2.clientWidth / mount2.clientHeight, 0.1, 1000);
    camera2.position.z = 5;
    const renderer2 = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer2.setSize(mount2.clientWidth, mount2.clientHeight);
    renderer2.setPixelRatio(window.devicePixelRatio);
    mount2.appendChild(renderer2.domElement);

    const controls2 = new OrbitControls(camera2, renderer2.domElement);
    controls2.enableDamping = true;
    controls2.dampingFactor = 0.05;
    controls2.minDistance = 3;
    controls2.maxDistance = 10;
    
    const earthMat2 = new THREE.MeshPhysicalMaterial({
        map: earthTexture,
        metalness: 0.2,
        roughness: 0.7,
        specularIntensityMap: earthSpecTexture
    });
    const earth2 = new THREE.Mesh(earthGeo, earthMat2);
    scene2.add(earth2);

    const moonGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
        color: 0x8c8c8c,
        roughness: 0.9
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    scene2.add(moon);
    
    const moonLight = new THREE.PointLight(0xffffff, 0.9, 100);
    moon.add(moonLight); 

    const ambientLight2 = new THREE.AmbientLight(0xffffff, 0.02);
    scene2.add(ambientLight2);


    // --- Animation & Resize ---
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      earth1.rotation.y = elapsedTime * 0.1;
      earth2.rotation.y = elapsedTime * 0.1;

      moon.position.x = Math.sin(elapsedTime * 0.5) * 3.5;
      moon.position.z = Math.cos(elapsedTime * 0.5) * 3.5;

      // Update controls
      controls1.update();
      controls2.update();

      renderer1.render(scene1, camera1);
      renderer2.render(scene2, camera2);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
        const width1 = mount1.clientWidth;
        const height1 = mount1.clientHeight;
        renderer1.setSize(width1, height1);
        camera1.aspect = width1 / height1;
        camera1.updateProjectionMatrix();

        const width2 = mount2.clientWidth;
        const height2 = mount2.clientHeight;
        renderer2.setSize(width2, height2);
        camera2.aspect = width2 / height2;
        camera2.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      controls1.dispose();
      mount1.removeChild(renderer1.domElement);
      renderer1.dispose();
      
      controls2.dispose();
      mount2.removeChild(renderer2.domElement);
      renderer2.dispose();
      
      earthGeo.dispose();
      earthMat1.dispose();
      earthMat2.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      earthTexture.dispose();
      earthSpecTexture.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white font-sans p-4">
      <div className="w-full max-w-6xl text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-indigo-400">Solar & Lunar Lighting on Earth</h1>
        <p className="mt-2 text-lg text-gray-400">A side-by-side comparison of direct vs. indirect (reflected) lighting.</p>
      </div>
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-center items-stretch gap-8">
        {/* Canvas 1: Direct Sunlight */}
        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white mb-2">Direct Sunlight</h2>
          <p className="text-sm text-gray-500 mb-2">Drag to rotate, scroll to zoom.</p>
          <div 
            ref={mountRef1} 
            className="w-full h-80 md:h-96 rounded-lg shadow-2xl shadow-indigo-500/10 cursor-grab active:cursor-grabbing"
            style={{ background: 'radial-gradient(circle, rgba(20,25,40,1) 0%, rgba(17,24,39,1) 100%)' }}
          />
        </div>
        {/* Canvas 2: Reflected Moonlight */}
        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white mb-2">Reflected Moonlight</h2>
          <p className="text-sm text-gray-500 mb-2">Drag to rotate, scroll to zoom.</p>
          <div 
            ref={mountRef2} 
            className="w-full h-80 md:h-96 rounded-lg shadow-2xl shadow-indigo-500/10 cursor-grab active:cursor-grabbing"
            style={{ background: 'radial-gradient(circle, rgba(20,25,40,1) 0%, rgba(17,24,39,1) 100%)' }}
          />
        </div>
      </div>
    </div>
  );
};

export default App;