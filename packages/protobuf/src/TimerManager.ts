type FrameDataCallback = (frameData: Array<{ id: number; value: number }>) => void
type Callback = (args?: any) => void

export class TimerManager {
  private dataArray: Array<{ id: number; value: number }> // 数据数组
  private frameSize: number // 每帧返回的数据量
  private interval: number // 每帧的时间间隔（毫秒）
  private currentIndex: number // 当前帧的起始索引
  private timer: ReturnType<typeof setInterval> | null // 定时器句柄
  isPaused: Boolean // 是否暂停
  private onFrame: (params: any) => void // 是否暂停
  private onComplete: Callback // 播放完成时回调函数，是否暂停
  private onProcess: Callback // 播放过程中回调函数

  constructor(dataArray = [], interval = 50, frameSize = 1) {
    this.dataArray = dataArray
    this.frameSize = frameSize
    this.interval = interval
    this.currentIndex = 0
    this.timer = null
    this.isPaused = false
    this.onFrame = () => {
      console.log('Frame updated')
    }
    this.onComplete = () => {
      console.log('Timer complete')
    }
    this.onProcess = (args?: any) => {
      console.log('Timer process', args)
    }
  }
  // 开始模拟 WebSocket 数据发送
  public connect(onFrame: FrameDataCallback, onProcess?: Callback, onComplete?: Callback): void {
    this.onFrame = onFrame || this.onFrame
    this.onProcess = onProcess || this.onProcess
    this.onComplete = onComplete || this.onComplete
    if (this.timer) {
      console.warn('Simulation is already running.')
      return
    }
    this.start()
  }
  public start(): void {
    const processFrame = () => {
      if (this.isPaused) return // 如果暂停，跳过处理
      if (this.currentIndex >= this.dataArray.length) {
        this.stop() // 停止定时器
        if (this.onComplete) this.onComplete() // 调用完成回调
        return
      }
      const frameData: any = this.dataArray.slice(this.currentIndex, this.currentIndex + this.frameSize) // 获取当前帧数据
      this.currentIndex += this.frameSize // 更新索引
      this.onFrame(frameData[0]) // 调用帧数据处理回调

      const currentSecond = Math.floor(this.currentIndex / this.interval)
      this.onProcess?.(currentSecond)
    }

    this.timer && clearInterval(this.timer)
    this.timer = setInterval(processFrame, 1000 / this.interval)
  }
  public startFrom(startSecond: number = 0) {
    this.currentIndex = startSecond * this.interval
    // this.isPaused = false
    this.start()
  }
  // 停止模拟
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
      this.isPaused = true
      console.log('Simulation stopped.')
    }
  }
  // 重置模拟器（可重新开始）
  public reset(): void {
    this.stop()
    this.currentIndex = 0
    this.isPaused = false
    this.start()
    console.log('Simulation reset.')
  }
  // 暂停模拟
  public pause(): void {
    if (this.timer) {
      this.isPaused = true // 设置暂停状态
      // console.log('Simulation paused.')
    } else {
      console.warn('Simulation is not running. Cannot pause.')
    }
  }

  // 继续模拟
  public resume(): void {
    if (this.timer && this.isPaused) {
      this.isPaused = false // 恢复非暂停状态
      // console.log('Simulation resumed.')
    } else {
      console.warn('Simulation is not running or already resumed.')
    }
  }
}
