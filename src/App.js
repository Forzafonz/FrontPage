// "'yarn add @react-three/fiber' and 'yarn add three'"
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import React, { useRef, Suspense, useState, useEffect } from "react";
// "yarn add @react-three/drei"
import { Canvas } from "@react-three/fiber";
// "yarn add glslify babel-plugin-glsl"
import { OrbitControls, Reflector, Stars, PerspectiveCamera } from "@react-three/drei";
// "yarn add @react-three/cannon" - this one is for physics
import Particles from "./Components/Particles";
import Login from "./Components/Login";
import "./App.css";
import './main.scss'

const Collesium = () => {
  const [model, setModel] = useState()
  useEffect(() => {

    new GLTFLoader().load('/Colosseum/scene.gltf', setModel)
    
  }, [])
  console.log(model)
  return (
   model ? <primitive object = {model.scene} /> : null
  );
} 

const Statues = ({name, scale, position}) => {
  const [model, setModel] = useState()
  useEffect(() => {

    new GLTFLoader().load(`${name}`, setModel)
    
  }, [])
  console.log(model)
  return (
   model ? <primitive object = {model.scene} scale={scale} position={position}/> : null
  );
} 

function Ground() {

  return (
    <Reflector 
      blur={[512, 512]} // Blur ground reflections (width, heigt), 0 skips blur
      mixBlur={0.75} // How much blur mixes with surface roughness
      mixStrength={0.75} // Strength of the reflections
      resolution={1024} // Off-buffer resolution, lower=faster, higher=better quality
      mirror={1} // Mirror environment, 0 = texture colors, 1 = pick up env colors
      minDepthThreshold={0.25}
      maxDepthThreshold={1}
      depthScale={100}
      args={[10, 10]} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position = {[0, -0.136, 0]}>
      {(Material, props) => <Material metalness={0.5} roughness={1}{...props} />}
    </Reflector>
  )
}

const Scene = () => {
  const mouse = useRef([0, 0])
  return (
    <Canvas 
    camera={{ fov: 10, position: [2,2, 5] }}
    onCreated={({ gl }) => {
      gl.setClearColor(new THREE.Color('#020207'))
    }}
    >
     
      <color attach="background" args={"black"} />
      <pointLight intensity={0.2} color="white" />
      <ambientLight intensity={0.5} />
      <spotLight intensity={1} position={[30, 30, 30]} color="white" />
      <PerspectiveCamera makeDefault position={[2, 2, 5]} fov={10}>
      </PerspectiveCamera>
      <Stars radius={100} depth={100} count={5000} factor={4} saturation={0} fade />
      <fog attach = "fog" args = {["black", 5, 10]}/>
      <Particles count={5000} mouse = {mouse}/>
      <Suspense fallback={null}>
      <Ground />
      <Statues name = {'/Statue1/scene.gltf'} scale={[0.007,0.007,0.007]} position={[0.5, -0.05, 0]}/>
      <Statues name = {'/Statue2/scene.gltf'} scale={[0.000010,0.000010,0.000010]} position={[-0.5, 0.01, 0]}/>
      <Collesium />
      </Suspense>
      <OrbitControls autoRotate  enableZoom={true} maxPolarAngle={Math.PI / 2} />
    </Canvas>
  );
};


const App = () => {
  
  return (
    <>
      <div className = "name">Colosseum</div>
      <Scene />
    </>
  );
};

export default App;
