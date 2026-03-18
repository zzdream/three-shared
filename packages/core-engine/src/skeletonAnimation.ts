import * as THREE from 'three'

/**
 * 在 FBX 根节点上创建 AnimationMixer 并播放；
 * mixer 和 actions 都挂到 userData，便于后续暂停 / 恢复 / 销毁
 */
export function attachFbxAnimationMixer(model: any) {
  if (!model?.animations?.length) return
  const mixer = new THREE.AnimationMixer(model)
  const actions: any[] = []
  model.animations.forEach((clip: any) => {
    const action = mixer.clipAction(clip)
    action.reset().play()
    actions.push(action)
  })
  if (!model.userData) model.userData = {}
  model.userData.animationMixer = mixer
  model.userData.animationActions = actions
}

/**
 * GLB：clips 通常来自 gltf.animations；克隆体需新 Mixer
 */
export function attachGlbAnimationMixer(model: any, clips?: any[]) {
  const list = clips?.length ? clips : model.animations
  if (!list?.length) return
  const mixer = new THREE.AnimationMixer(model)
  const actions: any[] = []
  list.forEach((clip: any) => {
    const action = mixer.clipAction(clip)
    action.reset().play()
    actions.push(action)
  })
  if (!model.userData) model.userData = {}
  model.userData.animationMixer = mixer
  model.userData.animationActions = actions
}

/**
 * 每帧在渲染前调用一次，更新场景中所有已挂载的骨骼动画 Mixer
 * @param delta 秒，建议 THREE.Clock.getDelta()
 */
export function updateSceneAnimationMixers(scene: any, delta: number) {
  if (!scene || delta == null || !Number.isFinite(delta) || delta < 0) return
  scene.traverse((obj: any) => {
    const m = obj.userData?.animationMixer
    if (m && typeof m.update === 'function') m.update(delta)
  })
}

/** 暂停某个模型（根节点）上的所有动画 */
export function pauseModelAnimation(model: any) {
  const actions: any[] | undefined = model?.userData?.animationActions
  if (!actions) return
  actions.forEach(action => action.paused = true)
}

/** 恢复播放某个模型上的所有动画 */
export function resumeModelAnimation(model: any) {
  const actions: any[] | undefined = model?.userData?.animationActions
  if (!actions) return
  actions.forEach(action => {
    action.paused = false
    if (!action.isRunning()) action.play()
  })
}

/**
 * 将模型中的所有 SkinnedMesh 恢复到绑定/默认姿态（bind pose）
 * 常用于暂停动画后让角色回到初始姿势，避免停在中间帧
 */
export function resetSkinnedMeshesToBindPose(object3D: any) {
  if (!object3D || typeof object3D.traverse !== 'function') return
  object3D.traverse((child: any) => {
    if (child?.isSkinnedMesh && typeof child.pose === 'function') {
      child.pose()
    }
  })
}

