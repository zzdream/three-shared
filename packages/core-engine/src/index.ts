// ========== 核心引擎类（主要 API）==========
export { ThreeEngine, type EngineOptions } from './engine'

// ========== 工具函数（独立 API）==========
// Camera Utils
export { calculateViewCenter, setupCameraAndControls, setCenterAndCamera } from './cameraUtils'

// Three.js Utils
export {
	createGroup,
	dreawPaking,
	createTexture,
	CrosswalkLineRoadMark,
	mergeGeometries,
	createGeometry,
	isHexColor,
	isRGBColor,
	createModelClone,
	MeshLineRoadMark,
} from './threejsUtils'

// Modal Loader
export {
  createModalFBX,
  createCacheModalFBX,
  createModalGLB,
  createCacheModalGLB,
} from './loadModal'

// ========== 其他类 ==========
export { GroundGrip, type GroundGripOptions } from './GroundGrip'

// ========== 类型定义 ==========
export type {
	SceneOptions,
	CameraOptions,
	RendererOptions,
	ControlsOptions,
	LightOptions,
	AnimateCallback,
} from './types/options'
export type { HDREnvironmentLoaderAdapter } from './types/adapter'

// ========== 工具函数 ==========
export { autoDetectHDREnvironmentLoaderAdapter } from './utils/adapterDetector'