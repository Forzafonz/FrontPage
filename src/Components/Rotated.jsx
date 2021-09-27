// "'yarn add @react-three/fiber' and 'yarn add three'"
import * as THREE from "three";
import React, { useRef, Suspense, useState } from "react";
// "yarn add @react-three/drei"
import { Canvas, extend, useFrame, useLoader } from "@react-three/fiber";
// "yarn add glslify babel-plugin-glsl"
// "yarn add @react-three/cannon" - this one is for physics



export default function Rotated({position, colors}) {
  const mesh = useRef()
  const [state, setState] = useState({ isHovered: false, isActive: false })
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    mesh.current.position.x = Math.abs(position[0]) * Math.sin(time / 10)
    mesh.current.position.y = position[1]
    mesh.current.position.z = 2 * Math.cos(time / 10)
    mesh.current.rotation.z = 0
    mesh.current.rotation.x = 0
    mesh.current.rotation.y = 0
  })
  console.log(position)
  return (
    <mesh
      position = {position}
      ref={mesh}
      scale={[0.5, 0.5, 0.5]}
      onPointerOver={(e) => setState({ ...state, isHovered: true })}
      onPointerOut={(e) => setState({ ...state, isHovered: false })}>
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color = {colors} />
    </mesh>
  )
}