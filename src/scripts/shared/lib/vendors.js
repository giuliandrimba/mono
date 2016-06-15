import WAGNER from '@superguigui/wagner';
window.WAGNER = WAGNER

require("scripts/shared/lib/three/shaders/CopyShader");;
require("scripts/shared/lib/three/shaders/DigitalGlitch");
require("scripts/shared/lib/three/shaders/FilmShader");
require("scripts/shared/lib/three/shaders/BleachBypassShader");
require("scripts/shared/lib/three/shaders/ConvolutionShader");

require("scripts/shared/lib/three/postprocessing/EffectComposer");
require("scripts/shared/lib/three/postprocessing/RenderPass");
require("scripts/shared/lib/three/postprocessing/MaskPass");
require("scripts/shared/lib/three/postprocessing/ShaderPass");
require("scripts/shared/lib/three/postprocessing/GlitchPass");
require("scripts/shared/lib/three/postprocessing/FilmPass");
require("scripts/shared/lib/three/postprocessing/BloomPass");
require("scripts/shared/lib/three/postprocessing/DotScreenPass");