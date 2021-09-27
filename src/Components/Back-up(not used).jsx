import * as THREE from 'three'
import React, { useEffect, useRef, useMemo } from 'react'
import { extend, useFrame, useThree } from "@react-three/fiber"


// Makes these prototypes available as "native" jsx-string elements


export default function Swarm({ count }) {
  const mesh = useRef()
  const light = useRef()
  const { viewport, mouse } = useThree()

  const dummy = useMemo(() => new THREE.Object3D(), [])
  // Generate some random positions, speed factors and timings
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100
      const factor = 20 + Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const xFactor = -50 + Math.random() * 100
      const yFactor = -50 + Math.random() * 100
      const zFactor = -50 + Math.random() * 100
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 })
    }
    return temp
  }, [count])
  // The innards of this hook will run every frame
  useFrame((state) => {
    // Makes the light follow the mouse
    light.current.position.set((mouse.x * viewport.width) / 2, (mouse.y * viewport.height) / 2, 0)
    // Run through the randomized data to calculate some movement
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle
      // There is no sense or reason to any of this, just messing around with trigonometric functions
      t = particle.t += speed / 2
      const a = Math.cos(t) + Math.sin(t * 1) / 10
      const b = Math.sin(t) + Math.cos(t * 2) / 10
      const s = Math.cos(t)
      particle.mx += mouse.x * viewport.width * particle.mx * 0.01
      particle.my += mouse.y * viewport.height * particle.my * 0.01
      // Update the dummy object
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      )
      dummy.scale.set(s, s, s)
      dummy.rotation.set(s * 5, s * 5, s * 5)
      dummy.updateMatrix()
      // And apply the matrix to the instanced item
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <pointLight ref={light} distance={5} intensity={0.2} color="lightblue" />
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <sphereBufferGeometry attach = 'geometry' args={[0.6, 50, 50]}/>
        <meshStandardMaterial color="white" />
      </instancedMesh>
    </>
  )
}

const Wave = ({color}) => {
  const ref = useRef();
  useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()));

  const [image] = useLoader(THREE.TextureLoader, [
    "https://i.imgflip.com/5110mw.png"
  ]);

  return (
    <mesh>
      <sphereBufferGeometry attach = 'geometry' args={[1.5, 50, 50]}/>
      {/* <waveShaderMaterial ref={ref} opacity={0.1} transparent/> */}
      <meshPhongMaterial ref={ref} color="black" opacity={0.5}  transparent/>
    </mesh>
  );
};

const Plane = () => {
  const ref = useRef();
  useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()));

  // const [texture] = useLoader(THREE.TextureLoader, [
  //   "grasslight-big.jpg"
  // ]);

  return (
    <mesh rotation = {[-Math.PI / 2, 0, 0]} position = {[0, -0.136, 0]}>
      <planeBufferGeometry attach = 'geometry' args={[10, 10]}/>
      <meshPhongMaterial ref={ref} color = "black"/>
    </mesh>
  );
};





const Pulse = ({color}) => {
  const ref = useRef();
  useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()));

  const [image] = useLoader(THREE.TextureLoader, [
    "https://i.imgflip.com/5110mw.png"
  ]);

  return (
    <mesh>
      <sphereBufferGeometry attach = 'geometry' args={[0.1, 50, 50]}/>
      <waveShaderMaterial ref={ref} uColor = {"pink"}/>
    </mesh>
  );
};


const Box = ({position, color}) => {
  const mesh = useRef(null)
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.x += 0.03))
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01))
  return (
    <mesh ref = {mesh} position = {position}>
      <boxBufferGeometry attach = 'geometry' args={[1, 1, 1]}/>
      <meshStandardMaterial 
      attach = 'material' 
      color = {color}
      roughness={0.5}
      metalness={0.2}
      />
    </mesh>
  )
}



const WaveShaderMaterial = shaderMaterial(
  // Uniform - provides a way to send data from JS to shader. Used in both Vertex and Fragment Shader
  {
    uTime :0,
    uColor: new THREE.Color(0.0, 0.0, 0.0),
    uTexture: new THREE.Texture()
  },
  //  // Vertex Shader - shader that runs "first". It receives attributes and manipulates the position of each vortex.
  // It position the vertices of the geometry
  // gl_Position contains the position of the vertex on the screen
  // Varying allows us to send vertex coordinates (which are only available in Vertex shader) to our Fragment shader; uv is existing parameter which contains coordinates.
  glsl`
    precision mediump float;
    varying vec2 vUv;
    uniform float uTime;
    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

    void main() {
      vUv = uv;
      vec3 pos = position;
      float noiseFreq = 3.0;
      float noiseAmp = 0.08;
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
      pos.z += snoise3(noisePos) * noiseAmp;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragments Shader
  //preciosion mediump float defines precision that Fragment shader will use when calculating floats
  glsl`
    precision mediump float;
    uniform vec3 uColor;
    uniform float uTime;
    uniform sampler2D uTexture;
    varying vec2 vUv;


    void main(){
      vec3 texture = texture2D(uTexture, vUv).rgb;
      gl_FragColor = vec4(sin(uColor * uTime), 1.0);
    }
  `
);

extend({ WaveShaderMaterial });

const ThreeDText = () =>{

  const mesh = useRef()
  const [position, setPosition] = useState([0, 0.3, 0.5])
  const [texture, setTexture] = useState()
  const [wobble, setWobble] = useState(0)

  useFrame(() => {
     mesh.current.rotation.y = mesh.current.rotation.y -= 0.0035;
     mesh.current.geometry.center();
  })
  // parse JSON file with Three
  const font = new THREE.FontLoader().parse(JSONfont);

  const cf_texture = useLoader(THREE.TextureLoader, customTexture);
  cf_texture.wrapS = THREE.RepeatWrapping;
  cf_texture.wrapT = THREE.RepeatWrapping;
  cf_texture.repeat.set(10, 10);

  const cf_texture2 = useLoader(THREE.TextureLoader, customTexture2);
  cf_texture.wrapS = THREE.RepeatWrapping;
  cf_texture.wrapT = THREE.RepeatWrapping;
  cf_texture.repeat.set(10, 10);

  // configure font geometry
  const textOptions = {
    font,
    size: 0.1,
    height: 0.05
  };

  return (
    <group position = {position} 
    >

      <mesh ref = {mesh}
      onPointerOver={() => {
        setTexture(cf_texture2)
        setWobble(1)
      }}
      onPointerOut={() => {
      setTexture(cf_texture)
      setWobble(0)
      }} 
      onClick={(e) => alert('onClick mesh: ', e)} 
      >
      <pointLight distance={0.1} intensity={1} color="lightblue" />
      <textGeometry attach='geometry' args={['LOGIN', textOptions]} />
      {!wobble && <meshStandardMaterial attach='material' args={[{ map: texture || cf_texture }]}/>}
      {wobble && <MeshWobbleMaterial attach='material' map = {texture || cf_texture} factor={1} speed={5}/>}
      </mesh>
    </group>
  )

}