interface Window {
  Module: {
    onRuntimeInitialized?: () => void | Promise<void>
    cwrap?: (name: string, returnType: string, argTypes: string[] | string) => (...args: any[]) => any
    _malloc?: (size: number) => number
    _free?: (ptr: number) => void
    lengthBytesUTF8?: (str: string) => number
    stringToUTF8?: (str: string, outPtr: number, maxBytesToWrite: number) => void
    [key: string]: any
  }
}

