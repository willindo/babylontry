import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import FireProcedural from './components/FireProcedural'
import Textures from './components/Textures'
import ColorGrading from './components/ColorGrading'
import PBR from './components/Pbr'
import DynamicConfig from './components/DynamicConfig'
import MultiGlowLayer from './components/MultiGlowLayer'
import BabylonScene from './components/BabylonScene'
import Particle from './components/Particle'
import Fluidparticle from './components/Fluidparticle'
import Waveflat from './components/Waveflat'
import Waterpool from './components/Waterpool'
import Tryshader from './components/Tryshader'
import Particle1 from './components/Particle1'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Particle1/>

    {/* <Waterpool/> */}
    <Fluidparticle/>
    <Tryshader/>
    {/* <Waveflat/>   */}
    <Particle/>
     {/* <BabylonScene/> */}
     <FireProcedural/>
     <Textures/> 
     <ColorGrading/>
      <PBR/>
     <MultiGlowLayer/>
     <DynamicConfig/>
    </>
  )
}

export default App
